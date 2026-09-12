import { Fragment } from 'react'
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
export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="flex w-full items-start" data-name="step-progress">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const reached = stepNum <= currentStep
        return (
          <Fragment key={label}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  reached ? 'bg-brand-red text-white' : 'bg-zinc-300 text-white'
                }`}
              >
                <CheckCircleIcon className="size-6" />
              </div>
              <span
                className={`text-center text-[14px] whitespace-nowrap ${
                  reached ? 'text-foreground' : 'text-zinc-300'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mt-4 h-1 flex-1 ${stepNum <= currentStep ? 'bg-brand-yellow' : 'bg-zinc-300'}`}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
