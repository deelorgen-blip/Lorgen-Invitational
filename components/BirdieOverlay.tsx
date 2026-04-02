'use client'

import { useEffect, useState } from 'react'

interface Props {
  show: boolean
  teamName?: string
  onDone: () => void
}

export default function BirdieOverlay({ show, teamName, onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'out' | 'hidden'>('hidden')

  useEffect(() => {
    if (show) {
      setPhase('in')
      const t1 = setTimeout(() => setPhase('out'), 2800)
      const t2 = setTimeout(() => { setPhase('hidden'); onDone() }, 3200)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [show, onDone])

  if (phase === 'hidden') return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`text-center ${phase === 'in' ? 'birdie-overlay-in' : 'birdie-overlay-out'}`}
      >
        <div className="text-7xl mb-4 animate-bounce">🐦</div>
        <h2 className="font-serif text-5xl font-bold text-white mb-2">BIRDIE!</h2>
        {teamName && (
          <p className="text-gold text-xl font-semibold mb-4">{teamName}</p>
        )}
        <div className="bg-gold text-navy font-bold text-xl px-8 py-3 rounded-full shadow-xl">
          Ta et birdie-shot! 🥃
        </div>
      </div>
    </div>
  )
}
