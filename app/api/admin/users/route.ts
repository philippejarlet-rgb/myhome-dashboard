import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hashPassword } from '@/lib/hashPassword'

export const dynamic = 'force-dynamic'

function isAdminAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get('myhome_admin')?.value
  return !!cookie && cookie === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, is_admin, created_at')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { email, name, password } = await request.json()
  if (!email || !name || !password) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const password_hash = await hashPassword(password)
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ email, name, password_hash })
    .select('id, email, name, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
