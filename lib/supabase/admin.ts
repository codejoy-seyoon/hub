import { createClient } from "@supabase/supabase-js";

/**
 * 스토어 서버 전용 DB 클라이언트.
 *
 * - 만능 열쇠(service_role)를 쓰지 않는다. Supabase 프로젝트 「bni pay」 안의
 *   `store` 방(schema)에만 권한이 있는 전용 역할 `store_app` 으로 접속한다.
 * - 접속 증표는 SUPABASE_STORE_JWT (role=store_app 으로 서명한 토큰, 서버 비밀값).
 *   만드는 법: scripts/mint-store-token.mjs
 * - apikey 자리에는 공개 키(publishable/anon)를 쓴다. 공개 키만으로는 store 방을 볼 수 없다.
 * - 절대 클라이언트 번들로 import 하지 말 것 (API Route / Server Action 등 서버 코드 전용).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: { schema: "store" },
    // 비밀값을 넣을 때 줄바꿈이 따라 들어와도 문제없게 앞뒤 공백을 뗀다.
    accessToken: async () => (process.env.SUPABASE_STORE_JWT ?? "").trim() || null,
  }
);
