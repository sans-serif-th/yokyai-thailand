'use client'

interface UpgradeDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

// Bottom-sheet confirm shown when a free-plan user taps "อัพเกรดเพื่อเพิ่ม
// ปลายทาง" (Figma "destination-2-added", node 147:1426).
export function UpgradeDialog({ open, onCancel, onConfirm }: UpgradeDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" role="dialog" aria-modal="true">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 rounded-t-[32px] bg-background px-4 py-6">
        <div className="flex flex-col items-center py-2 text-center">
          <p className="text-base font-semibold leading-6">กรุณาอัปเดตแผนปัจจุบันก่อนเพิ่มปลายทางใหม่</p>
          <p className="text-xs leading-[18px]">การเพิ่มปลายทางจะสามารถดำเนินการได้หลังจากอัปเดตแผนแล้ว</p>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={onCancel} className="btn-brand-secondary flex-1">
            ยกเลิก
          </button>
          <button type="button" onClick={onConfirm} className="btn-brand-primary flex-1">
            ตกลง
          </button>
        </div>
      </div>
    </div>
  )
}
