import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NEWS_CATALOG, DEFAULT_SOURCES } from '@/lib/newsCatalog'

export const dynamic = 'force-dynamic'

type NewsItem = { time: string; title: string }

function parseItems(data: { items?: { title: string; pubDate?: string }[] }): NewsItem[] {
  return (data.items ?? []).slice(0, 5).map((item) => {
    let time = ''
    if (item.pubDate) {
      const d = new Date(item.pubDate)
      time = `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
    }
    return { time, title: item.title }
  })
}

export async function GET() {
  const customNews: NewsItem[] = [{ time: '', title: 'MYHOME V2' }]

  // Lire les sources sélectionnées
  let selectedIds: string[] = DEFAULT_SOURCES
  try {
    const { data } = await supabaseAdmin
      .from('app_data')
      .select('data')
      .eq('type', 'news_sources')
      .single()
    if (Array.isArray(data?.data) && data.data.length > 0) {
      selectedIds = data.data as string[]
    }
  } catch {
    // garde les défauts
  }

  // Trouver les sources correspondantes
  const sources = NEWS_CATALOG.filter((s) => selectedIds.includes(s.id))
  if (sources.length === 0) {
    return Response.json(customNews)
  }

  // Fetcher tous les flux en parallèle
  try {
    const results = await Promise.allSettled(
      sources.map((s) =>
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(s.rss)}`)
          .then((r) => r.json())
          .then(parseItems)
      )
    )

    const allNews: NewsItem[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value)
      }
    }

    // Mélanger les news (Fisher-Yates)
    for (let i = allNews.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allNews[i], allNews[j]] = [allNews[j], allNews[i]]
    }

    return Response.json([...customNews, ...allNews.slice(0, 20)])
  } catch {
    return Response.json(customNews)
  }
}