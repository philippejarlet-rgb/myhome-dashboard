import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const BUCKET = 'backgrounds'
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function isAdminAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get('myhome_admin')?.value
  return !!cookie && cookie === process.env.ADMIN_SESSION_TOKEN
}

function getPublicUrl(filename: string): string {
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filename)
  return data.publicUrl
}

// GET : liste des images + sélection courante
export async function GET() {
  const [listResult, settingsResult] = await Promise.all([
    supabaseAdmin.storage.from(BUCKET).list('', { limit: 100 }),
    supabaseAdmin.from('settings').select('value').eq('key', 'backgrounds').single(),
  ])

  const images = (listResult.data ?? [])
    .filter((f) => IMAGE_EXTENSIONS.includes(('.' + f.name.split('.').pop()!).toLowerCase()))
    .map((f) => ({ name: f.name, url: getPublicUrl(f.name) }))

  let selection: Record<string, string | null> = {}
  if (settingsResult.data?.value) {
    try { selection = JSON.parse(settingsResult.data.value) } catch {}
  }

  return NextResponse.json({ images, selection })
}

// POST : upload d'une image
export async function POST(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  let formData: FormData
  try { formData = await request.formData() }
  catch { return NextResponse.json({ error: 'Corps invalide' }, { status: 400 }) }

  const fileEntry = formData.get('file')
  if (!(fileEntry instanceof File)) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  if (!ALLOWED_MIME.includes(fileEntry.type)) return NextResponse.json({ error: 'Type non supporté' }, { status: 400 })
  if (fileEntry.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Max 10 Mo' }, { status: 400 })

  const ext = ('.' + fileEntry.name.split('.').pop()!).toLowerCase()
  const base = fileEntry.name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '')
  const filename = `${base || 'bg'}${ext}`

  const arrayBuffer = await fileEntry.arrayBuffer()
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filename, Buffer.from(arrayBuffer), { contentType: fileEntry.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, url: getPublicUrl(filename), name: filename })
}

// PUT : sauvegarder la sélection par page
export async function PUT(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  let body: unknown
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 }) }

  const { error } = await supabaseAdmin
    .from('settings')
    .upsert({ key: 'backgrounds', value: JSON.stringify(body) })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE : supprimer une image du bucket
export async function DELETE(request: NextRequest) {
  if (!isAdminAuth(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { name } = await request.json()
  if (!name) return NextResponse.json({ error: 'Nom manquant' }, { status: 400 })

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([name])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
