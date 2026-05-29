import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export async function GET() {
  const { data, error } = await supabaseAdmin.storage.from('photos').list()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const files = (data ?? [])
    .map((f) => f.name)
    .filter((name) => IMAGE_EXTENSIONS.includes(
      ('.' + name.split('.').pop()!).toLowerCase()
    ))
  return NextResponse.json(files)
}

export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const fileEntry = formData.get('file')
  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: 'Champ "file" manquant ou invalide' }, { status: 400 })
  }

  if (!ALLOWED_MIME.includes(fileEntry.type)) {
    return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
  }

  if (fileEntry.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })
  }

  const ext = ('.' + fileEntry.name.split('.').pop()!).toLowerCase()
  const base = fileEntry.name
    .replace(/\.[^/.]+$/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
  const filename = (base || 'photo') + ext

  const arrayBuffer = await fileEntry.arrayBuffer()
  const { error } = await supabaseAdmin.storage
    .from('photos')
    .upload(filename, Buffer.from(arrayBuffer), {
      contentType: fileEntry.type,
      upsert: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, filename })
}
