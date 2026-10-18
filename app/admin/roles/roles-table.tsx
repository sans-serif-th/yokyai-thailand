'use client'

import { useState } from 'react'
import type { RoleInfo, RoleStatus } from '@/lib/types'

export interface AdminRole extends RoleInfo {
  userCount: number
  hasImplementation: boolean
}

const STATUS_LABEL: Record<RoleStatus, string> = {
  active: 'Active',
  coming_soon: 'Coming soon',
  hidden: 'Hidden',
}

interface RolesTableProps {
  roles: AdminRole[]
  onSave: (code: string, changes: Partial<Pick<RoleInfo, 'name_th' | 'name_en' | 'status' | 'sort_order'>>) => void
  onDelete: (role: AdminRole) => void
}

const cellInput =
  'w-full rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'

function RoleRow({ role, onSave, onDelete }: { role: AdminRole } & Omit<RolesTableProps, 'roles'>) {
  const [nameTh, setNameTh] = useState(role.name_th)
  const [nameEn, setNameEn] = useState(role.name_en)
  const [order, setOrder] = useState(String(role.sort_order))
  const dirty = nameTh !== role.name_th || nameEn !== role.name_en || order !== String(role.sort_order)

  return (
    <tr className="align-middle hover:bg-gray-50">
      <td className="px-3 py-2">
        <input
          type="number"
          aria-label={`Order of ${role.code}`}
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className={`${cellInput} w-16`}
        />
      </td>
      <td className="px-3 py-2 font-mono text-sm text-gray-700">{role.code}</td>
      <td className="px-3 py-2">
        <input
          aria-label={`Thai name of ${role.code}`}
          value={nameTh}
          onChange={(e) => setNameTh(e.target.value)}
          className={cellInput}
        />
      </td>
      <td className="px-3 py-2">
        <input
          aria-label={`English name of ${role.code}`}
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className={cellInput}
        />
      </td>
      <td className="px-3 py-2">
        <select
          aria-label={`Status of ${role.code}`}
          value={role.status}
          onChange={(e) => onSave(role.code, { status: e.target.value as RoleStatus })}
          className={cellInput}
        >
          {(Object.keys(STATUS_LABEL) as RoleStatus[]).map((status) => (
            <option key={status} value={status} disabled={status === 'active' && !role.hasImplementation}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-right tabular-nums">{role.userCount}</td>
      <td className="px-3 py-2">
        <span
          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
            role.hasImplementation ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {role.hasImplementation ? 'Has code' : 'No code yet'}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right">
        <button
          disabled={!dirty}
          onClick={() =>
            onSave(role.code, { name_th: nameTh, name_en: nameEn, sort_order: Number(order) })
          }
          className="mr-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={() => onDelete(role)}
          className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

export function RolesTable({ roles, onSave, onDelete }: RolesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-3 py-3 font-medium">Order</th>
            <th className="px-3 py-3 font-medium">Code</th>
            <th className="min-w-40 px-3 py-3 font-medium">Thai name</th>
            <th className="min-w-40 px-3 py-3 font-medium">English name</th>
            <th className="w-40 px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 text-right font-medium">Users</th>
            <th className="px-3 py-3 font-medium">Implementation</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {roles.map((role) => (
            <RoleRow key={role.code} role={role} onSave={onSave} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
