'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  formatNewsDate,
  newsVisibility,
  type NewsItem,
  type NewsPayload,
  type NewsStep,
  type NewsVisibility,
} from '@/lib/news'

const VISIBILITY_LABEL: Record<NewsVisibility, string> = {
  draft: 'draft',
  scheduled: 'scheduled',
  live: 'live',
  expired: 'expired',
}

const EMPTY_FORM: NewsPayload = {
  layout: 'article',
  title: '',
  published_date: new Date().toISOString().slice(0, 10),
  cover_image_url: null,
  heading: null,
  body: null,
  steps: [],
  published: true,
  publish_start: null,
  publish_end: null,
  sort_order: 0,
}

const EMPTY_STEP: NewsStep = { title: '', description: '', image_url: null }

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm'

// /admin/news — create, edit, reorder (sort_order) and unpublish the home
// "อัพเดท" news. Auth is the same localStorage token as the other admin pages.
export default function AdminNewsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [form, setForm] = useState<NewsPayload | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
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
    setForm({ ...EMPTY_FORM, sort_order: news.length })
  }

  function startEdit(item: NewsItem) {
    setEditingId(item.id)
    setForm({
      layout: item.layout,
      title: item.title,
      published_date: item.published_date,
      cover_image_url: item.cover_image_url,
      heading: item.heading,
      body: item.body,
      steps: item.steps,
      published: item.published,
      publish_start: item.publish_start,
      publish_end: item.publish_end,
      sort_order: item.sort_order,
    })
  }

  async function upload(file: File): Promise<string | null> {
    setError(null)
    const data = new FormData()
    data.append('file', file)
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

  function patchStep(index: number, patch: Partial<NewsStep>) {
    setForm((f) =>
      f ? { ...f, steps: f.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) } : f
    )
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">News</h1>
          <div className="flex gap-2">
            <button onClick={startCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Add news
            </button>
          </div>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {form && (
          <form onSubmit={handleSave} className="mb-8 flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit news' : 'New news'}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm">
                Layout
                <select
                  className={inputClass}
                  value={form.layout}
                  onChange={(e) => patchForm({ layout: e.target.value as NewsPayload['layout'] })}
                >
                  <option value="article">Article (heading + text)</option>
                  <option value="steps">Steps (numbered cards)</option>
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
              Cover image (PNG / JPEG / WebP, up to 5 MB)
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
            </div>

            <label className="flex flex-col gap-1 text-sm">
              Heading on the detail page
              <textarea
                rows={2}
                className={inputClass}
                value={form.heading ?? ''}
                onChange={(e) => patchForm({ heading: e.target.value })}
              />
            </label>

            {form.layout === 'article' ? (
              <label className="flex flex-col gap-1 text-sm">
                Body (leave a blank line between paragraphs)
                <textarea
                  rows={12}
                  className={inputClass}
                  value={form.body ?? ''}
                  onChange={(e) => patchForm({ body: e.target.value })}
                />
              </label>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">Steps</p>
                {form.steps.map((step, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between text-sm font-medium">
                      Step {i + 1}
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => patchForm({ steps: form.steps.filter((_, j) => j !== i) })}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      className={inputClass}
                      placeholder="Title"
                      value={step.title}
                      onChange={(e) => patchStep(i, { title: e.target.value })}
                    />
                    <textarea
                      rows={2}
                      className={inputClass}
                      placeholder="Description"
                      value={step.description}
                      onChange={(e) => patchStep(i, { description: e.target.value })}
                    />
                    <div className="flex items-center gap-3 text-sm">
                      {step.image_url && (
                        <Image
                          src={step.image_url}
                          alt=""
                          width={64}
                          height={64}
                          unoptimized
                          className="size-16 rounded object-contain"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const url = await upload(file)
                          if (url) patchStep(i, { image_url: url })
                          e.target.value = ''
                        }}
                      />
                      {step.image_url && (
                        <button
                          type="button"
                          className="text-gray-600 hover:underline"
                          onClick={() => patchStep(i, { image_url: null })}
                        >
                          Clear image
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="w-fit rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => patchForm({ steps: [...form.steps, { ...EMPTY_STEP }] })}
                >
                  Add step
                </button>
              </div>
            )}

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

        <div className="flex flex-col gap-3">
          {news.length === 0 && <p className="text-gray-600">No news yet.</p>}
          {news.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg bg-white p-3 shadow">
              {item.cover_image_url ? (
                <Image
                  src={item.cover_image_url}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="size-16 shrink-0 rounded bg-gray-200" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">
                  {formatNewsDate(item.published_date)} · {item.layout} · order {item.sort_order} ·{' '}
                  {VISIBILITY_LABEL[newsVisibility(item)]}
                  {(item.publish_start || item.publish_end) && (
                    <>
                      {' '}
                      ({item.publish_start ? formatNewsDate(item.publish_start) : '…'} –{' '}
                      {item.publish_end ? formatNewsDate(item.publish_end) : '…'})
                    </>
                  )}
                </p>
              </div>
              <button onClick={() => startEdit(item)} className="text-blue-600 hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(item)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
