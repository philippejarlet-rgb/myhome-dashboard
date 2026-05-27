export async function GET() {

  // NEWS MYHOME

  const customNews = [

    '🚀 Bienvenue sur MYHOME V1',
   // '🎵 Couleur 3 disponible',
   // '☀️ Dashboard cuisine opérationnel',
    //'🍷 Vin conseillé ce soir : Syrah',
    //'🍳 Atlas Culinaire bientôt intégré',
    //'🚀 MYHOME OS v0.1 actif',

  ]

  try {

    // RSS LIVE

    const rssUrl =
      'https://feeds.bbci.co.uk/news/world/rss.xml'

    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`
    )

    const data = await response.json()

    const rssNews = data.items
      .slice(0, 10)
      .map((item: any) => `📰 ${item.title}`)

    return Response.json([
      ...customNews,
      ...rssNews,
    ])

  } catch (error) {

    console.error(error)

    return Response.json(customNews)

  }
}