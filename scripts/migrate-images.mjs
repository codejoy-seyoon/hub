import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const BUCKET = "store-img";
const MAX_EDGE = 1600;
const QUALITY = 80;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Supabase URL / SERVICE_ROLE_KEY 누락 (.env 확인)");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
const root = process.cwd();

// --- ASCII 안전 키 생성 -------------------------------------------------
// 알려진 폴더는 깔끔한 이름으로, 그 외는 일반 슬러그 + 해시
const FOLDER_MAP = {
  "BNI goods 1차_리뉴얼 스튜디오 촬영버전": "renewal-1",
  "BNI goods 2차_리뉴얼 스튜디오 촬영버전": "renewal-2",
  bni_korea_goods_img: "goods",
};

function slug(s) {
  const nfc = s.normalize("NFC");
  let base = nfc
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const changed = base !== nfc;
  if (!base) base = "x";
  if (changed) {
    const h = crypto.createHash("md5").update(nfc).digest("hex").slice(0, 6);
    base += "-" + h;
  }
  return base;
}

function newKeyFor(origKey) {
  const parts = origKey.split("/");
  const file = parts.pop();
  const dirs = parts.map((d) => FOLDER_MAP[d] ?? slug(d));
  // 파일명: 확장자 분리 후 슬러그
  const ext = path.extname(file);
  const stem = file.slice(0, file.length - ext.length);
  const outExt = ext.toLowerCase() === ".jpeg" ? ".jpg" : ext.toLowerCase();
  const fileKey = slug(stem) + (outExt || "");
  return [...dirs, fileKey].join("/");
}

// --- 1) 매핑 작성 -------------------------------------------------------
const origKeys = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/_image-keys.json"), "utf8")
);
const map = {}; // origKey -> newKey
for (const k of origKeys) map[k] = newKeyFor(k);

// 충돌 검사
const seen = new Map();
for (const [o, n] of Object.entries(map)) {
  if (seen.has(n)) {
    console.error(`키 충돌: ${n}\n  ${seen.get(n)}\n  ${o}`);
    process.exit(1);
  }
  seen.set(n, o);
}
fs.writeFileSync(
  path.join(root, "scripts/_image-map.json"),
  JSON.stringify(map, null, 2)
);
console.log(`매핑 ${Object.keys(map).length}건 작성 (충돌 없음)`);

// --- 2) _products.json 갱신 --------------------------------------------
// 원본 img/images 값은 "folder/file" 또는 "plainfile"(=goods 폴더) 형태.
// productImg 의 기존 규칙과 동일하게 origKey 로 환산 후 newKey 로 치환.
function origKeyOf(file) {
  return file.includes("/") ? file : `bni_korea_goods_img/${file}`;
}
const productsPath = path.join(root, "lib/data/_products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
let replaced = 0;
function conv(file) {
  const ok = origKeyOf(file);
  const nk = map[ok];
  if (!nk) {
    console.warn(`  ! 매핑 없음(스킵): ${file}`);
    return file;
  }
  replaced++;
  return nk;
}
for (const p of products) {
  if (p.img) p.img = conv(p.img);
  if (Array.isArray(p.images)) p.images = p.images.map(conv);
}
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2) + "\n");
console.log(`_products.json 이미지 경로 ${replaced}건 갱신`);

// --- 3) 버킷 보장 + 업로드 ---------------------------------------------
async function ensureBucket() {
  const { data: list } = await supabase.storage.listBuckets();
  if (list?.some((b) => b.name === BUCKET)) {
    console.log(`버킷 '${BUCKET}' 이미 존재`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "10MB",
  });
  if (error) throw error;
  console.log(`버킷 '${BUCKET}' 생성 (public)`);
}

async function processOne(origKey) {
  const localPath = path.join(root, "public/store-img", origKey);
  const newKey = map[origKey];
  const ext = path.extname(origKey).toLowerCase();
  let body, contentType;
  if (ext === ".png") {
    body = await sharp(localPath)
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
    contentType = "image/png";
  } else {
    body = await sharp(localPath)
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
    contentType = "image/jpeg";
  }
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(newKey, body, { contentType, upsert: true });
  if (error) throw new Error(`${newKey}: ${error.message}`);
  return body.length;
}

async function main() {
  await ensureBucket();
  console.log(`\n업로드 ${origKeys.length}개 (긴 변 ${MAX_EDGE}px, 품질 ${QUALITY})\n`);
  let done = 0,
    totalBytes = 0;
  const failed = [];
  let idx = 0;
  const concurrency = 6;
  async function worker() {
    while (idx < origKeys.length) {
      const k = origKeys[idx++];
      try {
        totalBytes += await processOne(k);
        if (++done % 20 === 0 || done === origKeys.length)
          console.log(`  ${done}/${origKeys.length}`);
      } catch (e) {
        failed.push(`${k} :: ${e.message}`);
        console.error(`  ✗ ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(
    `\n완료: ${done}/${origKeys.length}, 총 ${(totalBytes / 1048576).toFixed(1)}MB`
  );
  if (failed.length) {
    console.log(`실패 ${failed.length}건:`);
    failed.forEach((f) => console.log("  " + f));
    process.exit(1);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
