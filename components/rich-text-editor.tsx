'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { isHtmlBody } from '@/lib/news'

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// News written before the editor existed are plain paragraphs separated by a
// blank line; open them as paragraphs instead of one run-on block.
function toEditorHtml(body: string | null): string {
  if (!body) return ''
  if (isHtmlBody(body)) return body
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor selection while clicking toolbar buttons.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-8 rounded px-2 py-1 text-sm disabled:opacity-40 ${
        active ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({
  editor,
  onUploadImage,
}: {
  editor: Editor
  onUploadImage: (file: File) => Promise<string | null>
}) {
  function setLink() {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('ลิงก์ (https://...) — เว้นว่างเพื่อเอาลิงก์ออก', previous ?? 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  async function insertImage(file: File) {
    const url = await onUploadImage(file)
    if (url) editor.chain().focus().setImage({ src: url, alt: '' }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 p-1.5">
      <ToolbarButton label="ตัวหนา" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </ToolbarButton>
      <ToolbarButton label="ตัวเอียง" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </ToolbarButton>
      <ToolbarButton label="ขีดเส้นใต้" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </ToolbarButton>
      <ToolbarButton label="ขีดฆ่า" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
      <ToolbarButton label="หัวข้อใหญ่" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton label="หัวข้อย่อย" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <ToolbarButton label="รายการสัญลักษณ์" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • รายการ
      </ToolbarButton>
      <ToolbarButton label="รายการตัวเลข" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. รายการ
      </ToolbarButton>
      <ToolbarButton label="อ้างอิง" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        “ ”
      </ToolbarButton>
      <ToolbarButton label="เส้นคั่น" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        —
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
      <ToolbarButton label="ลิงก์" active={editor.isActive('link')} onClick={setLink}>
        ลิงก์
      </ToolbarButton>
      <label className="cursor-pointer rounded bg-white px-2 py-1 text-sm text-gray-800 hover:bg-gray-100">
        รูปภาพ
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) await insertImage(file)
            e.target.value = ''
          }}
        />
      </label>
      <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
      <ToolbarButton label="ย้อนกลับ" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton label="ทำซ้ำ" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </ToolbarButton>
    </div>
  )
}

// WYSIWYG editor for a news body. Emits HTML ('' when empty); the server
// sanitizes it again on save (lib/news-html.ts), so what the editor allows is
// a convenience, not the security boundary. Content is read once on mount —
// remount it (change `key`) to load a different news item.
export function RichTextEditor({
  value,
  onChange,
  onUploadImage,
}: {
  value: string | null
  onChange: (html: string) => void
  onUploadImage: (file: File) => Promise<string | null>
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      Image,
    ],
    content: toEditorHtml(value),
    // Rendered only on the client (admin page), and SSR would mismatch.
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'news-html min-h-[280px] rounded-b-lg border border-gray-300 bg-white p-3 focus:outline-none' },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  })

  if (!editor) return <div className="min-h-[320px] rounded-lg border border-gray-300 bg-gray-50" />

  return (
    <div>
      <Toolbar editor={editor} onUploadImage={onUploadImage} />
      <EditorContent editor={editor} />
    </div>
  )
}
