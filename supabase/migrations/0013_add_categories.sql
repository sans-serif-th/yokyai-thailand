-- Create categories reference table for future use
create table categories (
  code text primary key,
  name_th text not null,
  name_en text not null
);

insert into categories (code, name_th, name_en) values
  ('teacher',   'ครู',        'Teacher'),
  ('nurse',     'พยาบาล',    'Nurse'),
  ('physician', 'แพทย์',     'Physician')
on conflict (code) do nothing;

-- Add category column to teachers (one per user for now, future-proof for multiple)
alter table teachers add column category text not null default 'teacher' references categories(code);

-- Enable RLS on categories
alter table categories enable row level security;
