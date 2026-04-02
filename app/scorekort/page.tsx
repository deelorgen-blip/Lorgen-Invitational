'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ScorekortLoginPage() {
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  function handleChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[idx] = val
    setPin(next)
    if (val && idx < 3) inputs.current[idx + 1]?.focus()
    if (next.every((d) => d !== '') && !val === false) {
      handleSubmit(next.join(''))
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  async function handleSubmit(pinVal?: string) {
    const code = pinVal ?? pin.join('')
    if (code.length !== 4) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/scorekort/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Feil PIN')
        setPin(['', '', '', ''])
        inputs.current[0]?.focus()
      } else {
        router.push(`/scorekort/${data.teamId}`)
      }
    } catch {
      setError('Noe gikk galt — prøv igjen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-gradient flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full border border-gold/30 bg-white/60 flex items-center justify-center mb-4 shadow">
            <Image src="/logo.svg" alt="Lorgen" width={56} height={56} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy">Scorekort</h1>
          <p className="text-gray-500 text-sm mt-1">Tast inn lagets 4-sifrede PIN</p>
        </div>

        {/* PIN inputs */}
        <div className="bg-white rounded-2xl border border-gold/20 p-8 shadow-sm">
          <div className="flex gap-3 justify-center mb-6">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputs.current[idx] = el }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:border-gold transition-colors text-navy bg-cream"
                style={{ borderColor: digit ? '#C9A84C' : '#E5E7EB' }}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <button
            onClick={() => handleSubmit()}
            disabled={pin.some((d) => d === '') || loading}
            className="w-full btn-gold justify-center py-3 rounded-xl disabled:opacity-40"
          >
            {loading ? 'Logger inn...' : '🏌️ Logg inn'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          PIN-koden finner du på lagkortet ditt
        </p>
      </div>
    </div>
  )
}
