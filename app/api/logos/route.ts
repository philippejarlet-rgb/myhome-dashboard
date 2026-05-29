import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const fileEntry = formData.get('file')
  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: 'Champ "file" manquant' }, { status: 400 })
  }

  if (!ALLOWED_MIME.includes(fileEntry.type)) {
    return NextResponse.json({ error: 'Type non supporté' }, { status: 400 })
  }

  const ext = ('.' + fileEntry.name.split('.').pop()!).toLowerCase()
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: 'Extension non supportée' }, { status: 400 })
  }

  const base = fileEntry.name
    .replace(/\.[^/.]+$/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
  const filename = `logos/${base || 'logo'}${ext}`

  const arrayBuffer = await fileEntry.arrayBuffer()
  const { error } = await supabaseAdmin.storage
    .from('photos')
    .upload(filename, Buffer.from(arrayBuffer), {
      contentType: fileEntry.type,
      upsert: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${filename}`
  return NextResponse.json({ success: true, url })
}
