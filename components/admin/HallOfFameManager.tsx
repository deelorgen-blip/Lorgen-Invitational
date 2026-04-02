'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { HallOfFameEntry } from '@/types'
import { Trash2, Plus } from 'lucide-react'

interface Props {
  entries: HallOfFameEntry[]
  onUpdated: (e: HallOfFameEntry[]) => void
}

export default function HallOfFameManager({ entries, onUpdated }: Props) {
  const [form, setForm] = useState({ year: new Date().getFullYear(), team_name: '', player1: '', player2: '', format: '', score: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function add() {
    if (!form.team_name) return setMsg('Lagnavn er påkrevd')
    setSaving(true)
    const { data, error } = await supabase.from('hall_of_fame').insert({
      year: form.year,
      team_name: form.team_name,
      player1: form.player1 || null,
      player2: form.player2 || null,
      format: form.format || null,
      score: form.score || null,
      notes: form.notes || null,
    }).select().single()
    if (error) setMsg(`Feil: ${error.message}`)
    else { onUpdated([data as HallOfFameEntry, ...entries]); setForm({ year: new Date().getFullYear(), team_name: '', player1: '', player2: '', format: '', score: '', notes: '' }); setMsg('Mester lagt til ✓') }
    setSaving(false)
  }

  async function del(id: string) {
    await supabase.from('hall_of_fame').delete().eq('id', id)
    onUpdated(entries.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gold/5 border border-gold/20 rounded-xl p-5">
        <h3 className="font-serif font-semibold text-navy mb-4 flex items-center gap-2">
          <Plus size={16} className="text-gold" /> Legg til mester
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: 'year', label: 'År', type: 'number' },
            { key: 'team_name', label: 'Lagnavn *', type: 'text' },
            { key: 'player1', label: 'Spiller 1', type: 'text' },
            { key: 'player2', label: 'Spiller 2', type: 'text' },
            { key: 'format', label: 'Format', type: 'text' },
            { key: 'score', label: 'Score', type: 'text' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">{f.label}</label>
              <input type={f.type}
                value={(form as Record<string, string | number>)[f.key]}
                onChange={(e) => setForm((x) => ({ ...x, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Notater</label>
            <input value={form.notes} onChange={(e) => setForm((x) => ({ ...x, notes: e.target.value }))}
              className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
        </div>
        {msg && <p className={`text-sm mt-2 ${msg.startsWith('Feil') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
        <button onClick={add} disabled={saving} className="btn-gold mt-4 py-2 px-5 rounded-xl text-sm disabled:opacity-40">
          {saving ? 'Lagrer...' : 'Legg til'}
        </button>
      </div>

      <div className="space-y-3">
        {entries.sort((a, b) => b.year - a.year).map((e) => (
          <div key={e.id} className="bg-white border border-gold/15 rounded-xl px-5 py-4 flex items-center gap-4">
            <p className="font-serif text-2xl font-bold text-gold min-w-[56px]">{e.year}</p>
            <div className="flex-1">
              <p className="font-semibold text-navy">{e.team_name}</p>
              <p className="text-xs text-gray-400">{[e.player1, e.player2].filter(Boolean).join(' & ')}</p>
              {e.score && <p className="text-xs text-gold">{e.score}</p>}
            </div>
            <button onClick={() => del(e.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
