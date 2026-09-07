interface QueueWaitingProps {
  position: number | null
  totalWaiting: number | null
}

// Shown on the matches/favorites tabs instead of real results while the
// caller's own queue_released_at is still null (see lib/queue.ts). Profile
// and criteria stay fully reachable via the bottom nav regardless — this
// only replaces the search-results body of these two tabs.
export function QueueWaiting({ position, totalWaiting }: QueueWaitingProps) {
  return (
    <div className="max-w-lg mx-auto p-4 text-center">
      <div className="card-surface bg-sungold/20 py-8">
        <p className="text-lg font-medium">คุณลงทะเบียนสำเร็จแล้ว 🎉</p>
        <p className="text-sm text-zinc-600 mt-2">
          ตอนนี้เรากำลังทยอยเปิดให้ดูผลการจับคู่เป็นรอบๆ เพื่อดูแลระบบให้เสถียร
        </p>
        {position !== null && totalWaiting !== null && (
          <p className="text-2xl font-bold mt-4">
            คุณอยู่อันดับที่ {position} จาก {totalWaiting} คนที่รอ
          </p>
        )}
        <p className="text-xs text-zinc-500 mt-4">
          ข้อมูลโปรไฟล์ของคุณถูกบันทึกแล้ว และแสดงให้คนอื่นเห็นได้ตามปกติ — คุณแก้ไขข้อมูลได้ตลอดเวลาที่เมนู
          &quot;โปรไฟล์&quot; และ &quot;เงื่อนไข&quot; ด้านล่าง
        </p>
      </div>
    </div>
  )
}
