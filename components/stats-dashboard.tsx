import type { PlatformStats } from '@/lib/types'

interface StatsDashboardProps {
  stats: PlatformStats
}

function formatNumber(n: number) {
  return n.toLocaleString('th-TH')
}

// Platform-wide summary shown above the search results — 5 boxes, all
// aggregate counts (see /api/stats). Never shows an individual teacher.
export function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="card-surface bg-sage/20 text-center">
        <p className="text-2xl font-bold">{formatNumber(stats.totalRegistered)}</p>
        <p className="text-xs text-zinc-600 mt-1">ลงทะเบียนทั้งหมด</p>
      </div>
      <div className="card-surface bg-sungold/20 text-center">
        <p className="text-2xl font-bold">{formatNumber(stats.matchCount)}</p>
        <p className="text-xs text-zinc-600 mt-1">จับคู่สำเร็จ</p>
      </div>
      <div className="card-surface bg-lavender/20 text-center">
        <p className="text-2xl font-bold">{formatNumber(stats.originProvinceCount)} จังหวัด</p>
        <p className="text-xs text-zinc-600 mt-1">ต้นทาง</p>
      </div>
      <div className="card-surface bg-lavender/20 text-center">
        <p className="text-2xl font-bold">{formatNumber(stats.destinationProvinceCount)} จังหวัด</p>
        <p className="text-xs text-zinc-600 mt-1">ปลายทาง</p>
      </div>
      <div className="card-surface bg-terracotta/20 text-center col-span-2">
        <p className="text-2xl font-bold">{formatNumber(stats.subjectCount)}</p>
        <p className="text-xs text-zinc-600 mt-1">สาขาวิชาทั้งหมด</p>
      </div>
    </div>
  )
}
