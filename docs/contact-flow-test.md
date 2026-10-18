# ทดสอบ flow ขอติดต่อ + แจ้งเตือน LINE (ด้วยบัญชีจริง 2 บัญชี)

Automated tests (`npm test`, `lib/contacts.flow.test.ts`) จำลอง API + ฐานข้อมูล + LINE push
ครบทุกเส้นทางแล้ว แต่ไม่ได้ส่ง LINE จริง/ไม่ได้ใช้ฐานข้อมูลจริง ให้ทดสอบตามนี้ก่อนเปิดใช้จริง

## เตรียม (ครั้งเดียว)

1. LINE Official Account Manager → OA → Settings → Messaging API → Enable
   - provider ต้องเป็น **provider เดียวกับ LINE Login channel** ที่ใช้กับ LIFF
     ไม่เช่นนั้น userId ไม่ตรงกันและข้อความจะไม่ถึงผู้ใช้
2. LINE Developers → Messaging API channel → แท็บ Messaging API → Issue **Channel access token (long-lived)**
3. ใส่ env `LINE_MESSAGING_ACCESS_TOKEN` ใน Vercel (Production) แล้ว redeploy
4. LINE Developers → **LINE Login channel** (ไม่ใช่ Messaging API channel) → แท็บ LIFF → กด **Edit** ที่ LIFF app → Add friend option → **On (aggressive)** → Update
   - ช่องนี้อยู่ในหน้า Edit ของ LIFF app เท่านั้น (ปุ่ม Edit ตรง Linked LINE Official Account ในหน้า Basic settings ใช้เลือก OA ที่ผูกไว้ ไม่มีตัวเลือกนี้)
   - ต้องผูก OA กับ Login channel (Linked LINE Official Account) ไว้ก่อน ตัวเลือกจึงจะใช้ได้
5. รัน migration ใน Supabase ตามลำดับ: `0023` → `0024` → `0025`
6. ตรวจโควตาข้อความของ OA (push ทุกครั้งนับเป็น 1 ข้อความ)

## เตรียมบัญชีทดสอบ

- LINE บัญชี **A** และ **B** ต่างคนต่างเพิ่ม OA เป็นเพื่อน และผ่าน onboarding (กรอก LINE ID แล้ว)
- ข้อมูลต้องจับคู่กัน เช่น A: กรุงเทพฯ → เชียงใหม่, B: เชียงใหม่ → กรุงเทพฯ
  ตำแหน่ง/สังกัด/กลุ่มสาระเดียวกัน และ round/year เดียวกัน

## ขั้นตอน

| # | ทำ | ผลที่ควรได้ |
|---|----|-------------|
| 1 | A และ B เปิดหน้าผลจับคู่ | เห็นกันและกัน (ชื่อถูกปิดเป็น `ส*****`) ปุ่ม "ขอติดต่อ" |
| 2 | A กด "ขอติดต่อ" | A เห็น "ส่งคำขอแล้ว — รออีกฝ่ายตอบ" + ปุ่ม "ยกเลิกคำขอ" |
| 3 | ดู LINE ของ B | **ได้ข้อความจาก OA** "มีคำขอติดต่อใหม่…" พร้อมลิงก์ (ไม่มีชื่อ/LINE ID ในข้อความ) |
| 4 | B กดลิงก์ | เปิดแท็บ "คำขอติดต่อ" ในหน้าค้นหา (ลิงก์เดิม /contacts เด้งมาที่นี่) เห็นการ์ด "รอคุณตอบ" ชื่อถูกปิด |
| 5 | A กด "ยกเลิกคำขอ" | A เห็น "ส่งคำขออีกครั้ง (เหลือ 2 ครั้ง)"; B refresh แล้วการ์ดหาย |
| 6 | A ส่งใหม่ → ยกเลิก → ส่งใหม่ → ยกเลิก | ส่งครั้งที่ 2, 3 ได้ (B ได้ push ทุกครั้งที่ส่ง); ครั้งที่ 4 ขึ้น "ส่งคำขอครบ 3 ครั้งแล้ว" |
| 7 | (ใช้คู่ที่ส่งไม่เกิน 3) B กด "ยอมรับ" | B เห็นชื่อจริง + LINE ID ของ A |
| 8 | ดู LINE ของ A | **ได้ข้อความ** "คำขอติดต่อของคุณได้รับการยอมรับแล้ว…" |
| 9 | A เปิดแท็บ "คำขอติดต่อ" | เห็นชื่อ + LINE ID ของ B; กดลิงก์ LINE ID เปิดหน้าเพิ่มเพื่อนได้ |
| 10 | (คู่ที่สอง) B กด "ปฏิเสธ" | A เห็น "ไม่สะดวกติดต่อ" ไม่มีปุ่มส่งซ้ำ ไม่มี push |
| 11 | ปิดใช้ token (unset env) แล้วส่งคำขอ | คำขอยังส่งสำเร็จ แค่ไม่มี push |

ถ้าข้อ 3/8 ไม่มีข้อความ: เช็กว่า (ก) token ถูกต้องและ redeploy แล้ว (ข) ผู้รับเพิ่ม OA เป็นเพื่อนและไม่ได้บล็อก
(ค) OA กับ Login channel อยู่ provider เดียวกัน (ง) Vercel logs มีบรรทัด `LINE push failed <status>`

## ล้างข้อมูลทดสอบ (รันใน Supabase SQL editor)

```sql
-- แทน <A_ID>/<B_ID> ด้วย teachers.id ของบัญชีทดสอบ
delete from contact_requests where requester_id in ('<A_ID>','<B_ID>') or target_id in ('<A_ID>','<B_ID>');
```
