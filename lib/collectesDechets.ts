// Calendrier de collecte SIVOM du Louhannais - Louhans-Chateaurenaud, 2e semestre 2026.
// Les jours feries reportes au samedi sont deja integres aux dates (14/07 -> 18/07, 11/11 -> 14/11).

export type Bac = 'jaune' | 'gris'
export type Zone = 1 | 2

export const ZONE: Zone = 2

const GRIS: string[] = [
  '2026-07-01', '2026-07-08', '2026-07-15', '2026-07-22', '2026-07-29',
  '2026-08-05', '2026-08-12', '2026-08-19', '2026-08-26',
  '2026-09-02', '2026-09-09', '2026-09-16', '2026-09-23', '2026-09-30',
  '2026-10-07', '2026-10-14', '2026-10-21', '2026-10-28',
  '2026-11-04', '2026-11-14', '2026-11-18', '2026-11-25',
  '2026-12-02', '2026-12-09', '2026-12-16', '2026-12-23', '2026-12-30',
]

const JAUNE: Record<Zone, string[]> = {
  1: [
    '2026-07-18', '2026-07-28',
    '2026-08-11', '2026-08-25',
    '2026-09-08', '2026-09-22',
    '2026-10-06', '2026-10-20',
    '2026-11-03', '2026-11-17',
    '2026-12-01', '2026-12-15', '2026-12-29',
  ],
  2: [
    '2026-07-07', '2026-07-21',
    '2026-08-04', '2026-08-18',
    '2026-09-01', '2026-09-15', '2026-09-29',
    '2026-10-13', '2026-10-27',
    '2026-11-10', '2026-11-24',
    '2026-12-08', '2026-12-22',
  ],
}

export type ProchaineCollecte = {
  iso: string
  date: Date
  joursRestants: number
}

function toIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getProchaineCollecte(bac: Bac, now: Date = new Date()): ProchaineCollecte | null {
  const dates = bac === 'gris' ? GRIS : JAUNE[ZONE]
  const today = toIso(now)
  const iso = dates.find(d => d >= today)
  if (!iso) return null
  const date = parseIso(iso)
  const joursRestants = Math.round((date.getTime() - parseIso(today).getTime()) / 86400000)
  return { iso, date, joursRestants }
}
