import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const userId = request.headers.get('x-user-id')
  if (!userId) return new NextResponse('Non authentifié', { status: 401 })

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Fichier invalide', { status: 400 })
  }

  const path = `${userId}/${filename}`
  const { data, error } = await supabaseAdmin.storage.from('photos').download(path)
  if (error) return new NextResponse('Fichier introuvable', { status: 404 })

  const ext = ('.' + filename.split('.').pop()!).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'
  const buffer = await data.arrayBuffer()
  return new NextResponse(buffer, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.storage.from('photos').remove([`${userId}/${filename}`])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
