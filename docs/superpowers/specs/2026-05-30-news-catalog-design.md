# News Catalog — Design Spec

**Date:** 2026-05-30  
**Goal:** Remplacer la source news hardcodée (CNews) par un catalogue de 20 sources organisées par pays. L'utilisateur sélectionne ses sources depuis une page `/news`.

---

## Catalogue de sources (hardcodé)

```typescript
const NEWS_CATALOG = [
  // France
  { id: 'lemonde', country: 'fr', label: 'Le Monde', rss: 'https://www.lemonde.fr/rss/une.xml' },
  { id: 'lefigaro', country: 'fr', label: 'Le Figaro', rss: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },
  { id: 'bfmtv', country: 'fr', label: 'BFM TV', rss: 'https://www.bfmtv.com/rss/news-24-7/' },
  { id: 'cnews', country: 'fr', label: 'CNews', rss: 'https://www.cnews.fr/rss.xml' },
  { id: '20minutes', country: 'fr', label: '20 Minutes', rss: 'https://www.20minutes.fr/feeds/rss/actu/' },
  // Suisse
  { id: 'rts', country: 'ch', label: 'RTS', rss: 'https://www.rts.ch/rss/info/' },
  { id: 'letemps', country: 'ch', label: 'Le Temps', rss: 'https://www.letemps.ch/rss' },
  { id: '20minch', country: 'ch', label: '20min.ch', rss: 'https://www.20min.ch/rss/rss.tmpl?type=channel&get=1' },
  { id: 'tdg', country: 'ch', label: 'Tribune de Genève', rss: 'https://www.tdg.ch/rss' },
  { id: '24heures', country: 'ch', label: '24heures', rss: 'https://www.24heures.ch/rss' },
  // Belgique
  { id: 'rtbf', country: 'be', label: 'RTBF', rss: 'https://www.rtbf.be/api/partner/json/rss?collection=13&partner=rss' },
  { id: 'lesoir', country: 'be', label: 'Le Soir', rss: 'https://www.lesoir.be/feed' },
  { id: 'lalibre', country: 'be', label: 'La Libre', rss: 'https://www.lalibre.be/arc/outboundfeeds/rss/' },
  { id: 'rtlinfo', country: 'be', label: 'RTL Info', rss: 'https://feeds.rtl.be/rtlinfo_fr' },
  { id: 'dhnet', country: 'be', label: 'DH Les Sports+', rss: 'https://www.dhnet.be/feed' },
  // International
  { id: 'bbc', country: 'int', label: 'BBC World', rss: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'reuters', country: 'int', label: 'Reuters', rss: 'https://feeds.reuters.com/reuters/topNews' },
  { id: 'aljazeera', country: 'int', label: 'Al Jazeera', rss: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'guardian', country: 'int', label: 'The Guardian', rss: 'https://www.theguardian.com/international/rss' },
  { id: 'france24', country: 'int', label: 'France 24', rss: 'https://www.france24.com/fr/rss' },
]
```

Logos via Google Favicons : `https://www.google.com/s2/favicons?domain=<domain>&sz=64`

---

## Page `/news`

### Layout
- Header : ← Retour + titre "Sources d'actualité"
- 4 sections par pays avec drapeau + nom
- Grille de logos cliquables (4 colonnes)
- Chaque source : logo + nom + coche active/inactive
- Bouton "Enregistrer" en bas

### Interaction
- Clic sur une source → toggle sélection
- "Enregistrer" → `PUT /api/data/news_sources` avec `string[]` des IDs sélectionnés
- Chargement initial : `GET /api/data/news_sources` → si vide, défaut `['cnews', 'bbc']`

---

## API `/api/news` — modifiée

Lit les sources sélectionnées depuis Supabase, fetche leurs flux RSS en parallèle, retourne `{ time, title }[]` mélangés.

Fallback si aucune source sélectionnée : CNews + BBC.

---

## Bottom bar

Bouton 📰 **News** à la place d'Agenda, lien `/news`.

---

## Supabase

Nouveau type dans `app_data` : `news_sources` → `string[]` des IDs.  
Insérer la valeur par défaut dans Supabase SQL Editor :

```sql
INSERT INTO app_data (type, data) VALUES ('news_sources', '["cnews", "bbc"]')
ON CONFLICT (type) DO NOTHING;
```

---

## Hors scope
- Logos custom uploadés
- Ordre personnalisé des sources
- Prévisualisation des flux avant sélection
