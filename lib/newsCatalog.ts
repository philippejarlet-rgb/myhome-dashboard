export type NewsSource = {
  id: string
  country: 'fr' | 'ch' | 'be' | 'int'
  label: string
  domain: string
  rss: string
}

export const NEWS_CATALOG: NewsSource[] = [
  // France
  { id: 'lemonde', country: 'fr', label: 'Le Monde', domain: 'lemonde.fr', rss: 'https://www.lemonde.fr/rss/une.xml' },
  { id: 'lefigaro', country: 'fr', label: 'Le Figaro', domain: 'lefigaro.fr', rss: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },
  { id: 'bfmtv', country: 'fr', label: 'BFM TV', domain: 'bfmtv.com', rss: 'https://www.bfmtv.com/rss/news-24-7/' },
  { id: 'cnews', country: 'fr', label: 'CNews', domain: 'cnews.fr', rss: 'https://www.cnews.fr/rss.xml' },
  { id: '20minutes', country: 'fr', label: '20 Minutes', domain: '20minutes.fr', rss: 'https://www.20minutes.fr/feeds/rss/actu/' },
  // Suisse
  { id: 'rts', country: 'ch', label: 'RTS', domain: 'rts.ch', rss: 'https://www.rts.ch/rss/info/' },
  { id: 'letemps', country: 'ch', label: 'Le Temps', domain: 'letemps.ch', rss: 'https://www.letemps.ch/rss' },
  { id: '20minch', country: 'ch', label: '20min.ch', domain: '20min.ch', rss: 'https://www.20min.ch/rss/rss.tmpl?type=channel&get=1' },
  { id: 'tdg', country: 'ch', label: 'Tribune de Genève', domain: 'tdg.ch', rss: 'https://www.tdg.ch/rss' },
  { id: '24heures', country: 'ch', label: '24heures', domain: '24heures.ch', rss: 'https://www.24heures.ch/rss' },
  // Belgique
  { id: 'rtbf', country: 'be', label: 'RTBF', domain: 'rtbf.be', rss: 'https://www.rtbf.be/api/partner/json/rss?collection=13&partner=rss' },
  { id: 'lesoir', country: 'be', label: 'Le Soir', domain: 'lesoir.be', rss: 'https://www.lesoir.be/feed' },
  { id: 'lalibre', country: 'be', label: 'La Libre', domain: 'lalibre.be', rss: 'https://www.lalibre.be/arc/outboundfeeds/rss/' },
  { id: 'rtlinfo', country: 'be', label: 'RTL Info', domain: 'rtl.be', rss: 'https://feeds.rtl.be/rtlinfo_fr' },
  { id: 'dhnet', country: 'be', label: 'DH Les Sports+', domain: 'dhnet.be', rss: 'https://www.dhnet.be/feed' },
  // International
  { id: 'bbc', country: 'int', label: 'BBC World', domain: 'bbc.co.uk', rss: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'reuters', country: 'int', label: 'Reuters', domain: 'reuters.com', rss: 'https://feeds.reuters.com/reuters/topNews' },
  { id: 'aljazeera', country: 'int', label: 'Al Jazeera', domain: 'aljazeera.com', rss: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'guardian', country: 'int', label: 'The Guardian', domain: 'theguardian.com', rss: 'https://www.theguardian.com/international/rss' },
  { id: 'france24', country: 'int', label: 'France 24', domain: 'france24.com', rss: 'https://www.france24.com/fr/rss' },
]

export const COUNTRY_LABELS: Record<string, string> = {
  fr: '🇫🇷 France',
  ch: '🇨🇭 Suisse',
  be: '🇧🇪 Belgique',
  int: '🌍 International',
}

export const DEFAULT_SOURCES = ['cnews', 'bbc']

export function logoUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}
