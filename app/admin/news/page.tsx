'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RichTextEditor } from '@/components/rich-text-editor'
import { shrinkImageForUpload } from '@/lib/image-resize'
import {
  formatNewsDate,
  NEWS_CATEGORIES,
  newsCategoryLabel,
  newsVisibility,
  type NewsItem,
  type NewsPayload,
  type NewsVisibility,
} from '@/lib/news'

const VISIBILITY_LABEL: Record<NewsVisibility, string> = {
  draft: 'draft',
  scheduled: 'scheduled',
  live: 'live',
  expired: 'expired',
}

const VISIBILITY_STYLE: Record<NewsVisibility, string> = {
  live: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-600',
  draft: 'bg-amber-100 text-amber-800',
}

const EMPTY_FORM: NewsPayload = {
  category: 'news',
  title: '',
  published_date: new Date().toISOString().slice(0, 10),
  cover_image_url: null,
  body: null,
  published: true,
  publish_start: null,
  publish_end: null,
  sort_order: 0,
}

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm'

// /admin/news — create, edit, reorder (sort_order) and unpublish the home
// "อัพเดท" news. Auth is the same localStorage token as the other admin pages.
export default function AdminNewsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [form, setForm] = useState<NewsPayload | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  // Bumped whenever a different item is opened so the editor reloads its content.
  const [formVersion, setFormVersion] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const q = token ? `?token=${encodeURIComponent(token)}` : ''

  async function load(authToken: string) {
    setError(null)
    try {
      const res = await fetch(`/api/admin/news?token=${encodeURIComponent(authToken)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to load news')
        return
      }
      setNews(await res.json())
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(stored)
      load(stored)
    }
  }, [])

  function startCreate() {
    setEditingId(null)
    setFormVersion((v) => v + 1)
    setForm({ ...EMPTY_FORM, sort_order: news.length })
  }

  function startEdit(item: NewsItem) {
    setEditingId(item.id)
    setFormVersion((v) => v + 1)
    setForm({
      category: item.category,
      title: item.title,
      published_date: item.published_date,
      cover_image_url: item.cover_image_url,
      body: item.body,
      published: item.published,
      publish_start: item.publish_start,
      publish_end: item.publish_end,
      sort_order: item.sort_order,
    })
  }

  async function upload(file: File): Promise<string | null> {
    setError(null)
    const data = new FormData()
    data.append('file', await shrinkImageForUpload(file))
    const res = await fetch(`/api/admin/news/upload${q}`, { method: 'POST', body: data })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(body.error || 'Upload failed')
      return null
    }
    return body.url as string
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !token) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(editingId ? `/api/admin/news/${editingId}${q}` : `/api/admin/news${q}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to save news')
        return
      }
      setForm(null)
      setEditingId(null)
      await load(token)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: NewsItem) {
    if (!token || !window.confirm(`Delete "${item.title}"?`)) return
    setError(null)
    const res = await fetch(`/api/admin/news/${item.id}${q}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Failed to delete news')
      return
    }
    setNews((prev) => prev.filter((n) => n.id !== item.id))
  }

  function patchForm(patch: Partial<NewsPayload>) {
    setForm((f) => (f ? { ...f, ...patch } : f))
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <p className="mb-4">Please log in from the main admin dashboard first.</p>
          <Link href="/admin" className="font-medium text-blue-600 hover:underline">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">News</h1>
          <div className="flex gap-2">
            <button onClick={startCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Add news
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="sticky top-2 z-10 mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 shadow">
            {error}
          </p>
        )}

        {form && (
          <form onSubmit={handleSave} className="mb-8 flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit news' : 'New news'}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm">
                Category
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => patchForm({ category: e.target.value as NewsPayload['category'] })}
                >
                  {NEWS_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Date
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={form.published_date}
                  onChange={(e) => patchForm({ published_date: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Order (lower shows first)
                <input
                  type="number"
                  className={inputClass}
                  value={form.sort_order}
                  onChange={(e) => patchForm({ sort_order: Math.trunc(Number(e.target.value) || 0) })}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              Title (list card and top bar)
              <input
                required
                className={inputClass}
                value={form.title}
                onChange={(e) => patchForm({ title: e.target.value })}
              />
            </label>

            <div className="flex flex-col gap-2 text-sm">
              Cover image (PNG / JPEG / WebP — large images are resized automatically)
              {form.cover_image_url && (
                <Image
                  src={form.cover_image_url}
                  alt=""
                  width={160}
                  height={160}
                  unoptimized
                  className="size-40 rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const url = await upload(file)
                  if (url) patchForm({ cover_image_url: url })
                  e.target.value = ''
                }}
              />
              {form.cover_image_url && (
                <button
                  type="button"
                  className="w-fit text-gray-600 hover:underline"
                  onClick={() => patchForm({ cover_image_url: null })}
                >
                  Remove cover image
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1 text-sm">
              Content (title heading, text and images)
              <RichTextEditor
                key={formVersion}
                value={form.body}
                onChange={(html) => patchForm({ body: html })}
                onUploadImage={upload}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => patchForm({ published: e.target.checked })}
              />
              Published (visible in the app)
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Show from (optional)
                <input
                  type="date"
                  className={inputClass}
                  value={form.publish_start ?? ''}
                  max={form.publish_end ?? undefined}
                  onChange={(e) => patchForm({ publish_start: e.target.value || null })}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Show until (optional, inclusive)
                <input
                  type="date"
                  className={inputClass}
                  value={form.publish_end ?? ''}
                  min={form.publish_start ?? undefined}
                  onChange={(e) => patchForm({ publish_end: e.target.value || null })}
                />
              </label>
              <p className="text-xs text-gray-500 sm:col-span-2">
                Leave a date empty for no limit. Days are Thai calendar days.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(null)
                  setEditingId(null)
                }}
                className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="w-20 px-3 py-3 font-medium">Cover</th>
                <th className="px-3 py-3 font-medium">Title</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 text-right font-medium">Order</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Show window</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {news.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-gray-600">
                    No news yet.
                  </td>
                </tr>
              )}
              {news.map((item) => {
                const visibility = newsVisibility(item)
                return (
                  <tr key={item.id} className="align-middle hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {item.cover_image_url ? (
                        <Image
                          src={item.cover_image_url}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized
                          className="size-12 rounded object-cover"
                        />
                      ) : (
                        <div className="size-12 rounded bg-gray-200" />
                      )}
                    </td>
                    <td className="max-w-xs px-3 py-2 font-medium">{item.title}</td>
                    <td className="whitespace-nowrap px-3 py-2">{formatNewsDate(item.published_date)}</td>
                    <td className="px-3 py-2">{newsCategoryLabel(item.category)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{item.sort_order}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${VISIBILITY_STYLE[visibility]}`}
                      >
                        {VISIBILITY_LABEL[visibility]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                      {item.publish_start || item.publish_end ? (
                        <>
                          {item.publish_start ? formatNewsDate(item.publish_start) : '…'} –{' '}
                          {item.publish_end ? formatNewsDate(item.publish_end) : '…'}
                        </>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <button onClick={() => startEdit(item)} className="mr-3 text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
