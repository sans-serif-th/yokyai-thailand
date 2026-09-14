import { CheckCircleIcon } from './icons'

interface StepProgressProps {
  steps: string[]
  currentStep: number // 1-indexed
}

// Circles-with-checkmarks stepper shown above each numbered onboarding-wizard
// step, replacing the old plain-text step row. A step is "reached" (red,
// checkmark, dark label) once its number is <= currentStep; everything after
// stays gray. Connector segments follow the same reached/not-reached split —
// see the Figma "Group 1" component this is based on (node 147:1575 in the
// 2026-09 onboarding-wizard update file).
//
// Positions are computed as percentages (each step's circle sits at the
// center of its 1/N-wide column) and the connector bars are absolutely
// positioned between consecutive centers, rather than relying on flexbox
// flex-1 gaps — those visually collapsed to near-nothing on narrow screens
// because the long, non-wrapping Thai labels refused to shrink, so the
// browser starved the flex-1 connectors of space instead.
export function StepProgress({ steps, currentStep }: StepProgressProps) {
  const n = steps.length
  return (
    <div className="relative w-full" data-name="step-progress">
      <div className="pointer-events-none absolute inset-x-0 top-4 h-1">
        {steps.slice(0, -1).map((_, i) => {
          const left = ((i + 0.5) / n) * 100
          const width = (1 / n) * 100
          const reached = i + 1 <= currentStep
          return (
            <div
              key={i}
              className={`absolute h-full ${reached ? 'bg-brand-yellow' : 'bg-zinc-300'}`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )
        })}
      </div>
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {steps.map((label, i) => {
          const stepNum = i + 1
          const reached = stepNum <= currentStep
          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  reached ? 'bg-brand-red text-white' : 'bg-zinc-300 text-white'
                }`}
              >
                <CheckCircleIcon className="size-6" />
              </div>
              <span
                className={`text-center text-[12px] leading-tight ${
                  reached ? 'text-foreground' : 'text-zinc-300'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
