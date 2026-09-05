export default function TermsPage() {
  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">ข้อกำหนดและเงื่อนไข</h1>

      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
        ฉบับร่าง — ข้อความนี้เป็นเพียงตัวอย่างเบื้องต้น ยังไม่ผ่านการตรวจสอบทางกฎหมาย
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">ข้อมูลที่เราเก็บ</h2>
        <p className="text-sm text-zinc-600">
          เมื่อเข้าสู่ระบบผ่าน LINE เราจะเก็บชื่อ-นามสกุล, ตำแหน่ง, หน่วยงานต้นสังกัด,
          จังหวัด/อำเภอ/เขตพื้นที่ต้นทางและปลายทาง, กลุ่มสาระการเรียนรู้และวิชาเอก (ถ้ามี),
          และข้อมูลเพิ่มเติมที่ท่านกรอกเอง (เช่น ข้อมูลสวัสดิการ)
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">วัตถุประสงค์การใช้ข้อมูล</h2>
        <p className="text-sm text-zinc-600">
          ข้อมูลของท่านจะถูกใช้เพื่อค้นหาและแสดงผลการจับคู่ผู้ที่ต้องการย้ายสับเปลี่ยนตำแหน่งซึ่งกันและกันเท่านั้น
          ระบบไม่ได้ดำเนินการอนุมัติการย้าย — ขั้นตอนอนุมัติเป็นไปตามกระบวนการของหน่วยงานต้นสังกัดตามปกติ
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">การติดต่อ</h2>
        <p className="text-sm text-zinc-600">
          เมื่อพบคู่ที่จับคู่กันได้ ระบบจะให้ท่านติดต่อกันผ่าน LINE โดยตรง เราไม่ขอเบอร์โทรศัพท์
          และไม่แชร์ข้อมูลของท่านให้บุคคลอื่นนอกเหนือจากคู่ที่จับคู่กันได้
        </p>
      </section>
    </div>
  )
}
