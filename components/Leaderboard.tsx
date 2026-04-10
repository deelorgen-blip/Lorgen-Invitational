'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateLeaderboard, formatVsPar, scoreLabel } from '@/lib/scoring'
import type { Team, Score, LeaderboardEntry, Tournament, HoleConfig } from '@/types'
import { RefreshCw } from 'lucide-react'

interface Props {
  tournament: Tournament
  initialTeams: Team[]
  initialScores: Score[]
  holeConfigs: HoleConfig[]
}

function ScoreCell({ strokes, par }: { strokes: number | null; par: number }) {
  if (strokes === null) return <span className="text-gray-300">—</span>
  const label = scoreLabel(strokes, par)
  const classes = {
    eagle: 'score-eagle',
    birdie: 'score-birdie',
    par: 'score-par',
    bogey: 'score-bogey',
    double: 'score-double',
  }[label]
  const display = label === 'par' ? '–' : strokes.toString()
  return <span className={classes}>{display}</span>
}

export default function Leaderboard({ tournament, initialTeams, initialScores, holeConfigs }: Props) {
  const [teams] = useState<Team[]>(initialTeams)
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Build par array from holeConfigs for display (fallback to par 4)
  const holePars = Array.from({ length: 18 }, (_, i) => {
    const cfg = holeConfigs.find((h) => h.hole === i + 1)
    return cfg?.par ?? 4
  })

  const refreshScores = useCallback(async () => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .in('team_id', teams.map((t) => t.id))
    if (data) {
      setScores(data as Score[])
      setLastUpdated(new Date())
    }
  }, [teams])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-scores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores' },
        () => { refreshScores() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [refreshScores])

  const entries = calculateLeaderboard(teams, scores, holeConfigs, tournament.handicap_pct)

  return (
    <div className="space-y-8">
      {/* Leaderboard table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-2xl font-bold text-navy">
            Ledertavle
            <span className="block w-10 h-0.5 bg-gold mt-1" />
          </h2>
          <button
            onClick={refreshScores}
            className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-dark transition-colors"
          >
            <RefreshCw size={13} />
            Oppdater
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gold/15 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['POS', 'LAG', 'NETTO', '+/-', 'BRUTTO', 'HULL'].map((h) => (
                  <th key={h} className="table-header text-left first:pl-4 last:pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                    Ingen poeng registrert ennå
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr
                    key={entry.team.id}
                    className="bg-white hover:bg-gold/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-navy">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{entry.team.name}</p>
                      {(entry.team.player1 || entry.team.player2) && (
                        <p className="text-xs text-gray-400">
                          {[entry.team.player1, entry.team.player2].filter(Boolean).join(' & ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-navy">
                      {entry.holesPlayed > 0 ? entry.netStrokes : '—'}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${
                      entry.vsPar < 0 ? 'text-red-500' :
                      entry.vsPar > 0 ? 'text-gray-600' : 'text-navy'
                    }`}>
                      {entry.holesPlayed > 0 ? formatVsPar(entry.vsPar) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {entry.holesPlayed > 0 ? entry.grossStrokes : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {entry.holesPlayed}/18
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-2 text-right">
          Oppdateres automatisk i sanntid
        </p>
      </div>

      {/* Full scorecard */}
      <div>
        <div className="text-center mb-6">
          <span className="badge mb-3">Hull for Hull</span>
          <h2 className="section-title">
            Fullstendig <span className="text-gold">Resultatkort</span>
          </h2>
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="score-eagle">2</span>Eagle eller bedre</span>
            <span className="flex items-center gap-1"><span className="score-birdie">1</span>Birdie</span>
            <span className="flex items-center gap-1"><span className="score-par">–</span>Par</span>
            <span className="flex items-center gap-1"><span className="score-bogey">1</span>Bogey</span>
            <span className="flex items-center gap-1"><span className="score-double">2</span>Dobbelt+</span>
          </div>
        </div>

        {entries.map((entry) => {
          const scoreMap: Record<number, Score> = {}
          entry.scores.forEach((s) => { scoreMap[s.hole] = s })

          return (
            <div key={entry.team.id} className="mb-6 rounded-xl border border-gold/15 overflow-hidden shadow-sm">
              <div className="bg-navy px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{entry.team.name}</p>
                  {(entry.team.player1 || entry.team.player2) && (
                    <p className="text-gold/70 text-xs">
                      {[entry.team.player1, entry.team.player2].filter(Boolean).join(' & ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold">{entry.holesPlayed > 0 ? formatVsPar(entry.vsPar) : '—'}</p>
                  <p className="text-gray-400 text-xs">{entry.holesPlayed} hull</p>
                </div>
              </div>
              <div className="bg-white overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gold/10">
                      <td className="px-3 py-2 font-semibold text-gray-400 uppercase tracking-wider">Hull</td>
                      {Array.from({ length: 18 }, (_, i) => (
                        <td key={i + 1} className="px-1 py-2 text-center font-semibold text-gray-400 min-w-[28px]">
                          {i + 1}
                        </td>
                      ))}
                      <td className="px-3 py-2 font-semibold text-gray-400 uppercase tracking-wider">TOT</td>
                    </tr>
                    <tr className="border-b border-gold/10 bg-gold/5">
                      <td className="px-3 py-2 text-gray-400">Par</td>
                      {holePars.map((par, i) => (
                        <td key={i} className="px-1 py-2 text-center text-gray-400">{par}</td>
                      ))}
                      <td className="px-3 py-2 text-gray-400">{holePars.reduce((a, b) => a + b, 0)}</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 text-gray-500 font-medium">Slag</td>
                      {Array.from({ length: 18 }, (_, i) => {
                        const score = scoreMap[i + 1]
                        return (
                          <td key={i + 1} className="px-1 py-2 text-center">
                            {score?.strokes != null ? (
                              <ScoreCell strokes={score.strokes} par={holePars[i]} />
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 font-bold text-navy">
                        {entry.holesPlayed > 0 ? entry.grossStrokes : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
