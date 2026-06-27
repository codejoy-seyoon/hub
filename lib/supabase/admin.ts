import { createClient } from "@supabase/supabase-js";

/**
 * service role 키를 쓰는 서버 전용 관리자 클라이언트.
 * RLS를 우회하므로 절대 클라이언트 번들로 import 하지 말 것.
 * (API Route / Server Action 등 서버 코드에서만 사용)
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
