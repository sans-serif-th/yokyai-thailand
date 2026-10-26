'use client'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  // Red-text confirm button for actions that delete something.
  destructive?: boolean
  onCancel: () => void
  onConfirm: () => void
}

// Bottom-sheet confirm, same look as UpgradeDialog. Replaces window.confirm,
// whose native box can't be styled and shows the site's domain as its title.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'ยกเลิก',
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" role="dialog" aria-modal="true" aria-label={title}>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 rounded-t-[32px] bg-background px-4 py-6">
        <div className="flex flex-col items-center gap-1 py-2 text-center">
          <p className="text-base font-semibold leading-6">{title}</p>
          <p className="text-sm leading-[21px]">{message}</p>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={onCancel} className="btn-brand-secondary flex-1">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 ${destructive ? 'btn-brand-secondary text-brand-red!' : 'btn-brand-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
