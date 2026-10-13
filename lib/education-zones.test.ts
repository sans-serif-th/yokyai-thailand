import { describe, expect, it } from 'vitest'
import { DISTRICTS_BY_PROVINCE } from './districts'
import { autoZone, primaryZoneDetails, zoneForDistrict, zonesFor } from './education-zones'

// Not real อำเภอ — intentionally left without a zone (see education-zones.ts).
const KNOWN_UNMAPPED = new Set(['ท้องถิ่นเทศบาลตำบลบ้านฆ้อง', 'ท้องถิ่นเทศบาลตำบลสำนักขาม'])

describe('zoneForDistrict', () => {
  it('resolves multi-zone provinces by district', () => {
    expect(zoneForDistrict('เชียงใหม่', 'ดอยสะเก็ด')).toBe('เขต 1')
    expect(zoneForDistrict('เชียงใหม่', 'แม่วาง')).toBe('เขต 4')
    expect(zoneForDistrict('นครราชสีมา', 'ปากช่อง')).toBe('เขต 4')
  })

  it('returns null for unknown districts', () => {
    expect(zoneForDistrict('เชียงใหม่', 'ไม่มีจริง')).toBeNull()
  })
})

describe('autoZone', () => {
  it('needs a district for multi-zone สพป. provinces', () => {
    expect(autoZone('primary', 'เชียงใหม่', '')).toBe('')
    expect(autoZone('primary', 'เชียงใหม่', 'แม่วาง')).toBe('เขต 4')
  })

  it('fills single-zone สพป. provinces from the province alone', () => {
    const [province] = Object.keys(DISTRICTS_BY_PROVINCE).filter(
      (p) => zonesFor('primary', p).length === 1
    )
    expect(autoZone('primary', province, '')).toBe(zonesFor('primary', province)[0])
  })

  it('fills สพม. from province, except 2-zone กรุงเทพมหานคร', () => {
    expect(autoZone('secondary', 'เชียงใหม่', '')).toBe(zonesFor('secondary', 'เชียงใหม่')[0])
    expect(zonesFor('secondary', 'กรุงเทพมหานคร').length).toBeGreaterThan(1)
    expect(autoZone('secondary', 'กรุงเทพมหานคร', '')).toBe('')
  })

  it('leaves สอศ. and empty inputs blank', () => {
    expect(autoZone('vocational', 'เชียงใหม่', 'เมืองเชียงใหม่')).toBe('')
    expect(autoZone('', 'เชียงใหม่', '')).toBe('')
    expect(autoZone('primary', '', '')).toBe('')
  })
})

describe('district master data', () => {
  it('maps every real อำเภอ of every สพป. province to one of its zones', () => {
    const problems: string[] = []
    for (const [province, districts] of Object.entries(DISTRICTS_BY_PROVINCE)) {
      const zones = zonesFor('primary', province)
      if (zones.length === 0) continue
      const details = primaryZoneDetails(province)
      const seen = new Map<string, string>()
      for (const { zone, districts: ds } of details) {
        if (!zones.includes(zone)) problems.push(`${province}: unknown zone ${zone}`)
        for (const d of ds) {
          if (seen.has(d)) problems.push(`${province}: ${d} in ${seen.get(d)} and ${zone}`)
          seen.set(d, zone)
        }
      }
      for (const d of districts) {
        if (KNOWN_UNMAPPED.has(d)) continue
        if (!seen.has(d)) problems.push(`${province}: ${d} has no zone`)
      }
      for (const d of seen.keys()) {
        if (!districts.includes(d)) problems.push(`${province}: ${d} not in districts.ts`)
      }
    }
    expect(problems).toEqual([])
  })
})
