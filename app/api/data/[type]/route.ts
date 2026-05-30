import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const VALID_TYPES = ['todos', 'courses', 'radios', 'weather', 'news_sources']

const DEFAULTS: Record<string, unknown> = {
  todos: [],
  courses: { items: [], history: [] },
  radios: [],
  weather: [],
  news_sources: [],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json(DEFAULTS[type])

  const { data, error } = await supabaseAdmin
    .from('app_data')
    .select('data')
    .eq('type', type)
    .eq('user_id', userId)
    .single()

  if (error || !data) return NextResponse.json(DEFAULTS[type])
  return NextResponse.json(data.data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('app_data')
    .upsert({ type, user_id: userId, data: body })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
