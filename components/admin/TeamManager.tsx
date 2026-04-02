'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Team, Tournament } from '@/types'
import { Trash2, Plus, RefreshCw } from 'lucide-react'

interface Props {
  teams: Team[]
  tournament: Tournament | null
  onUpdated: (teams: Team[]) => void
}

const emptyTeam = { name: '', pin: '', player1: '', player2: '', handicap: 0 }

export default function TeamManager({ teams, tournament, onUpdated }: Props) {
  const [form, setForm] = useState({ ...emptyTeam })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function generatePin() {
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    setForm((f) => ({ ...f, pin }))
  }

  async function addTeam() {
    if (!tournament) return setMsg('Ingen aktiv turnering')
    if (!form.name || !form.pin) return setMsg('Navn og PIN er påkrevd')
    setSaving(true)
    setMsg('')

    const { data, error } = await supabase.from('teams').insert({
      tournament_id: tournament.id,
      name: form.name,
      pin: form.pin,
      player1: form.player1 || null,
      player2: form.player2 || null,
      handicap: Number(form.handicap),
    }).select().single()

    if (error) {
      setMsg(`Feil: ${error.message}`)
    } else {
      setMsg('Lag lagt til ✓')
      setForm({ ...emptyTeam })
      onUpdated([...teams, data as Team])
    }
    setSaving(false)
  }

  async function deleteTeam(id: string) {
    if (!confirm('Slett dette laget? Alle score slettes også.')) return
    await supabase.from('teams').delete().eq('id', id)
    onUpdated(teams.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Add team form */}
      <div className="bg-gold/5 border border-gold/20 rounded-xl p-5">
        <h3 className="font-serif font-semibold text-navy mb-4 flex items-center gap-2">
          <Plus size={16} className="text-gold" /> Legg til lag
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Lagnavn *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="f.eks. Team Birdie"
              className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">PIN (4 siffer) *</label>
            <div className="flex gap-2">
              <input value={form.pin} onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.slice(0, 4) }))}
                maxLength={4} placeholder="1234"
                className="flex-1 border border-gold/20 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gold" />
              <button onClick={generatePin} className="btn-outline px-3 py-2 text-xs rounded-lg">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Spiller 1</label>
            <input value={form.player1} onChange={(e) => setForm((f) => ({ ...f, player1: e.target.value }))}
              className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Spiller 2</label>
            <input value={form.player2} onChange={(e) => setForm((f) => ({ ...f, player2: e.target.value }))}
              className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Kombinert handicap</label>
            <input type="number" value={form.handicap} onChange={(e) => setForm((f) => ({ ...f, handicap: Number(e.target.value) }))}
              min={0}
              className="w-full border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>
        </div>
        {msg && (
          <p className={`text-sm mt-2 ${msg.startsWith('Feil') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>
        )}
        <button onClick={addTeam} disabled={saving} className="btn-gold mt-4 py-2 px-5 rounded-xl text-sm disabled:opacity-40">
          {saving ? 'Lagrer...' : 'Legg til lag'}
        </button>
      </div>

      {/* Team list */}
      <div>
        <h3 className="font-serif font-semibold text-navy mb-3">Lag ({teams.length})</h3>
        {teams.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">Ingen lag ennå</p>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="bg-white border border-gold/15 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-navy">{team.name}</p>
                  <p className="text-xs text-gray-400">
                    {[team.player1, team.player2].filter(Boolean).join(' & ')}
                    {team.handicap > 0 && ` · HCP ${team.handicap}`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-gray-400">PIN</p>
                  <p className="font-mono font-bold text-gold text-lg">{team.pin}</p>
                </div>
                <button onClick={() => deleteTeam(team.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
