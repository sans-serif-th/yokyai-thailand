'use client'

import { useState } from 'react'
import type { RoleInfo, RoleStatus } from '@/lib/types'

export interface AdminRole extends RoleInfo {
  userCount: number
  hasImplementation: boolean
}

const STATUS_LABEL: Record<RoleStatus, string> = {
  active: 'Active — selectable at sign-up',
  coming_soon: 'Coming soon — listed as "เร็วๆนี้"',
  hidden: 'Hidden',
}

interface RolesTableProps {
  roles: AdminRole[]
  onSave: (code: string, changes: Partial<Pick<RoleInfo, 'name_th' | 'name_en' | 'status' | 'sort_order'>>) => void
  onDelete: (role: AdminRole) => void
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

function RoleRow({ role, onSave, onDelete }: { role: AdminRole } & Omit<RolesTableProps, 'roles'>) {
  const [nameTh, setNameTh] = useState(role.name_th)
  const [nameEn, setNameEn] = useState(role.name_en)
  const [order, setOrder] = useState(String(role.sort_order))
  const dirty = nameTh !== role.name_th || nameEn !== role.name_en || order !== String(role.sort_order)

  return (
    <li className="p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm text-gray-600">{role.code}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            role.hasImplementation ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {role.hasImplementation ? 'Has code' : 'No code yet'}
        </span>
        <span className="text-xs text-gray-500">{role.userCount} user(s)</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_5rem]">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Thai name</span>
          <input value={nameTh} onChange={(e) => setNameTh(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">English name</span>
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Order</span>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block flex-1 text-sm">
          <span className="mb-1 block font-medium">Status</span>
          <select
            value={role.status}
            onChange={(e) => onSave(role.code, { status: e.target.value as RoleStatus })}
            className={inputClass}
          >
            {(Object.keys(STATUS_LABEL) as RoleStatus[]).map((status) => (
              <option key={status} value={status} disabled={status === 'active' && !role.hasImplementation}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={!dirty}
          onClick={() =>
            onSave(role.code, { name_th: nameTh, name_en: nameEn, sort_order: Number(order) })
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={() => onDelete(role)}
          className="rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export function RolesTable({ roles, onSave, onDelete }: RolesTableProps) {
  return (
    <ul className="divide-y divide-gray-200 rounded-lg bg-white shadow">
      {roles.map((role) => (
        <RoleRow key={role.code} role={role} onSave={onSave} onDelete={onDelete} />
      ))}
    </ul>
  )
}
