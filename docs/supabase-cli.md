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

## สถานะของแต่ละโปรเจกต์ (26 ตุลาคม 2026)

- **โปรเจกต์ทดสอบ `yokyai-test`**: สร้างจาก `schema.sql` แล้ว mark ครบ (ขั้นตอนด้านบน)
- **โปรเจกต์จริง (project ref `rwqvkloiphfraahxblhq`)**: ย้ายมาใช้ CLI แล้ว — ลิงก์ด้วย `link`
  แล้วรัน `scripts/supabase-mark-applied.sh 0033`; `migration list` ขึ้นครบ `0002`–`0033`
  ทั้ง Local และ Remote จากนี้ `db push` รันเฉพาะไฟล์ที่ใหม่กว่า `0033`
  (ก่อน mark ต้องตรวจรายไฟล์ ดู "ย้าย DB ที่มีอยู่แล้วมาใช้ CLI" ด้านล่าง)

## ย้าย DB ที่มีอยู่แล้วมาใช้ CLI

ตาราง Local/Remote ของ `migration list` ขึ้นครบเสมอหลัง `mark-applied` ไม่ว่าโครงสร้างจริงจะถูกหรือไม่
จึง **ห้าม mark โดยไม่ตรวจ** — ไฟล์ที่หลุดจะถูกบันทึกว่ารันแล้วและ CLI จะไม่รันให้อีก

1. วาง `scripts/verify-migrations.sql` ใน SQL editor ของ DB นั้น (อ่านอย่างเดียว)
2. ต้องไม่มีแถว `ok = false` (`null` = ตรวจโครงสร้างไม่ได้ ถือว่าผ่าน) ถ้ามี ให้รันไฟล์ที่หลุดเองก่อน
   (ห้ามรันซ้ำไฟล์ที่ผ่านแล้ว เช่น `0031` ไม่มี `if not exists`)
3. `npx supabase link --project-ref <ref>` แล้ว `scripts/supabase-mark-applied.sh <เลขล่าสุดที่รันแล้วจริง>`
4. `npx supabase migration list` ต้องครบทั้งสองช่อง

เพิ่มแถวใน `scripts/verify-migrations.sql` ทุกครั้งที่เขียน migration ใหม่

## กติกาเมื่อ CLI ลิงก์กับโปรเจกต์จริง

- CLI ลิงก์ได้ทีละโปรเจกต์ (ดูว่าตอนนี้ลิงก์ที่ไหน: `cat supabase/.temp/project-ref`) — ก่อน `db push`
  ทุกครั้งให้เช็ก project ref และใช้ `--dry-run` ก่อนเสมอ
- ลองกับโปรเจกต์ทดสอบก่อน (`link` กลับไป `yokyai-test`) แล้วค่อยทำกับโปรเจกต์จริง
- รัน `db push` **ก่อน** merge โค้ดที่ใช้โครงสร้างใหม่ (เคยพลาด: `round_id` ของ `0018` ไม่ถูกรัน
  ทำให้บันทึกรายการโปรดล้มเงียบ ๆ)

## ห้าม

- ห้าม `mark-applied` กับ DB ที่ยังไม่ได้ตรวจด้วย `scripts/verify-migrations.sql`
- ห้าม `migration repair` หรือ `db reset` กับโปรเจกต์จริง
- ห้ามวางรหัสผ่านฐานข้อมูล, service role key หรือ access token ในแชท/ไฟล์ที่ commit
- `config.toml` ใช้กับ `supabase start` (DB ในเครื่องผ่าน Docker) เป็นหลัก ยังไม่ได้ตั้งค่า/ทดสอบส่วนนั้น
