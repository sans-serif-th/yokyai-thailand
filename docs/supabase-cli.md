# Supabase CLI — รัน migration ด้วยคำสั่งแทนการวางใน SQL editor

CLI ถูกติดตั้งเป็น devDependency (`npx supabase ...`) และ `supabase/config.toml` ถูกสร้างแล้ว
สิ่งที่ยังต้องทำเองคือเชื่อมกับโปรเจกต์ Supabase (ใช้บัญชีและรหัสผ่านของเจ้าของโปรเจกต์)

## ตั้งค่าครั้งแรก — ใช้โปรเจกต์ **ทดสอบ** ก่อนเสมอ

1. สร้างโปรเจกต์ Supabase ใหม่ (เช่น `yokyai-test`) ในหน้า dashboard, จด **Project ref**
2. เปิด SQL editor ของโปรเจกต์ทดสอบ วางทั้งไฟล์ `supabase/schema.sql` แล้ว Run
   (DB ใหม่ใช้ `schema.sql` อย่างเดียว ไม่ต้องรัน migration ทั้งหมด)
3. ในเครื่อง:
   ```
   npx supabase login
   npx supabase link --project-ref <project-ref>
   scripts/supabase-mark-applied.sh
   ```
   สคริปต์สุดท้ายบอก CLI ว่า migration ที่มีอยู่ทั้งหมด "รันแล้ว" (โครงสร้างมาจาก `schema.sql` แล้ว)
4. ตรวจ: `npx supabase migration list` — ทุกไฟล์ต้องมีค่าทั้งช่อง Local และ Remote

## ใช้งานประจำ

- เขียน migration ใหม่เป็นไฟล์ `supabase/migrations/NNNN_ชื่อ.sql` (เลขต่อจากไฟล์ล่าสุด) และแก้ `supabase/schema.sql` ให้ตรงกัน
- ดูสิ่งที่จะรัน: `npx supabase db push --dry-run`
- รันจริง: `npx supabase db push` (รันเฉพาะไฟล์ที่ยังไม่เคยรัน เรียงตามเลข)
- ลำดับ: รัน `db push` **ก่อน** merge โค้ดที่ต้องใช้โครงสร้างใหม่

## ห้าม

- ห้าม `link` หรือ `db push` กับโปรเจกต์ **จริง** ก่อนตรวจว่า DB จริงรันถึง migration ไหนแล้ว
  (ที่ผ่านมา `0018_favorites_round.sql` เคยหลุด และ `0031` รันซ้ำไม่ได้) —
  ถ้าจะย้ายโปรเจกต์จริงมาใช้ CLI ให้ตรวจเป็นไฟล์ ๆ แล้วใช้
  `scripts/supabase-mark-applied.sh <เลขล่าสุดที่รันแล้วจริง>` เฉพาะช่วงที่รันแล้ว
- ห้ามวางรหัสผ่านฐานข้อมูล, service role key หรือ access token ในแชท/ไฟล์ที่ commit
- `config.toml` ใช้กับ `supabase start` (DB ในเครื่องผ่าน Docker) เป็นหลัก ยังไม่ได้ตั้งค่า/ทดสอบส่วนนั้น
