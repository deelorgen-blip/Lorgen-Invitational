'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Feil passord')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full border border-gold/30 bg-white/60 flex items-center justify-center mb-4 shadow">
            <Image src="/logo.png" alt="Lorgen" width={44} height={44} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy">Administrasjonspanel</h1>
          <p className="text-gray-500 text-sm mt-1">Logg inn for å styre turneringen</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gold/20 p-8 shadow-sm">
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Passord
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Skriv inn passord"
            className="w-full border border-gold/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold mb-4 text-navy"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            className="w-full btn-gold justify-center py-3 rounded-xl disabled:opacity-40"
          >
            {loading ? 'Logger inn...' : '🔐 Logg inn'}
          </button>
        </form>
      </div>
    </div>
  )
}
