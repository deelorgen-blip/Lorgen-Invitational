'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { HoleConfig, Tournament } from '@/types'
import { Save } from 'lucide-react'

interface Props {
  tournament: Tournament | null
  initialConfigs: HoleConfig[]
}

type RowConfig = {
  hole: number
  par: number
  stroke_index: number | null
  requires_photo: boolean
  is_longest_drive: boolean
  is_nearest_flag: boolean
}

function defaultRows(): RowConfig[] {
  return Array.from({ length: 18 }, (_, i) => ({
    hole: i + 1,
    par: 4,
    stroke_index: i + 1,
    requires_photo: false,
    is_longest_drive: false,
    is_nearest_flag: false,
  }))
}

export default function CourseManager({ tournament, initialConfigs }: Props) {
  const [rows, setRows] = useState<RowConfig[]>(() => {
    if (initialConfigs.length === 0) return defaultRows()
    const map: Record<number, HoleConfig> = {}
    initialConfigs.forEach((c) => { map[c.hole] = c })
    return Array.from({ length: 18 }, (_, i) => {
      const c = map[i + 1]
      if (c) return {
        hole: c.hole,
        par: c.par,
        stroke_index: c.stroke_index,
        requires_photo: c.requires_photo,
        is_longest_drive: c.is_longest_drive,
        is_nearest_flag: c.is_nearest_flag,
      }
      return { hole: i + 1, par: 4, stroke_index: i + 1, requires_photo: false, is_longest_drive: false, is_nearest_flag: false }
    })
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function setRow(hole: number, field: keyof RowConfig, value: unknown) {
    setRows((prev) => prev.map((r) => r.hole === hole ? { ...r, [field]: value } : r))
  }

  const siValues = rows.map((r) => r.stroke_index).filter((v) => v !== null)
  const siDuplicates = siValues.length !== new Set(siValues).size

  async function saveCourse() {
    if (!tournament) {
      setMsg('Ingen aktiv turnering')
      return
    }
    if (siDuplicates) {
      setMsg('Slagindeks-verdier må være unike (1–18)')
      return
    }
    setSaving(true)
    setMsg('')
    const payload = rows.map((r) => ({
      tournament_id: tournament.id,
      hole: r.hole,
      par: r.par,
      stroke_index: r.stroke_index,
      requires_photo: r.requires_photo,
      is_longest_drive: r.is_longest_drive,
      is_nearest_flag: r.is_nearest_flag,
    }))
    const { error } = await supabase
      .from('hole_configs')
      .upsert(payload, { onConflict: 'tournament_id,hole' })

    if (error) {
      setMsg(`Feil: ${error.message}`)
    } else {
      setMsg('Baneoppsett lagret ✓')
    }
    setSaving(false)
  }

  if (!tournament) {
    return (
      <div className="text-center py-10 text-gray-400">
        Opprett en turnering først for å konfigurere banen.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Sett par og slagindeks (SI) per hull. <strong>Lavest SI = vanskeligst hull.</strong>{' '}
        Lag med høy nok handicap-justering får −1 slag på hull der SI ≤ lagets allowance.
      </p>

      {siDuplicates && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">
          ⚠️ Duplikate slagindeks-verdier. SI-verdier må være unike (1–18).
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gold/15 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy text-white">
              <th className="px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wider">Hull</th>
              <th className="px-3 py-2.5 text-center font-semibold text-xs uppercase tracking-wider">Par</th>
              <th className="px-3 py-2.5 text-center font-semibold text-xs uppercase tracking-wider">SI</th>
              <th className="px-3 py-2.5 text-center font-semibold text-xs uppercase tracking-wider">📸</th>
              <th className="px-3 py-2.5 text-center font-semibold text-xs uppercase tracking-wider">🏌️ LD</th>
              <th className="px-3 py-2.5 text-center font-semibold text-xs uppercase tracking-wider">🎯 NF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {rows.map((row) => (
              <tr key={row.hole} className="bg-white hover:bg-gold/5 transition-colors">
                <td className="px-3 py-2 font-bold text-navy whitespace-nowrap">Hull {row.hole}</td>
                <td className="px-3 py-2">
                  <select
                    value={row.par}
                    onChange={(e) => setRow(row.hole, 'par', Number(e.target.value))}
                    className="w-full border border-gold/20 rounded px-2 py-1 text-sm focus:outline-none focus:border-gold bg-white"
                  >
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={row.stroke_index ?? ''}
                    onChange={(e) => setRow(row.hole, 'stroke_index', e.target.value ? Number(e.target.value) : null)}
                    className={`w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none bg-white ${
                      siDuplicates ? 'border-red-300 focus:border-red-400' : 'border-gold/20 focus:border-gold'
                    }`}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.requires_photo}
                    onChange={(e) => setRow(row.hole, 'requires_photo', e.target.checked)}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.is_longest_drive}
                    onChange={(e) => setRow(row.hole, 'is_longest_drive', e.target.checked)}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.is_nearest_flag}
                    onChange={(e) => setRow(row.hole, 'is_nearest_flag', e.target.checked)}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gold/10 border-t-2 border-gold/20">
              <td className="px-3 py-2 font-bold text-navy text-xs uppercase tracking-wider">Total</td>
              <td className="px-3 py-2 text-center font-bold text-navy">
                {rows.reduce((sum, r) => sum + r.par, 0)}
              </td>
              <td colSpan={4} />
            </tr>
          </tfoot>
        </table>
      </div>

      {msg && (
        <p className={`text-sm font-medium ${msg.startsWith('Feil') || msg.startsWith('⚠️') ? 'text-red-500' : 'text-green-600'}`}>
          {msg}
        </p>
      )}

      <button
        onClick={saveCourse}
        disabled={saving || siDuplicates}
        className="btn-gold py-2.5 px-6 rounded-xl flex items-center gap-2 disabled:opacity-40"
      >
        <Save size={16} />
        {saving ? 'Lagrer...' : 'Lagre baneoppsett'}
      </button>
    </div>
  )
}
