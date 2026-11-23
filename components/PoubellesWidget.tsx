'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { getProchaineCollecte, type Bac, type ProchaineCollecte } from '@/lib/collectesDechets'

type Prochaines = { jaune: ProchaineCollecte | null; gris: ProchaineCollecte | null }

const BACS: { bac: Bac; label: string; icon: string; accent: string }[] = [
  { bac: 'jaune', label: 'Bac jaune', icon: 'text-yellow-400', accent: 'text-yellow-400' },
  { bac: 'gris', label: 'Bac gris', icon: 'text-zinc-400', accent: 'text-zinc-100' },
]

function libelle(c: ProchaineCollecte): { principal: string; secondaire: string; proche: boolean } {
  const court = c.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  if (c.joursRestants === 0) return { principal: "Aujourd'hui", secondaire: court, proche: true }
  if (c.joursRestants === 1) return { principal: 'Demain', secondaire: court, proche: true }
  return { principal: court, secondaire: `dans ${c.joursRestants} jours`, proche: false }
}

export default function PoubellesWidget() {
  const [prochaines, setProchaines] = useState<Prochaines | null>(null)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setProchaines({ jaune: getProchaineCollecte('jaune', now), gris: getProchaineCollecte('gris', now) })
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [])

  const termine = prochaines !== null && prochaines.jaune === null && prochaines.gris === null

  return (
    <div className="glass-card rounded-3xl p-4 h-full flex flex-col overflow-hidden">
      <h2 className="text-base mb-2 shrink-0">Poubelles</h2>

      {prochaines === null ? (
        <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">Chargement…</div>
      ) : termine ? (
        <div className="flex-1 flex items-center justify-center text-zinc-400 text-base text-center">
          Calendrier 2027 à venir
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col justify-around">
          {BACS.map(({ bac, label, icon, accent }) => {
            const c = prochaines[bac]
            const l = c ? libelle(c) : null
            return (
              <div key={bac} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Trash2 size={22} className={`shrink-0 ${icon}`} />
                  <span className="text-lg font-semibold truncate">{label}</span>
                </div>
                {l ? (
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-semibold leading-tight ${l.proche ? accent : 'text-white'}`}>
                      {l.principal}
                    </div>
                    <div className="text-xs text-zinc-400 leading-tight">{l.secondaire}</div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">2027 à venir</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
