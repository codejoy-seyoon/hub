// _products.json 외에 페이지에서 직접 참조하는 이미지(히어로 등)를 업로드.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const BUCKET = "store-img";
const MAX_EDGE = 1600;
const QUALITY = 80;
const root = process.cwd();

// goods 폴더 기준 원본 파일명 (page.tsx 에서 쓰던 것)
const EXTRA = [
  "bni_korea_goods_img/카라티 블랙.jpg",
  "bni_korea_goods_img/후드집업 앞.png",
  "bni_korea_goods_img/BNI Korea_자동 타이 (1).jpg",
];

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
  if (changed)
    base += "-" + crypto.createHash("md5").update(nfc).digest("hex").slice(0, 6);
  return base;
}
function newKeyFor(origKey) {
  const parts = origKey.split("/");
  const file = parts.pop();
  const dirs = parts.map((d) => FOLDER_MAP[d] ?? slug(d));
  const ext = path.extname(file);
  const stem = file.slice(0, file.length - ext.length);
  const outExt = ext.toLowerCase() === ".jpeg" ? ".jpg" : ext.toLowerCase();
  return [...dirs, slug(stem) + (outExt || "")].join("/");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const mapPath = path.join(root, "scripts/_image-map.json");
const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));

for (const origKey of EXTRA) {
  const newKey = newKeyFor(origKey);
  const localPath = path.join(root, "public/store-img", origKey);
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
  map[origKey] = newKey;
  console.log(`✓ ${origKey}\n   → ${newKey} (${(body.length / 1024).toFixed(0)}KB)`);
}

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log("\n_image-map.json 갱신 완료");
