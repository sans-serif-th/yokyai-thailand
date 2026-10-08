// Home ("อัพเดท") news cards. Hardcoded for now (no CMS) — the two entries
// below carry the Figma's placeholder title/date/body; replace the text (and
// add banners under /public) as real announcements are published.
export interface NewsItem {
  id: string
  image: string
  title: string
  date: string
  body: string
}

export const NEWS: NewsItem[] = [
  {
    id: 'news-1',
    image: '/news-1.png',
    title: 'ประกาศข่าวสาร',
    date: '14 sep 26',
    body: 'Lorem ipsum dolor sit amet consectetur. Enim.',
  },
  {
    id: 'news-2',
    image: '/news-2.png',
    title: 'ประกาศข่าวสาร',
    date: '14 sep 26',
    body: 'Lorem ipsum dolor sit amet consectetur. Enim.',
  },
]
