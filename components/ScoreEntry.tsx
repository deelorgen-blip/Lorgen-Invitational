'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Team, Score, Tournament, SpecialAward } from '@/types'
import { scoreLabel } from '@/lib/scoring'
import { CheckCircle, ChevronLeft, ChevronRight, Upload } from 'lucide-react'

interface Props {
  team: Team
  tournament: Tournament
  initialScores: Score[]
}

const SCORE_COLORS: Record<string, string> = {
  eagle: 'bg-blue-600 text-white',
  birdie: 'bg-red-500 text-white',
  par: 'bg-gray-100 text-gray-700',
  bogey: 'bg-yellow-400 text-gray-900',
  double: 'bg-gray-300 text-gray-700',
}

export default function ScoreEntry({ team, tournament, initialScores }: Props) {
  const holePars: number[] = tournament.hole_pars ?? Array(18).fill(4)
  const [scores, setScores] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {}
    initialScores.forEach((s) => { if (s.strokes) map[s.hole] = s.strokes })
    return map
  })
  const [currentHole, setCurrentHole] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [awardType, setAwardType] = useState<'longest_drive' | 'closest_to_pin' | null>(null)
  const [awardValue, setAwardValue] = useState('')
  const [uploading, setUploading] = useState(false)

  const par = holePars[currentHole - 1]
  const currentStrokes = scores[currentHole]

  async function saveScore(hole: number, strokes: number) {
    setSaving(true)
    setSaved(false)
    await supabase.from('scores').upsert(
      { team_id: team.id, hole, strokes },
      { onConflict: 'team_id,hole' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function selectStrokes(s: number) {
    setScores((prev) => ({ ...prev, [currentHole]: s }))
    saveScore(currentHole, s)
  }

  async function submitSpecialAward() {
    if (!awardType || !awardValue.trim()) return
    await supabase.from('special_awards').upsert({
      tournament_id: tournament.id,
      type: awardType,
      hole: currentHole,
      team_id: team.id,
      value: awardValue.trim(),
    }, { onConflict: 'tournament_id,type' })
    setAwardValue('')
    setAwardType(null)
  }

  async function uploadPhoto(file: File) {
    setUploading(true)
    const path = `${tournament.id}/${team.id}/hole-${currentHole}-${Date.now()}`
    const { data, error } = await supabase.storage
      .from('tournament-photos')
      .upload(path, file, { upsert: true })

    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage
        .from('tournament-photos')
        .getPublicUrl(data.path)

      await supabase.from('photos').insert({
        tournament_id: tournament.id,
        team_id: team.id,
        storage_path: publicUrl,
        hole: currentHole,
      })
    }
    setUploading(false)
  }

  const completedHoles = Object.keys(scores).length

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      {/* Team header */}
      <div className="bg-navy rounded-2xl p-5 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-1">Lag</p>
        <h2 className="font-serif text-2xl font-bold text-white">{team.name}</h2>
        {(team.player1 || team.player2) && (
          <p className="text-gray-400 text-sm mt-1">
            {[team.player1, team.player2].filter(Boolean).join(' & ')}
          </p>
        )}
        <div className="mt-3 flex justify-center gap-1">
          {Array.from({ length: 18 }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentHole(i + 1)}
              className={`w-5 h-5 rounded-full text-xs font-bold transition-all ${
                i + 1 === currentHole
                  ? 'bg-gold text-navy scale-125'
                  : scores[i + 1]
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white/60'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-2">{completedHoles}/18 hull fullført</p>
      </div>

      {/* Current hole */}
      <div className="bg-white rounded-2xl border border-gold/20 p-6 shadow-sm">
        {/* Hole navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
            disabled={currentHole === 1}
            className="p-2 rounded-full border border-gold/20 hover:bg-gold/10 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={18} className="text-gold" />
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">Hull</p>
            <p className="font-serif text-4xl font-bold text-navy">{currentHole}</p>
            <p className="text-gold text-sm font-medium">Par {par}</p>
          </div>
          <button
            onClick={() => setCurrentHole(Math.min(18, currentHole + 1))}
            disabled={currentHole === 18}
            className="p-2 rounded-full border border-gold/20 hover:bg-gold/10 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={18} className="text-gold" />
          </button>
        </div>

        {/* Stroke selector */}
        <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-3">
          Antall slag
        </p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((s) => {
            const label = scoreLabel(s, par)
            const isSelected = currentStrokes === s
            return (
              <button
                key={s}
                onClick={() => selectStrokes(s)}
                className={`h-12 rounded-xl font-bold text-lg transition-all border-2 ${
                  isSelected
                    ? `${SCORE_COLORS[label]} border-transparent scale-105 shadow`
                    : 'bg-cream border-gold/20 text-navy hover:border-gold'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>

        {/* Score label */}
        {currentStrokes && (
          <div className="text-center mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${SCORE_COLORS[scoreLabel(currentStrokes, par)]}`}>
              {scoreLabel(currentStrokes, par) === 'eagle' ? '🦅 Eagle!' :
               scoreLabel(currentStrokes, par) === 'birdie' ? '🐦 Birdie!' :
               scoreLabel(currentStrokes, par) === 'par' ? '✓ Par' :
               scoreLabel(currentStrokes, par) === 'bogey' ? 'Bogey' : 'Dobbelt+'}
            </span>
          </div>
        )}

        {saving && <p className="text-center text-xs text-gray-400">Lagrer...</p>}
        {saved && (
          <p className="text-center text-xs text-green-600 flex items-center justify-center gap-1">
            <CheckCircle size={12} /> Lagret!
          </p>
        )}
      </div>

      {/* Special awards */}
      <div className="bg-white rounded-2xl border border-gold/15 p-5 shadow-sm">
        <p className="font-serif font-semibold text-navy mb-3">Spesielle utmerkelser</p>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setAwardType(awardType === 'longest_drive' ? null : 'longest_drive')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              awardType === 'longest_drive'
                ? 'bg-gold text-navy border-gold'
                : 'border-gold/30 text-gold hover:bg-gold/10'
            }`}
          >
            🏌️ Longest Drive
          </button>
          <button
            onClick={() => setAwardType(awardType === 'closest_to_pin' ? null : 'closest_to_pin')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              awardType === 'closest_to_pin'
                ? 'bg-gold text-navy border-gold'
                : 'border-gold/30 text-gold hover:bg-gold/10'
            }`}
          >
            🎯 Closest to Pin
          </button>
        </div>
        {awardType && (
          <div className="flex gap-2">
            <input
              type="text"
              value={awardValue}
              onChange={(e) => setAwardValue(e.target.value)}
              placeholder={awardType === 'longest_drive' ? 'f.eks. 245 meter' : 'f.eks. 1.2 meter'}
              className="flex-1 border border-gold/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
            <button onClick={submitSpecialAward} className="btn-gold px-4 py-2 text-xs rounded-lg">
              Send
            </button>
          </div>
        )}
      </div>

      {/* Photo upload */}
      <div className="bg-white rounded-2xl border border-gold/15 p-5 shadow-sm">
        <p className="font-serif font-semibold text-navy mb-3">📸 Glimtskudd fra hull {currentHole}</p>
        <label className="flex flex-col items-center gap-2 cursor-pointer border-2 border-dashed border-gold/30 rounded-xl p-6 hover:border-gold hover:bg-gold/5 transition-colors">
          <Upload size={24} className="text-gold" />
          <span className="text-sm text-gray-500">
            {uploading ? 'Laster opp...' : 'Trykk for å laste opp bilde'}
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadPhoto(file)
            }}
          />
        </label>
      </div>

      {/* Next hole button */}
      {currentHole < 18 && (
        <button
          onClick={() => setCurrentHole(currentHole + 1)}
          className="w-full btn-gold justify-center py-3 rounded-xl"
        >
          Neste hull →
        </button>
      )}
      {currentHole === 18 && completedHoles === 18 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">🏆</p>
          <p className="font-serif text-xl font-bold text-green-800">Runden er ferdig!</p>
          <p className="text-green-600 text-sm mt-1">Alle 18 hull er registrert.</p>
        </div>
      )}
    </div>
  )
}
