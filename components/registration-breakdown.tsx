import type { RegistrationBreakdown } from '@/lib/types'

interface RegistrationBreakdownViewProps {
  breakdown: RegistrationBreakdown
  roundLabel: string | null
}

function formatNumber(n: number) {
  return n.toLocaleString('th-TH')
}

function RankedList({
  title,
  rows,
}: {
  title: string
  rows: { label: string; count: number }[]
}) {
  return (
    <div className="card-surface">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-zinc-500">ยังไม่มีข้อมูล</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between text-sm">
              <span>{r.label}</span>
              <span className="text-zinc-500">{formatNumber(r.count)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Shown on the matches/favorites tabs in place of match results while the
// active round is still in its registration phase (see lib/rounds.ts) —
// mirrors exactly where the old per-user queue-waiting screen used to
// render. Profile/criteria stay fully reachable via the bottom nav
// regardless — this only replaces the search-results body of these tabs.
export function RegistrationBreakdownView({ breakdown, roundLabel }: RegistrationBreakdownViewProps) {
  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-3">
      <div className="card-surface bg-sungold/20 text-center py-8">
        <p className="text-lg font-medium">ยังอยู่ในช่วงลงทะเบียน 📋</p>
        <p className="text-sm text-zinc-600 mt-2">
          ระบบจะเปิดให้ดูผลการจับคู่เมื่อถึงเวลาที่กำหนด
          {roundLabel ? ` (รอบ ${roundLabel})` : ''}
        </p>
        <p className="text-2xl font-bold mt-4">
          {formatNumber(breakdown.totalRegistered)} คนลงทะเบียนแล้ว
        </p>
        <p className="text-xs text-zinc-500 mt-4">
          ข้อมูลโปรไฟล์ของคุณถูกบันทึกแล้ว และแสดงให้คนอื่นเห็นได้ตามปกติ — คุณแก้ไขข้อมูลได้ตลอดเวลาที่เมนู
          &quot;โปรไฟล์&quot; และ &quot;เงื่อนไข&quot; ด้านล่าง
        </p>
      </div>

      <RankedList
        title="แยกตามจังหวัดต้นทาง"
        rows={breakdown.byOriginProvince.map((r) => ({ label: r.province, count: r.count }))}
      />
      <RankedList
        title="แยกตามจังหวัดปลายทาง"
        rows={breakdown.byDestinationProvince.map((r) => ({ label: r.province, count: r.count }))}
      />
      <RankedList
        title="แยกตามวิชาเอก"
        rows={breakdown.bySubject.map((r) => ({ label: r.subject, count: r.count }))}
      />
    </div>
  )
}
