// 스토어 서버 증표(SUPABASE_STORE_JWT) 만들기
//
// 무엇을 하나: Supabase 프로젝트의 JWT 비밀값으로 「role=store_app」 토큰에 서명해서
//             표준 출력으로 **토큰만** 내보낸다. 화면에 찍지 말고 바로 넘겨 쓴다.
//
// 쓰는 법(값이 화면·기록에 남지 않게):
//   1) Supabase 대시보드에서 JWT 비밀값을 복사해 파일 하나에 저장한다(한 줄, 다른 글자 없이).
//   2) node scripts/mint-store-token.mjs "<그 파일 경로>" | npx wrangler secret put SUPABASE_STORE_JWT
//   3) 끝나면 그 파일을 지운다.
//
// 유효 기간: 기본 5년. 바꾸려면 두 번째 인자에 연 수를 준다(예: ... 파일경로 2).
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const [file, yearsArg] = process.argv.slice(2);
if (!file) {
  console.error("사용법: node scripts/mint-store-token.mjs <JWT 비밀값이 든 파일> [유효 연수]");
  process.exit(1);
}
const secret = readFileSync(file, "utf8").replace(/^﻿/, "").trim();
if (secret.length < 20 || /\s/.test(secret)) {
  console.error("파일 내용이 JWT 비밀값으로 보이지 않습니다(한 줄, 공백 없이 저장해 주세요).");
  process.exit(1);
}
const years = Math.max(1, Math.min(10, Number(yearsArg) || 5));
const now = Math.floor(Date.now() / 1000);
const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const head = b64({ alg: "HS256", typ: "JWT" });
const body = b64({ role: "store_app", iss: "supabase", iat: now, exp: now + years * 365 * 24 * 3600 });
const sig = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
process.stdout.write(`${head}.${body}.${sig}`);
console.error(`store_app 토큰 생성 완료 (유효 ${years}년, 길이 ${head.length + body.length + sig.length + 2}자). 값은 표시하지 않습니다.`);
