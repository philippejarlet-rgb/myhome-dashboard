import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

// Rate limiting : 10 req/min/IP (en mémoire — non partagé entre instances Vercel)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

const SYSTEM_PROMPT = `Tu es un expert en cocktails et mixologie. À partir d'une liste d'ingrédients fournis, propose exactement 3 cocktails réalisables.

Réponds uniquement avec ce JSON (sans texte autour) :
{
  "cocktails": [
    {
      "name": "Nom en français",
      "name_en": "Exact English name for TheCocktailDB (null si inventé)",
      "description": "Description courte en français (1-2 phrases max)",
      "glass": "Type de verre recommandé",
      "ingredients_used": ["ingrédient utilisé 1"],
      "missing": ["ingrédient manquant éventuel, optionnel"]
    }
  ]
}

Règles strictes :
- Propose uniquement des cocktails réalisables avec les ingrédients fournis (eau, glace tolérés)
- name_en doit être le nom exact anglais référencé sur TheCocktailDB pour permettre la recherche photo
- Si le cocktail est une invention absente de TheCocktailDB, mets null pour name_en
- Réponds UNIQUEMENT avec le JSON, aucun texte avant ni après`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée' }, { status: 500 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Trop de requêtes, réessaye dans une minute' },
      { status: 429 }
    )
  }

  let ingredients: string[]
  try {
    const body = await req.json()
    ingredients = body.ingredients
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: 'ingredients manquants' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Ingrédients disponibles : ${ingredients.map(i => i.trim()).join(', ')}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const data = JSON.parse(text)
    return NextResponse.json(data)
  } catch (err) {
    console.error('Erreur API cocktails:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la génération de cocktails' },
      { status: 500 }
    )
  }
}
