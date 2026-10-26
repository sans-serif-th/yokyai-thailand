import sanitizeHtml from 'sanitize-html'
import { newsPayloadToRow, type NewsPayload } from './news'

// Server-only: sanitize-html is too heavy for the client bundle. News bodies
// are HTML written in the admin editor and shown to every user inside LINE,
// so they are filtered on the way in (newsRowForWrite) and again on the way
// out (the public /api/news/[id] route) — the allow-list below is the only
// markup that ever reaches a reader.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'h2',
    'h3',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'u',
    's',
    'blockquote',
    'hr',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
  },
  // No javascript:/data: URLs; images only from our own paths or https.
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
    }),
  },
}

export function sanitizeNewsHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS)
}

// Plain-text bodies (written before the editor existed) pass through
// untouched; only HTML bodies are filtered.
export function sanitizeNewsBody(body: string | null): string | null {
  if (!body) return body
  return body.trimStart().startsWith('<') ? sanitizeNewsHtml(body) : body
}

export function newsRowForWrite(payload: NewsPayload) {
  const row = newsPayloadToRow(payload)
  return { ...row, body: sanitizeNewsBody(row.body) }
}
