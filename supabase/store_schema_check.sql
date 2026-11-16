-- store_schema.sql 실행 뒤 확인용 (읽기만 한다)
-- 1) store 방의 표 7개
select table_name from information_schema.tables where table_schema = 'store' order by 1;

-- 2) store_app 이 store 방 밖(public 등)에서 가진 표 권한 — 0줄이어야 한다
select table_schema, table_name, privilege_type
from information_schema.role_table_grants
where grantee in ('store_app', 'PUBLIC') and table_schema not in ('store', 'information_schema', 'pg_catalog')
order by 1, 2, 3;

-- 3) store_app 이 pay 표를 읽을 수 있는지 직접 물어본다 — 전부 false 여야 한다
select c.relname,
       has_table_privilege('store_app', c.oid, 'select') as can_select,
       has_table_privilege('store_app', c.oid, 'insert') as can_insert
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'p')
order by 1;

-- 4) store_app 이 실행할 수 있는 public 함수 — pay_ 로 시작하는 것이 있으면 안 된다
select p.proname, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and has_function_privilege('store_app', p.oid, 'execute')
order by 1;

-- 5) store 방에서 anon·authenticated 가 가진 권한 — 0줄이어야 한다
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'store' and grantee in ('anon', 'authenticated')
order by 1, 2, 3;

-- 6) 역할 속성
select rolname, rolcanlogin, rolbypassrls, rolinherit from pg_roles where rolname in ('store_app', 'authenticator', 'service_role');
