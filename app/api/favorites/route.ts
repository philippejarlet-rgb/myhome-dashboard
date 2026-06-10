import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('cocktail_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: { source: string; external_id: string | null; name: string; data: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const { source, external_id, name, data } = body
  if (!source || !name || !data) {
    return NextResponse.json({ error: 'Champs manquants : source, name, data' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('cocktail_favorites')
    .insert({ user_id: userId, source, external_id: external_id ?? null, name, data })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ success: true, already: true })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: { source: string; external_id?: string | null; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const { source, external_id, name } = body

  let query = supabaseAdmin
    .from('cocktail_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('source', source)

  if (source === 'db' && external_id) {
    query = query.eq('external_id', external_id)
  } else if (source === 'ai' && name) {
    query = query.eq('name', name)
  } else {
    return NextResponse.json({ error: 'external_id requis pour db, name requis pour ai' }, { status: 400 })
  }

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
