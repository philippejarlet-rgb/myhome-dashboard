import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, mkdirSync, existsSync, writeFileSync } from 'fs'
import path from 'path'

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos')
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function GET() {
  if (!existsSync(PHOTOS_DIR)) {
    return NextResponse.json([])
  }
  try {
    const files = readdirSync(PHOTOS_DIR).filter((f) =>
      IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())
    )
    return NextResponse.json(files)
  } catch {
    return NextResponse.json({ error: 'Erreur lecture répertoire' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'Champ "file" manquant' }, { status: 400 })
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
  }

  const filename = path.basename(file.name)
  if (!filename || filename.includes('..')) {
    return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
  }

  try {
    mkdirSync(PHOTOS_DIR, { recursive: true })
    const arrayBuffer = await file.arrayBuffer()
    writeFileSync(path.join(PHOTOS_DIR, filename), Buffer.from(arrayBuffer))
    return NextResponse.json({ success: true, filename })
  } catch {
    return NextResponse.json({ error: 'Erreur sauvegarde fichier' }, { status: 500 })
  }
}
