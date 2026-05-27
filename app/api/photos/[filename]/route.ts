import { NextRequest, NextResponse } from 'next/server'
import { unlinkSync, readFileSync } from 'fs'
import path from 'path'

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Fichier invalide', { status: 400 })
  }

  const filePath = path.join(PHOTOS_DIR, filename)

  try {
    const buffer = readFileSync(filePath)
    const ext = path.extname(filename).toLowerCase()
    const contentType = MIME[ext] ?? 'application/octet-stream'
    return new NextResponse(buffer, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' },
    })
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse('Fichier introuvable', { status: 404 })
    }
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
  }

  const filePath = path.join(PHOTOS_DIR, filename)

  try {
    unlinkSync(filePath)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur suppression fichier' }, { status: 500 })
  }
}
