# yokyai (โยกย้าย)

เว็บแอปจับคู่ข้าราชการที่ต้องการแลกย้ายตำแหน่ง (เริ่มจากครู) ทำงานใน LINE ผ่าน LIFF ผู้ใช้ login ด้วยบัญชี LINE

- Next.js 16 (App Router) + Tailwind v4 + Supabase (Postgres) + LINE LIFF
- Production: https://yokyai-thailand.vercel.app (deploy อัตโนมัติจาก branch `main`)
- ภาพรวมระบบและสภาพแวดล้อม: [docs/infrastructure.md](docs/infrastructure.md)
- ศัพท์และกติกาของโดเมน: [docs/CONTEXT.md](docs/CONTEXT.md)
- งานที่ค้างและสถานะ: [docs/status.md](docs/status.md)

> Next.js ที่ใช้เป็นเวอร์ชันที่มี breaking change จากที่คุ้นเคย อ่านคู่มือใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดที่แตะ API ของ Next (ดู [AGENTS.md](AGENTS.md))

## เริ่มทำงานในเครื่อง

ต้องมี Node.js 24 ขึ้นไป (Vercel ใช้ 24.x)

```bash
npm install
cp .env.example .env.local   # แล้วกรอกค่า (ดูหัวข้อถัดไป)
npx next dev --experimental-https
```

เปิด `https://localhost:3000` ต้องใช้ https เพราะ LIFF ไม่ยอม login บน http (เบราว์เซอร์จะเตือนใบรับรอง กดยอมรับ โฟลเดอร์ `certificates/` ถูก git-ignore แล้ว)

คำสั่งอื่น:

```bash
npm test            # vitest (unit test ทั้งหมด)
npm run lint        # eslint
npm run build       # ต้องผ่านก่อน merge: Vercel รัน type check ทั้งโปรเจกต์
```

## ตัวแปร environment

แม่แบบอยู่ที่ [.env.example](.env.example) ตัวแปรที่แอปอ่าน:

| ตัวแปร | ใช้ทำอะไร | หมายเหตุ |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL โปรเจกต์ Supabase | ฝังตอน build |
| `SUPABASE_SERVICE_ROLE_KEY` | key ฝั่งเซิร์ฟเวอร์ | ห้ามให้เบราว์เซอร์เห็น |
| `NEXT_PUBLIC_LIFF_ID` | LIFF app ที่ใช้เปิดแอป | ฝังตอน build |
| `LINE_CHANNEL_ID` (หรือ `CHANNEL_ID`) | ใช้ตรวจ LINE ID token ฝั่งเซิร์ฟเวอร์ | |
| `LINE_MESSAGING_ACCESS_TOKEN` | ส่ง Flex message แจ้งคำขอติดต่อ | **ว่างไว้นอก production** เพื่อไม่ส่งข้อความจริง |
| `ADMIN_TOKEN_SECRET` | เซ็น session ของ `/admin` | สุ่มเอง `openssl rand -hex 32` |
| `NEXT_PUBLIC_DEV_TOOLS` | แสดงปุ่ม "โหมดทดสอบ" และเปิด `/api/matches/dev` | ตั้งเฉพาะ Preview/local **ห้ามตั้งที่ Production** |

ตัวแปรที่ขึ้นต้น `NEXT_PUBLIC_` ถูกฝังตอน build แก้แล้วต้อง redeploy

**ในเครื่องให้ชี้โปรเจกต์ Supabase ทดสอบ `yokyai-test` เสมอ ห้ามใช้ key ของโปรเจกต์จริง** วิธีเตรียมข้อมูลทดสอบและ LIFF สำหรับเครื่อง local ดู [docs/infrastructure.md](docs/infrastructure.md) หัวข้อ "เริ่มทำงาน"

## ฐานข้อมูลและ migration

โครงสร้างอยู่ใน `supabase/migrations/NNNN_ชื่อ.sql` และ `supabase/schema.sql` (ต้องตรงกันเสมอ) ขั้นตอนทั้งหมดใน [docs/supabase-cli.md](docs/supabase-cli.md)

## เอกสารอื่น

- [docs/adding-a-role.md](docs/adding-a-role.md): เพิ่ม role (ประเภทผู้ใช้) ใหม่
- [docs/adding-a-field.md](docs/adding-a-field.md): เพิ่มฟิลด์ในโปรไฟล์
- [docs/contact-flow-test.md](docs/contact-flow-test.md): ทดสอบ flow คำขอติดต่อ
