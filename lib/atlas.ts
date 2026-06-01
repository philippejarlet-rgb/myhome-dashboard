const ATLAS = 'https://atlasculinaire.com/api/v1'

async function atlasFetch(path: string, revalidate = 3600) {
  const res = await fetch(`${ATLAS}${path}`, {
    headers: { 'x-api-key': process.env.ATLAS_API_KEY! },
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`Atlas API ${res.status}`)
  return res.json()
}

export const searchRecipes = (q = '', country = '', limit = 24, offset = 0) => {
  const p = new URLSearchParams()
  if (q) p.set('q', q)
  if (country) p.set('country', country)
  p.set('limit', String(limit))
  p.set('offset', String(offset))
  return atlasFetch(`/recipes?${p}`, 300)
}

export const getRecipe = (id: string) => atlasFetch(`/recipes/${id}`)

export const listCountries = () => atlasFetch('/countries')

export async function getRandomRecipe() {
  const head = await atlasFetch('/recipes?limit=1', 0)
  const offset = Math.floor(Math.random() * (head.total || 1))
  const page = await atlasFetch(`/recipes?limit=1&offset=${offset}`, 0)
  return page.recipes?.[0] ?? null
}
