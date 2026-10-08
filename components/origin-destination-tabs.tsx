'use client'

import { SegmentedTabs } from './segmented-tabs'

export type OriginDestinationTab = 'origin' | 'destination'

interface OriginDestinationTabsProps {
  active: OriginDestinationTab
  onChange: (tab: OriginDestinationTab) => void
}

export function OriginDestinationTabs({ active, onChange }: OriginDestinationTabsProps) {
  return (
    <SegmentedTabs
      compact
      value={active}
      onChange={onChange}
      options={[
        { value: 'origin', label: 'ต้นทาง' },
        { value: 'destination', label: 'ปลายทาง' },
      ]}
    />
  )
}
