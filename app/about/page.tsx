export default function AboutPage() {
  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">เกี่ยวกับเรา</h1>

      <p className="text-sm text-zinc-600">
        ยกย้าย เป็นระบบจับคู่สำหรับข้าราชการครูและบุคลากรทางการศึกษาที่ต้องการย้ายสับเปลี่ยนตำแหน่งซึ่งกันและกัน
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">วิธีใช้งาน</h2>
        <p className="text-sm text-zinc-600">
          กรอกข้อมูลตำแหน่งปัจจุบันและจังหวัดที่ต้องการย้ายไป ระบบจะค้นหาผู้ที่มีความต้องการตรงกันข้ามกับคุณ —
          คือคนที่อยู่จังหวัดที่คุณอยากไป และอยากย้ายมาจังหวัดของคุณ
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">ขั้นตอนหลังจับคู่ได้</h2>
        <p className="text-sm text-zinc-600">
          เมื่อพบคู่ที่จับคู่กันได้ ท่านติดต่อกันผ่าน LINE เพื่อตกลงและดำเนินเรื่องย้ายสับเปลี่ยนตามกระบวนการของหน่วยงานต้นสังกัดต่อไป
          ระบบนี้ช่วยเฉพาะการค้นหาคู่เท่านั้น ไม่ได้ดำเนินการอนุมัติการย้ายแทนท่าน
        </p>
      </section>
    </div>
  )
}
