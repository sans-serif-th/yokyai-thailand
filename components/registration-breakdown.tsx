import type { RegistrationBreakdown } from '@/lib/types'

interface RegistrationBreakdownViewProps {
  breakdown: RegistrationBreakdown
  roundLabel: string | null
}

function formatNumber(n: number) {
  return n.toLocaleString('th-TH')
}

// Bar color differs per list purely for visual distinction between the
// three cards (origin/destination/subject) — matches the Figma update's
// per-card accent colors.
function RankedList({
  title,
  rows,
  barColor,
}: {
  title: string
  rows: { label: string; count: number }[]
  barColor: string
}) {
  const maxCount = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className="card-surface">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-zinc-500">ยังไม่มีข้อมูล</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <li key={r.label} className="flex items-center gap-2.5 text-sm">
              <span className="flex size-[17px] shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] text-zinc-500">
                {i + 1}
              </span>
              <span className="flex-1 min-w-0 truncate text-xs text-zinc-500">{r.label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${(r.count / maxCount) * 100}%`, backgroundColor: barColor }}
                />
              </span>
              <span className="w-6 shrink-0 text-right text-[10px] text-zinc-500">
                {formatNumber(r.count)}
              </span>
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
        barColor="#e52f3e"
      />
      <RankedList
        title="แยกตามจังหวัดปลายทาง"
        rows={breakdown.byDestinationProvince.map((r) => ({ label: r.province, count: r.count }))}
        barColor="#f29b28"
      />
      <RankedList
        title="แยกตามวิชาเอก"
        rows={breakdown.bySubject.map((r) => ({ label: r.subject, count: r.count }))}
        barColor="#0b66af"
      />
    </div>
  )
}
