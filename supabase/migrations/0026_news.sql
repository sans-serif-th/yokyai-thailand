-- Home ("อัพเดท") news, edited from /admin/news. `layout` picks the detail
-- page template: 'article' (heading + paragraphs) or 'steps' (numbered
-- step cards, each optionally with an illustration).
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  layout text not null default 'article' check (layout in ('article', 'steps')),
  title text not null,
  published_date date not null default current_date,
  cover_image_url text,
  heading text,
  body text,                       -- paragraphs separated by a blank line
  steps jsonb not null default '[]'::jsonb,  -- [{title, description, image_url}]
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_news_published_order on news (published, sort_order, published_date desc);

drop trigger if exists news_set_updated_at on news;
create trigger news_set_updated_at
  before update on news
  for each row execute function set_updated_at();

-- Default-deny like every other table: only the Next.js API routes (service
-- role) read or write it.
alter table news enable row level security;

-- Public bucket for news cover / step images (uploaded by the admin API).
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

-- Seed the two launch announcements once (skipped if the table already has rows).
do $$
begin
  if exists (select 1 from news) then
    return;
  end if;

insert into news (layout, title, published_date, cover_image_url, heading, body, steps, sort_order)
values
  (
    'article',
    'ช่วงลงทะเบียนจับคู่โยกย้ายราชการครู (รอบ 1/2570)',
    '2026-10-31',
    '/news-1.png',
    E'ประกาศเปิดลงทะเบียนจับคู่โยกย้ายข้าราชการครู\nรอบที่ 1 ประจำปี 2027',
    E'โอกาสสำหรับครูที่ต้องการย้ายไปปฏิบัติงานในพื้นที่ที่ตรงกับความต้องการ\n\nระบบ “โยกย้าย” เปิดรับลงทะเบียนสำหรับข้าราชการครูที่มีความประสงค์จะโยกย้ายไปยังพื้นที่ที่สนใจ\n\nเพื่อช่วยค้นหาและเชื่อมโยงครูที่มีความต้องการย้ายสอดคล้องกัน ให้สามารถติดต่อสื่อสารและประสานงานกันได้สะดวกยิ่งขึ้น\n\n📅 ระยะเวลาลงทะเบียน\n1 พฤศจิกายน – 31 ธันวาคม 2026\n🎯 รอบที่ 1 ประจำปี 2027\n\nระบบเปิดให้ใช้งานฟรีในช่วงทดลอง เพื่ออำนวยความสะดวกในการค้นหาผู้ที่มีความต้องการโยกย้ายสอดคล้องกัน โดยผู้ใช้งานสามารถนำข้อมูลที่ได้รับไปติดต่อประสานงานกันได้ด้วยตนเอง',
    '[]'::jsonb,
    0
  ),
  (
    'steps',
    'ขั้นตอนการจับคู่ลงทะเบียน',
    '2026-10-31',
    '/news-2.png',
    'รายละเอียดขั้นตอนการจับคู่ดังนี้',
    null,
    '[
      {"title": "กรอกข้อมูลในช่วงลงทะเบียน", "description": "เพื่อยืนยันตัวตน สร้างบัญชีผู้ใช้งาน\nกรอกต้นทางและปลายทางที่ต้องการ", "image_url": null},
      {"title": "ระบบจับคู่ข้อมูล", "description": "นำข้อมูลของคุณไปจับคู่กับผู้ใช้งาน", "image_url": null},
      {"title": "ติดต่อสื่อสารกับผู้ใช้งานนอกระบบ", "description": "เมื่อได้รับข้อมูลจับคู่แล้ว คุณสามารถติดต่อ\nเพื่อพูดคุยกันนอกระบบได้โดยตรง", "image_url": null}
    ]'::jsonb,
    1
  );
end
$$;
