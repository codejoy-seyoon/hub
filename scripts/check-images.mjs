// 사진 점검 — `npm run dev` / `npm run build` 직전에 자동으로 돈다 (package.json predev·prebuild).
//
// 왜 있나 (2026-11-12, 볼트 hub-store HST-03):
//   스토어 사진을 무료 요금제 외부 저장소(Supabase)에 두었더니, 며칠 손을 안 대는 사이
//   저장소가 자동으로 멈추고 주소까지 사라져서 작업을 이어갈 때마다 사진이 빈칸이었다.
//   그래서 (1) 사진은 저장소(git) 안에 두고 (2) 화면을 띄우기 전에 빠진 사진이 없는지
//   여기서 먼저 확인한다. 빠졌으면 화면이 조용히 빈칸으로 뜨는 대신 여기서 멈추고 알려 준다.
//
// 확인하는 것
//   1. 스토어: 상품 데이터와 스토어 화면 코드가 쓰는 사진 키 → public/store-web/<키>
//   2. 전자책: 표지와 화면 코드가 쓰는 사진 → public/ebook-img/<파일>
//   3. 빠진 스토어 사진은 원본(public/store-img)이 있으면 자동으로 다시 만든다.
//   4. 사진이 git에 안 올라가 있으면 경고 (다른 PC에서 이어 할 때 빠진다).
//   5. 사진 주소를 외부로 돌려 둔 설정(NEXT_PUBLIC_STORE_IMG_BASE)이 있으면 경고.
//   --remote 를 붙이면 외부 주소 사진(홈·교육·대관의 스톡 사진)이 살아 있는지도 본다.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const rel = (p) => path.relative(root, p).replaceAll("\\", "/");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => {
  try {
    return fs.statSync(p).size > 0;
  } catch {
    return false;
  }
};

function walk(dir, out = []) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
const sources = ["app", "components", "lib"].flatMap((d) => walk(d));
// 주석 속 예시("goods/welcome.png" 같은 설명용 글자)를 실제 사진으로 세지 않도록 주석을 뺀다.
const code = (p) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

// ---- 1. 스토어 사진 키 모으기 -------------------------------------------
const storeKeys = new Map(); // key -> 어디서 쓰는지
const addStore = (file, where) => {
  if (!file) return;
  const key = file.includes("/") ? file : `goods/${file}`;
  if (!storeKeys.has(key)) storeKeys.set(key, where);
};
const products = JSON.parse(read("lib/data/_products.json"));
for (const p of products) {
  addStore(p.img, `상품 ${p.id}`);
  for (const f of p.images ?? []) addStore(f, `상품 ${p.id}`);
}
const studioProducts = JSON.parse(read("lib/data/_studio-products.json"));
for (const [id, images] of Object.entries(studioProducts)) {
  for (const image of images) addStore(image, `스튜디오 사진 ${id}`);
}
// 화면 코드에 직접 적힌 키 (배너·카테고리 카드 등)
const KEY_RE = /["'`]((?:goods|renewal-\d+)\/[^"'`\s]+\.(?:png|jpe?g|webp))["'`]/g;
for (const f of sources) {
  for (const m of code(f).matchAll(KEY_RE)) addStore(m[1], f.replaceAll("\\", "/"));
}

const storeDir = path.join(root, "public/store-web");
const missingStore = () =>
  [...storeKeys].filter(([k]) => !exists(path.join(storeDir, k)));

let miss = missingStore();
let rebuilt = false;
if (miss.length) {
  console.log(
    `[사진 점검] 스토어 사진 ${miss.length}장이 없어 원본에서 다시 만듭니다...`
  );
  const r = spawnSync(process.execPath, ["scripts/build-local-images.mjs"], {
    cwd: root,
    stdio: "inherit",
  });
  rebuilt = r.status === 0;
  miss = missingStore();
}

// ---- 2. 전자책 사진 -----------------------------------------------------
const ebookFiles = new Map();
for (const b of JSON.parse(read("lib/data/_books.json"))) {
  if (b.cover)
    ebookFiles.set(b.cover.replace(/^images\//, ""), `도서 ${b.id}`);
}
const EBOOK_RE = /["'`]\/ebook-img\/([^"'`\s$]+\.(?:png|jpe?g|webp|svg))["'`]/g;
for (const f of sources) {
  for (const m of code(f).matchAll(EBOOK_RE))
    if (!ebookFiles.has(m[1])) ebookFiles.set(m[1], f.replaceAll("\\", "/"));
}
const missEbook = [...ebookFiles].filter(
  ([f]) => !exists(path.join(root, "public/ebook-img", f))
);

// ---- 3. 경고 거리 -------------------------------------------------------
const warnings = [];

// git에 안 올라간 사진 (다른 PC·새로 내려받은 폴더에서 빠진다)
if (fs.existsSync(path.join(root, ".git"))) {
  const g = spawnSync(
    "git",
    ["status", "--porcelain", "--untracked-files=all", "--", "public/store-web", "public/ebook-img"],
    { cwd: root, encoding: "utf8" }
  );
  if (g.status === 0) {
    const lines = g.stdout.split("\n").filter(Boolean);
    if (lines.length)
      warnings.push(
        `사진 ${lines.length}개가 아직 git에 안 올라갔습니다 (커밋·푸시해야 다른 PC에서도 뜹니다). 예: ${lines[0].trim()}`
      );
  }
}

// 사진 주소를 외부로 돌려 둔 설정
const envBase = (() => {
  if (process.env.NEXT_PUBLIC_STORE_IMG_BASE) return process.env.NEXT_PUBLIC_STORE_IMG_BASE;
  for (const f of [".env.local", ".env"]) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, "utf8").match(/^\s*NEXT_PUBLIC_STORE_IMG_BASE\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return "";
})();
if (envBase && !envBase.startsWith("/"))
  warnings.push(
    `NEXT_PUBLIC_STORE_IMG_BASE 가 외부 주소(${envBase})입니다. 그 저장소가 멈추면 사진이 다시 빈칸이 됩니다. 비워 두면 사이트 안 사진(/store-web)을 씁니다.`
  );

// ---- 4. (선택) 외부 주소 사진 -------------------------------------------
const remoteDead = [];
let remoteCount = 0;
if (process.argv.includes("--remote")) {
  const urls = new Set();
  const unsplash = (id, q = "auto=format&fit=crop&w=400&q=60") =>
    `https://images.unsplash.com/${id}?${q}`;
  for (const f of sources) {
    const txt = read(f);
    for (const m of txt.matchAll(/https:\/\/(?:images\.unsplash\.com|videos\.pexels\.com)\/[^\s"'`)$]+/g))
      if (!m[0].endsWith("/")) urls.add(m[0]);
    for (const m of txt.matchAll(/["'`](photo-[0-9a-f-]{8,})["'`]/g)) urls.add(unsplash(m[1]));
  }
  for (const f of ["lib/data/_spaces.json", "lib/data/_trainings.json"]) {
    if (!fs.existsSync(path.join(root, f))) continue;
    for (const m of read(f).matchAll(/"(photo-[0-9a-f-]{8,})"/g)) urls.add(unsplash(m[1]));
  }
  remoteCount = urls.size;
  await Promise.all(
    [...urls].map(async (u) => {
      try {
        const r = await fetch(u, { method: "HEAD", signal: AbortSignal.timeout(15000) });
        if (!r.ok) remoteDead.push(`${r.status} ${u}`);
      } catch (e) {
        remoteDead.push(`연결 실패 ${u}`);
      }
    })
  );
}

// ---- 결과 ---------------------------------------------------------------
const ok = miss.length === 0 && missEbook.length === 0;
console.log(
  `[사진 점검] 스토어 ${storeKeys.size - miss.length}/${storeKeys.size}` +
    ` · 전자책 ${ebookFiles.size - missEbook.length}/${ebookFiles.size}` +
    (rebuilt ? " · 빠진 사진을 원본에서 다시 만들었음" : "") +
    (remoteCount ? ` · 외부 주소 ${remoteCount - remoteDead.length}/${remoteCount}` : "") +
    (ok ? " — 이상 없음" : " — 빠진 사진 있음")
);
for (const w of warnings) console.log(`[사진 점검] 주의: ${w}`);
for (const d of remoteDead) console.log(`[사진 점검] 주의: 외부 사진이 안 열립니다 — ${d}`);

if (!ok) {
  console.error("\n[사진 점검] 아래 사진이 없습니다. 화면에 빈칸으로 나옵니다.");
  for (const [k, where] of miss)
    console.error(`  - public/store-web/${k}   (쓰는 곳: ${where})`);
  for (const [f, where] of missEbook)
    console.error(`  - public/ebook-img/${f}   (쓰는 곳: ${where})`);
  console.error(
    "\n고치는 법\n" +
      "  1) git pull — 사진은 저장소에 들어 있습니다 (public/store-web, public/ebook-img).\n" +
      "  2) 그래도 없으면 원본이 있는 PC에서 `node scripts/build-local-images.mjs` 실행 후 커밋.\n" +
      "     원본 위치: public/store-img (스튜디오 촬영본은 용량 때문에 git 제외, 이 PC에만 있음).\n" +
      "  3) 새 사진을 쓰려면 scripts/_image-map.json 에 '원본 경로: 키'를 추가하고 2)를 실행."
  );
  process.exit(1);
}
