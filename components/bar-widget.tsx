'use client'

import { useState, useEffect } from 'react'
import { Wine, Search, Sparkles, ChevronDown, ChevronUp, X, Plus } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type CocktailDB = {
  idDrink: string
  strDrink: string
  strCategory: string
  strAlcoholic: string
  strGlass: string
  strInstructions: string
  strDrinkThumb: string | null
  [key: string]: string | null
}

type AiCocktail = {
  name: string
  name_en: string | null
  description: string
  glass: string
  ingredients_used: string[]
  missing?: string[]
  thumb?: string | null
}

type Tab = 'suggestions' | 'recherche' | 'ia'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFraction(s: string): number {
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3])
  const frac = s.match(/^(\d+)\/(\d+)$/)
  if (frac) return parseInt(frac[1]) / parseInt(frac[2])
  return parseFloat(s) || 0
}

function convertMeasure(meas: string): string {
  const m = meas.trim().toLowerCase()

  const oz = m.match(/^([\d\s/]+)\s*oz\.?$/)
  if (oz) {
    const cl = Math.round(parseFraction(oz[1]) * 3 * 10) / 10
    return `${cl} cl`
  }
  const tsp = m.match(/^([\d\s/]+)\s*tsp\.?$/)
  if (tsp) {
    const cl = Math.round(parseFraction(tsp[1]) * 0.5 * 10) / 10
    return `${cl} cl`
  }
  const tbsp = m.match(/^([\d\s/]+)\s*tbsp\.?$/)
  if (tbsp) {
    const cl = Math.round(parseFraction(tbsp[1]) * 1.5 * 10) / 10
    return `${cl} cl`
  }
  const cup = m.match(/^([\d\s/]+)\s*cups?\.?$/)
  if (cup) {
    const cl = Math.round(parseFraction(cup[1]) * 25)
    return `${cl} cl`
  }
  if (/dash/.test(m)) return 'quelques gouttes'
  if (/splash|top up/.test(m)) return 'compléter'
  if (/twist/.test(m)) return '1 zeste'
  if (/slice/.test(m)) return '1 tranche'
  if (/wedge/.test(m)) return '1 quartier'
  if (/fill|top/.test(m)) return 'compléter'
  if (/part/.test(m)) return meas.trim().replace(/parts?/gi, 'mesure')

  return meas.trim()
}

function parseIngredients(c: CocktailDB): string[] {
  const list: string[] = []
  for (let i = 1; i <= 15; i++) {
    const ing = c[`strIngredient${i}`]
    const meas = c[`strMeasure${i}`]
    if (ing) list.push(meas ? `${convertMeasure(meas)} ${tIng(ing)}` : tIng(ing))
  }
  return list
}

function frInstructions(c: CocktailDB): { text: string; isFr: boolean } | undefined {
  const fr = (c.strInstructionsFR as string | null | undefined)?.trim()
  if (fr) return { text: fr, isFr: true }
  const en = c.strInstructions?.trim()
  if (en) return { text: en, isFr: false }
  return undefined
}

// ─── Tables de traduction ─────────────────────────────────────────────────────

const INGREDIENT_FR: Record<string, string> = {
  'Gin': 'Gin', 'Vodka': 'Vodka', 'Rum': 'Rhum', 'White Rum': 'Rhum blanc',
  'Dark Rum': 'Rhum brun', 'Tequila': 'Tequila', 'Whiskey': 'Whisky',
  'Bourbon': 'Bourbon', 'Scotch': 'Scotch', 'Brandy': 'Brandy',
  'Cognac': 'Cognac', 'Champagne': 'Champagne', 'Wine': 'Vin',
  'Red Wine': 'Vin rouge', 'White Wine': 'Vin blanc',
  'Triple Sec': 'Triple Sec', 'Cointreau': 'Cointreau',
  'Sweet Vermouth': 'Vermouth rouge', 'Dry Vermouth': 'Vermouth sec',
  'Campari': 'Campari', 'Aperol': 'Aperol', 'Absinthe': 'Absinthe',
  'Peach Schnapps': 'Schnapps pêche', 'Amaretto': 'Amaretto',
  'Kahlua': 'Kahlua', 'Grand Marnier': 'Grand Marnier',
  'Baileys irish cream': 'Baileys', 'Lillet': 'Lillet',
  'Cola': 'Cola', 'Coca-Cola': 'Coca-Cola', 'Sprite': 'Sprite',
  'Ginger Beer': 'Bière de gingembre', 'Ginger Ale': 'Ginger ale',
  'Tonic water': 'Eau tonique', 'Club Soda': 'Soda', 'Soda Water': 'Eau gazeuse',
  'Orange Juice': "Jus d'orange", 'Cranberry Juice': 'Jus de cranberry',
  'Pineapple Juice': "Jus d'ananas", 'Lime Juice': 'Jus de citron vert',
  'Lemon Juice': 'Jus de citron', 'Grapefruit Juice': 'Jus de pamplemousse',
  'Tomato Juice': 'Jus de tomate', 'Apple Juice': 'Jus de pomme',
  'Coconut Cream': 'Crème de coco', 'Coconut Milk': 'Lait de coco',
  'Cream': 'Crème', 'Heavy Cream': 'Crème liquide', 'Whipped Cream': 'Crème fouettée',
  'Milk': 'Lait', 'Egg': 'Œuf', 'Egg White': "Blanc d'œuf", 'Egg Yolk': "Jaune d'œuf",
  'Simple Syrup': 'Sirop de sucre', 'Sugar Syrup': 'Sirop de sucre',
  'Grenadine': 'Grenadine', 'Honey': 'Miel', 'Sugar': 'Sucre',
  'Brown Sugar': 'Sucre roux', 'Powdered Sugar': 'Sucre glace',
  'Salt': 'Sel', 'Ice': 'Glace', 'Crushed Ice': 'Glace pilée',
  'Orange Peel': "Zeste d'orange", 'Lemon Peel': 'Zeste de citron',
  'Lime Peel': 'Zeste de citron vert', 'Lime wedge': 'Quartier de citron vert',
  'Lemon wedge': 'Quartier de citron', 'Lime': 'Citron vert', 'Lemon': 'Citron',
  'Orange': 'Orange', 'Mint': 'Menthe', 'Mint Leaves': 'Feuilles de menthe',
  'Mango': 'Mangue', 'Strawberry': 'Fraise', 'Peach': 'Pêche',
  'Raspberry': 'Framboise', 'Blackberry': 'Mûre', 'Blueberry': 'Myrtille',
  'Pineapple': 'Ananas', 'Watermelon': 'Pastèque', 'Cucumber': 'Concombre',
  'Celery': 'Céleri', 'Ginger': 'Gingembre', 'Cinnamon': 'Cannelle',
  'Nutmeg': 'Muscade', 'Tabasco': 'Tabasco',
  'Worcestershire Sauce': 'Sauce Worcestershire', 'Hot Sauce': 'Sauce piquante',
  'Bitters': 'Bitter', 'Angostura Bitters': 'Bitter Angostura',
  'Peychaud Bitters': 'Bitter Peychaud',
  'Maraschino Cherry': "Cerise à l'eau-de-vie", 'Cherry': 'Cerise',
  'Olive': 'Olive', 'Water': 'Eau', 'Soda': 'Soda',
  'Crown Royal': 'Crown Royal (whisky canadien)',
  'Frangelico': 'Frangelico (liqueur noisette)',
  'Drambuie': 'Drambuie (liqueur écossaise)',
  'Midori': 'Midori (liqueur melon)',
  'Blue Curacao': 'Curaçao bleu', 'Chambord': 'Chambord (liqueur framboise)',
  'Limoncello': 'Limoncello', 'Prosecco': 'Prosecco', 'Cava': 'Cava',
  'Orgeat syrup': "Sirop d'orgeat", 'Agave syrup': "Sirop d'agave",
}

const GLASS_FR: Record<string, string> = {
  'Cocktail glass': 'Verre à cocktail', 'Martini Glass': 'Verre à martini',
  'Highball glass': 'Verre highball', 'Old-fashioned glass': 'Verre old-fashioned',
  'Collins Glass': 'Verre Collins', 'Shot glass': 'Verre à shot',
  'Beer mug': 'Chope à bière', 'Beer Glass': 'Verre à bière',
  'Champagne flute': 'Flûte à champagne', 'Wine Glass': 'Verre à vin',
  'Margarita glass': 'Verre à margarita', 'Hurricane glass': 'Verre hurricane',
  'Copper Mug': 'Chope en cuivre', 'Irish coffee cup': 'Tasse irish coffee',
  'Punch bowl': 'Bol à punch', 'Pitcher': 'Pichet',
  'Pint glass': 'Verre pinte', 'Jar': 'Bocal', 'Mason jar': 'Bocal mason',
  'Whiskey Glass': 'Verre à whisky', 'Whiskey sour glass': 'Verre à whisky sour',
  'Brandy snifter': 'Verre ballon', 'Pousse cafe glass': 'Verre pousse-café',
}

const ALCOHOLIC_FR: Record<string, string> = {
  'Alcoholic': 'Alcoolisé', 'Non alcoholic': 'Sans alcool', 'Optional alcohol': 'Alcool optionnel',
}

const CATEGORY_FR: Record<string, string> = {
  'Ordinary Drink': 'Classique', 'Cocktail': 'Cocktail', 'Shot': 'Shot',
  'Coffee / Tea': 'Café / Thé', 'Homemade Liqueur': 'Liqueur maison',
  'Punch / Party Drink': 'Punch', 'Beer': 'Bière', 'Soft Drink / Soda': 'Sans alcool',
  'Cocoa': 'Chocolat', 'Shake': 'Shake', 'Other/Unknown': 'Autre',
}

function tIng(name: string): string {
  return INGREDIENT_FR[name] ?? INGREDIENT_FR[name.toLowerCase()] ?? name
}
function tGlass(g: string | null | undefined): string | undefined {
  if (!g) return undefined
  return GLASS_FR[g] ?? g
}
function tAlco(a: string | null | undefined): string | undefined {
  if (!a) return undefined
  return ALCOHOLIC_FR[a] ?? a
}
function tCat(c: string | null | undefined): string | undefined {
  if (!c) return undefined
  return CATEGORY_FR[c] ?? c
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

function CocktailCard({
  thumb,
  name,
  sub,
  glass,
  active,
  onToggle,
}: {
  thumb: string | null
  name: string
  sub?: string
  glass?: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-2xl overflow-hidden transition-all border ${
        active
          ? 'border-cyan-500/50 bg-cyan-900/20'
          : 'border-white/5 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        {thumb ? (
          <img src={thumb} alt={name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Wine size={22} className="text-zinc-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base leading-tight truncate">{name}</div>
          {sub && <div className="text-xs text-zinc-400 mt-0.5 truncate">{sub}</div>}
          {glass && <div className="text-xs text-zinc-500 mt-0.5">{glass}</div>}
        </div>
        {active ? <ChevronUp size={18} className="text-cyan-400 shrink-0" /> : <ChevronDown size={18} className="text-zinc-500 shrink-0" />}
      </div>
    </button>
  )
}

function DetailPanel({
  thumb,
  name,
  category,
  alcoholic,
  glass,
  instructions,
  instructionsInFr = true,
  ingredients,
  onClose,
}: {
  thumb: string | null
  name: string
  category?: string
  alcoholic?: string
  glass?: string
  instructions?: string
  instructionsInFr?: boolean
  ingredients: string[]
  onClose: () => void
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-cyan-500/30 p-4 mt-2">
      <div className="flex gap-4">
        {thumb && (
          <img src={thumb} alt={name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg leading-tight">{name}</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-white shrink-0">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {category && (
              <span className="text-xs bg-white/10 rounded-full px-2 py-0.5">{category}</span>
            )}
            {alcoholic && (
              <span className="text-xs bg-white/10 rounded-full px-2 py-0.5">{alcoholic}</span>
            )}
            {glass && (
              <span className="text-xs bg-cyan-900/40 text-cyan-300 rounded-full px-2 py-0.5">{glass}</span>
            )}
          </div>
        </div>
      </div>

      {ingredients.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Ingrédients</div>
          <ul className="flex flex-wrap gap-1.5">
            {ingredients.map((ing, i) => (
              <li key={i} className="text-sm bg-white/10 rounded-full px-3 py-1">{ing}</li>
            ))}
          </ul>
        </div>
      )}

      {instructions && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Préparation</div>
            {!instructionsInFr && (
              <span className="text-xs text-zinc-500 italic">(en anglais)</span>
            )}
          </div>
          <p className={`text-sm leading-relaxed ${instructionsInFr ? 'text-zinc-300' : 'text-zinc-400'}`}>
            {instructions}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Onglet Suggestions ───────────────────────────────────────────────────────

function TabSuggestions() {
  const [cocktails, setCocktails] = useState<CocktailDB[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setActiveId(null)
    try {
      const results = await Promise.all(
        Array.from({ length: 6 }, () =>
          fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
            .then(r => r.json())
            .then(d => d.drinks?.[0] as CocktailDB | undefined)
        )
      )
      setCocktails(results.filter(Boolean) as CocktailDB[])
    } catch {
      setCocktails([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const active = activeId ? cocktails.find(c => c.idDrink === activeId) : null

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={load}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Nouvelles suggestions →
        </button>
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-8">Chargement…</div>
      ) : (
        <div className="space-y-2">
          {cocktails.map(c => (
            <div key={c.idDrink}>
              <CocktailCard
                thumb={c.strDrinkThumb}
                name={c.strDrink}
                sub={tCat(c.strCategory)}
                glass={tGlass(c.strGlass)}
                active={activeId === c.idDrink}
                onToggle={() => setActiveId(activeId === c.idDrink ? null : c.idDrink)}
              />
              {activeId === c.idDrink && active && (
                <DetailPanel
                  thumb={active.strDrinkThumb}
                  name={active.strDrink}
                  category={tCat(active.strCategory)}
                  alcoholic={tAlco(active.strAlcoholic)}
                  glass={tGlass(active.strGlass)}
                  instructions={frInstructions(active)?.text}
                  instructionsInFr={frInstructions(active)?.isFr ?? true}
                  ingredients={parseIngredients(active)}
                  onClose={() => setActiveId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Onglet Recherche ─────────────────────────────────────────────────────────

function TabRecherche() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CocktailDB[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setActiveId(null)
    try {
      const r = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query.trim())}`
      )
      const d = await r.json()
      setResults(d.drinks ?? [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const active = activeId ? results.find(c => c.idDrink === activeId) : null

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Nom du cocktail…"
          className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-base placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
        <button
          onClick={search}
          className="bg-cyan-600 hover:bg-cyan-500 rounded-xl px-4 py-3 transition-colors"
        >
          <Search size={20} />
        </button>
      </div>

      {loading && <div className="text-center text-zinc-500 py-8">Recherche…</div>}
      {!loading && searched && results.length === 0 && (
        <div className="text-center text-zinc-500 py-8">Aucun résultat pour « {query} »</div>
      )}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map(c => (
            <div key={c.idDrink}>
              <CocktailCard
                thumb={c.strDrinkThumb}
                name={c.strDrink}
                sub={tCat(c.strCategory)}
                glass={tGlass(c.strGlass)}
                active={activeId === c.idDrink}
                onToggle={() => setActiveId(activeId === c.idDrink ? null : c.idDrink)}
              />
              {activeId === c.idDrink && active && (
                <DetailPanel
                  thumb={active.strDrinkThumb}
                  name={active.strDrink}
                  category={tCat(active.strCategory)}
                  alcoholic={tAlco(active.strAlcoholic)}
                  glass={tGlass(active.strGlass)}
                  instructions={frInstructions(active)?.text}
                  instructionsInFr={frInstructions(active)?.isFr ?? true}
                  ingredients={parseIngredients(active)}
                  onClose={() => setActiveId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Onglet Mon bar IA ────────────────────────────────────────────────────────

function TabIA() {
  const [input, setInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [cocktails, setCocktails] = useState<AiCocktail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const addTag = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) {
      setTags(prev => [...prev, val])
    }
    setInput('')
  }

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag))

  const generate = async () => {
    if (tags.length === 0) return
    setLoading(true)
    setError('')
    setActiveIdx(null)
    setCocktails([])

    try {
      const r = await fetch('/api/cocktails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: tags }),
      })
      const data = await r.json()
      if (!r.ok) {
        setError(data.error ?? 'Erreur inconnue')
        setLoading(false)
        return
      }

      // Chercher les photos sur TheCocktailDB pour les cocktails connus
      const withThumbs = await Promise.all(
        (data.cocktails as AiCocktail[]).map(async (c) => {
          if (!c.name_en) return { ...c, thumb: null }
          try {
            const res = await fetch(
              `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(c.name_en)}`
            )
            const d = await res.json()
            const match = d.drinks?.[0] as CocktailDB | undefined
            return { ...c, thumb: match?.strDrinkThumb ?? null }
          } catch {
            return { ...c, thumb: null }
          }
        })
      )
      setCocktails(withThumbs)
    } catch {
      setError('Impossible de contacter l\'IA')
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Saisie des ingrédients */}
      <div className="mb-4">
        <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">
          Tes ingrédients
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="Ex: rhum, citron vert…"
            className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-base placeholder-zinc-500 outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <button
            onClick={addTag}
            className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1.5 bg-cyan-900/40 text-cyan-200 rounded-full px-3 py-1 text-sm"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-white">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={generate}
        disabled={tags.length === 0 || loading}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-base font-semibold flex items-center justify-center gap-2 transition-colors mb-4"
      >
        <Sparkles size={18} />
        {loading ? 'L\'IA mixe…' : 'Suggère des cocktails'}
      </button>

      {error && (
        <div className="text-red-400 text-sm text-center mb-4">{error}</div>
      )}

      {cocktails.length > 0 && (
        <div className="space-y-2">
          {cocktails.map((c, i) => (
            <div key={i}>
              <CocktailCard
                thumb={c.thumb ?? null}
                name={c.name}
                sub={c.description}
                glass={c.glass}
                active={activeIdx === i}
                onToggle={() => setActiveIdx(activeIdx === i ? null : i)}
              />
              {activeIdx === i && (
                <DetailPanel
                  thumb={c.thumb ?? null}
                  name={c.name}
                  glass={c.glass}
                  instructions={c.description}
                  ingredients={c.ingredients_used}
                  onClose={() => setActiveIdx(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Widget principal ─────────────────────────────────────────────────────────

export default function BarWidget() {
  const [tab, setTab] = useState<Tab>('suggestions')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'suggestions', label: 'Suggestions', icon: <Wine size={16} /> },
    { id: 'recherche', label: 'Recherche', icon: <Search size={16} /> },
    { id: 'ia', label: 'Mon bar IA', icon: <Sparkles size={16} /> },
  ]

  return (
    <div className="glass-card rounded-3xl p-4 md:p-6 h-full overflow-y-auto">
      <h2 className="text-2xl md:text-4xl font-thin mb-4 md:mb-6">Bar & Cocktails</h2>

      {/* Onglets */}
      <div className="flex gap-2 mb-5 md:mb-6 bg-white/5 rounded-2xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-cyan-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.icon}
            <span className="hidden md:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      {tab === 'suggestions' && <TabSuggestions />}
      {tab === 'recherche' && <TabRecherche />}
      {tab === 'ia' && <TabIA />}
    </div>
  )
}
