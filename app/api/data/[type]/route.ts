import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'

const VALID_TYPES = ['todos', 'courses', 'radios', 'weather']
const DATA_DIR = path.join(process.cwd(), 'data')

const DEFAULTS: Record<string, unknown> = {
  todos: [],
  courses: { items: [], history: [] },
  radios: [],
  weather: [],
}

function getFilePath(type: string) {
  return path.join(DATA_DIR, `${type}.json`)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const filePath = getFilePath(type)

  if (!existsSync(filePath)) {
    return NextResponse.json(DEFAULTS[type])
  }

  const content = readFileSync(filePath, 'utf-8')
  return NextResponse.json(JSON.parse(content))
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const data = await request.json()

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  writeFileSync(getFilePath(type), JSON.stringify(data, null, 2), 'utf-8')

  return NextResponse.json({ success: true })
}
