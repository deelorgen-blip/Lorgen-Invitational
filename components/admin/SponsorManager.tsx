'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Sponsor } from '@/types'
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react'

interface Props {
  sponsors: Sponsor[]
  onUpdated: (s: Sponsor[]) => void
}

export default function SponsorManager({ sponsors, onUpdated }: Props) {
  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function addSponsor() {
    if (!form.name) return setMsg('Navn er påkrevd')
    setSaving(true)
    const { data, error } = await supabase.from('sponsors').insert({
      name: form.name,
      logo_url: form.logo_url || null,
      website_url: form.website_url || null,
      visible: true,
      sort_order: sponsors.length,
    }).select().single()
    if (error) { setMsg(`Feil: ${error.message}`) }
    else { onUpdated([...sponsors, data as Sponsor]); setForm({ name: '', logo_url: '', website_url: '' }); setMsg('Sponsor lagt til ✓') }
    setSaving(false)
  }

  async function toggleVisible(s: Sponsor) {
    await supabase.from('sponsors').update({ visible: !s.visible }).eq('id', s.id)
    onUpdated(sponsors.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)))
  }

  async function deleteSponsor(id: string) {
    await supabase.from('sponsors').delete().eq('id', id)
    onUpdated(sponsors.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gold/5 border border-gold/20 rounded-xl p-5">
        <h3 className="font-serif font-semibold text-navy mb-4 flex items-center gap-2">
          <Plus size={16} className="text-gold" /> Legg til sponsor
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Navn *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Logo URL</label>
            <input value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Nettside URL</label>
            <input value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
              placeholder="https://..."
              className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
        </div>
        {msg && <p className={`text-sm mt-2 ${msg.startsWith('Feil') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
        <button onClick={addSponsor} disabled={saving} className="btn-gold mt-4 py-2 px-5 rounded-xl text-sm disabled:opacity-40">
          {saving ? 'Lagrer...' : 'Legg til sponsor'}
        </button>
      </div>

      <div className="space-y-2">
        {sponsors.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Ingen sponsorer ennå</p>
        ) : sponsors.map((s) => (
          <div key={s.id} className={`bg-white border rounded-xl px-5 py-4 flex items-center gap-4 ${s.visible ? 'border-gold/15' : 'border-gray-200 opacity-60'}`}>
            <div className="flex-1">
              <p className="font-semibold text-navy">{s.name}</p>
              {s.website_url && <p className="text-xs text-gray-400">{s.website_url}</p>}
            </div>
            <button onClick={() => toggleVisible(s)} className="p-2 text-gray-400 hover:text-gold rounded-lg transition-colors">
              {s.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button onClick={() => deleteSponsor(s.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
