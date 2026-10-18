-- Development only — run by hand, never as a migration, and never in prod.
-- Adds the example role 'demo' (lib/roles/demo.ts) so it can be tried locally
-- with NEXT_PUBLIC_DEV_TOOLS=1. Requires migration 0031 (demo_profiles).
insert into categories (code, name_th, name_en, status, sort_order)
values ('demo', 'ตัวอย่าง (ทดลอง)', 'Demo', 'active', 900)
on conflict (code) do nothing;

-- Matching stays closed until the role has an active round: create one at
-- /admin?role=demo → Round tab.
