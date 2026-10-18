import { getRoleImplementation } from './index'
import type { PairRow } from './types'

function groupByCategory<T extends PairRow>(rows: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const row of rows) {
    // Rows from before the column existed read as teachers (DB default).
    const key = row.category ?? 'teacher'
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }
  return groups
}

// Every mutual pair within each role's own rows. Rows of a role with no
// implementation are skipped; roles never pair with each other.
export function listMutualPairs<T extends PairRow>(rows: T[]): { a: T; b: T }[] {
  const pairs: { a: T; b: T }[] = []
  for (const [category, group] of groupByCategory(rows)) {
    const role = getRoleImplementation(category)
    if (!role) continue
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (role.isMutualPair(group[i], group[j])) pairs.push({ a: group[i], b: group[j] })
      }
    }
  }
  return pairs
}

export function countMutualPairs(rows: PairRow[]): number {
  return listMutualPairs(rows).length
}

// Pairs between two sets (e.g. unclaimed seeds vs real users), same role only.
export function listCrossPairs<T extends PairRow, U extends PairRow>(
  left: T[],
  right: U[]
): { left: T; right: U }[] {
  const pairs: { left: T; right: U }[] = []
  for (const l of left) {
    const role = getRoleImplementation(l.category ?? 'teacher')
    if (!role) continue
    for (const r of right) {
      if ((r.category ?? 'teacher') !== (l.category ?? 'teacher')) continue
      if (role.isMutualPair(l, r)) pairs.push({ left: l, right: r })
    }
  }
  return pairs
}
