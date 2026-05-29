export const dynamic = 'force-dynamic'

type NewsItem = { time: string; title: string }

export async function GET() {
  const customNews: NewsItem[] = [
    { time: '', title: 'MYHOME V2' },
  ]

  try {
    const rssUrl = 'https://www.cnews.fr/rss.xml'
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
    )
    const data = await response.json()

    const rssNews: NewsItem[] = (data.items ?? [])
      .slice(0, 10)
      .map((item: { title: string; pubDate?: string }) => {
        let time = ''
        if (item.pubDate) {
          const d = new Date(item.pubDate)
          time = `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
        }
        return { time, title: item.title }
      })

    return Response.json([...customNews, ...rssNews])
  } catch {
    return Response.json(customNews)
  }
}