// 스토어 사진을 사이트 안(public/store-web)에 다시 만든다.
// 2026-11-12: 사진을 올려 둔 Supabase 프로젝트 주소가 사라져, 외부 저장소 대신
// 사이트가 직접 사진을 갖고 있도록 바꿨다.
// - 원본: public/store-img/<한글 폴더>/<원본 파일>  (대용량, 일부 git 제외)
// - 결과: public/store-web/<ASCII 키>               (긴 변 1600px, 배포 가능 크기)
// - 대응표: scripts/_image-map.json (migrate-images.mjs 가 만든 것 그대로 사용)
// 변환 설정은 migrate-images.mjs 와 같다. 다시 돌려도 안전하다(이미 있으면 건너뜀, --force 로 덮어씀).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_EDGE = 1600;
const QUALITY = 80;
const root = process.cwd();
const SRC = path.join(root, "public/store-img");
const OUT = path.join(root, "public/store-web");
const force = process.argv.includes("--force");

const map = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/_image-map.json"), "utf8")
);
const entries = Object.entries(map);

let done = 0,
  skipped = 0,
  totalBytes = 0;
const failed = [];

async function one([origKey, newKey]) {
  const src = path.join(SRC, origKey);
  const dst = path.join(OUT, newKey);
  if (!force && fs.existsSync(dst) && fs.statSync(dst).size > 0) {
    skipped++;
    totalBytes += fs.statSync(dst).size;
    return;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const ext = path.extname(origKey).toLowerCase();
  const base = sharp(src);
  const body =
    ext === ".png"
      ? await base
          .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
          .png({ compressionLevel: 9 })
          .toBuffer()
      : await base
          .rotate()
          .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: QUALITY, mozjpeg: true })
          .toBuffer();
  // 쓰다 끊겨도 반쪽 파일이 남지 않게 임시 파일에 쓰고 이름을 바꾼다.
  const tmp = dst + ".tmp";
  fs.writeFileSync(tmp, body);
  fs.renameSync(tmp, dst);
  totalBytes += body.length;
  done++;
}

let idx = 0;
async function worker() {
  while (idx < entries.length) {
    const e = entries[idx++];
    try {
      await one(e);
    } catch (err) {
      failed.push(`${e[0]} :: ${err.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

console.log(
  `new ${done} / skipped ${skipped} / failed ${failed.length} / total ${entries.length}, ${(totalBytes / 1048576).toFixed(1)}MB`
);
if (failed.length) {
  failed.forEach((f) => console.log("  FAIL " + f));
  process.exit(1);
}
