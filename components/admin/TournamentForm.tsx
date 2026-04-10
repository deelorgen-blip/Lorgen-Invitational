'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tournament } from '@/types'
import { Upload } from 'lucide-react'

interface Props {
  tournament: Tournament | null
  onSaved: (t: Tournament) => void
}

export default function TournamentForm({ tournament, onSaved }: Props) {
  const [form, setForm] = useState({
    name: tournament?.name ?? 'Lorgen Invitational',
    date: tournament?.date ? new Date(tournament.date).toISOString().slice(0, 16) : '',
    course: tournament?.course ?? '',
    format: tournament?.format ?? '2-Mann Scramble',
    holes: tournament?.holes ?? 18,
    status: tournament?.status ?? 'upcoming',
    handicap_pct: tournament?.handicap_pct ?? 25,
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploadingCoin, setUploadingCoin] = useState(false)
  const [coinBackUrl, setCoinBackUrl] = useState(tournament?.coin_back_image_url ?? '')

  function set(key: string, val: string | number) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function uploadCoinBack(file: File) {
    setUploadingCoin(true)
    const path = `coin-back/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('tournament-photos')
      .upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('tournament-photos').getPublicUrl(data.path)
      setCoinBackUrl(publicUrl)
    }
    setUploadingCoin(false)
  }

  async function handleSave() {
    setSaving(true)
    setMsg('')

    const payload = {
      name: form.name,
      date: form.date ? new Date(form.date).toISOString() : null,
      course: form.course || null,
      format: form.format,
      holes: Number(form.holes),
      status: form.status as Tournament['status'],
      handicap_pct: Number(form.handicap_pct),
      coin_back_image_url: coinBackUrl || null,
    }

    const { data, error } = tournament
      ? await supabase.from('tournaments').update(payload).eq('id', tournament.id).select().single()
      : await supabase.from('tournaments').insert(payload).select().single()

    if (error) {
      setMsg(`Feil: ${error.message}`)
    } else {
      setMsg('Turnering lagret ✓')
      onSaved(data as Tournament)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Navn</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)}
            className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Dato & tid</label>
          <input type="datetime-local" value={form.date} onChange={(e) => set('date', e.target.value)}
            className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Bane</label>
          <input value={form.course} onChange={(e) => set('course', e.target.value)}
            className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Format</label>
          <select value={form.format} onChange={(e) => set('format', e.target.value)}
            className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white">
            <option>2-Mann Scramble</option>
            <option>Stableford</option>
            <option>Slagspill</option>
            <option>4-Ball</option>
            <option>Foursomes</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Antall hull</label>
          <input type="number" value={form.holes} onChange={(e) => set('holes', e.target.value)}
            min={9} max={18}
            className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Handicap %</label>
          <input type="number" value={form.handicap_pct} onChange={(e) => set('handicap_pct', e.target.value)}
            min={0} max={100}
            className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)}
            className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white">
            <option value="upcoming">Kommende</option>
            <option value="active">Aktiv (pågår nå)</option>
            <option value="completed">Avsluttet</option>
          </select>
        </div>
      </div>

      {/* Coin back image */}
      <div className="border border-gold/20 rounded-xl p-4 bg-gold/5">
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
          🪙 Bilde på baksiden av spinnende mynt
        </label>
        {coinBackUrl && (
          <div className="mb-3 relative w-20 h-20 rounded-full overflow-hidden border-2 border-gold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coinBackUrl} alt="Coin back" className="w-full h-full object-cover" />
          </div>
        )}
        <label className="cursor-pointer inline-flex items-center gap-2 btn-outline text-xs px-4 py-2 rounded-lg">
          <Upload size={14} />
          {uploadingCoin ? 'Laster opp...' : 'Last opp bilde'}
          <input type="file" accept="image/*" className="hidden" disabled={uploadingCoin}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCoinBack(f) }} />
        </label>
        {coinBackUrl && (
          <button onClick={() => setCoinBackUrl('')} className="ml-2 text-xs text-red-400 hover:text-red-600">
            Fjern
          </button>
        )}
      </div>

      {msg && (
        <p className={`text-sm font-medium ${msg.startsWith('Feil') ? 'text-red-500' : 'text-green-600'}`}>
          {msg}
        </p>
      )}

      <button onClick={handleSave} disabled={saving}
        className="btn-gold py-2.5 px-6 rounded-xl disabled:opacity-40">
        {saving ? 'Lagrer...' : 'Lagre turnering'}
      </button>
    </div>
  )
}
