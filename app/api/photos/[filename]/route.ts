import { NextRequest, NextResponse } from 'next/server'
import { unlinkSync } from 'fs'
import path from 'path'

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos')

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
