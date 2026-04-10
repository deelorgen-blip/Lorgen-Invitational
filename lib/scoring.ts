import type { Team, Score, LeaderboardEntry, HoleConfig } from '@/types'

const DEFAULT_PAR = 4

export function calculateLeaderboard(
  teams: Team[],
  allScores: Score[],
  holeConfigs: HoleConfig[] = [],
  handicap_pct: number = 25
): LeaderboardEntry[] {
  // Build a map from hole number to config
  const configMap: Record<number, HoleConfig> = {}
  holeConfigs.forEach((h) => { configMap[h.hole] = h })

  const entries: LeaderboardEntry[] = teams.map((team) => {
    const teamScores = allScores.filter((s) => s.team_id === team.id)
    const grossStrokes = teamScores.reduce((sum, s) => sum + (s.strokes ?? 0), 0)
    const holesPlayed = teamScores.filter((s) => s.strokes !== null).length

    // SI-based handicap allowance: floor(team.handicap * handicap_pct / 100)
    const handicapAllowance = Math.floor(team.handicap * handicap_pct / 100)

    // Per-hole net calculation: −1 stroke on holes where stroke_index ≤ allowance
    let netStrokes = 0
    let parForHolesPlayed = 0
    teamScores.forEach((score) => {
      if (score.strokes === null) return
      const config = configMap[score.hole]
      const si = config?.stroke_index ?? 99 // no SI = no handicap stroke
      const handicapStroke = (handicapAllowance > 0 && si <= handicapAllowance) ? 1 : 0
      netStrokes += Math.max(1, score.strokes - handicapStroke)
      parForHolesPlayed += config?.par ?? DEFAULT_PAR
    })

    const vsPar = holesPlayed > 0 ? netStrokes - parForHolesPlayed : 0

    return {
      team,
      grossStrokes,
      netStrokes,
      vsPar,
      holesPlayed,
      scores: teamScores,
    }
  })

  // Sort: most holes played first, then by net strokes ascending
  return entries.sort((a, b) => {
    if (b.holesPlayed !== a.holesPlayed) return b.holesPlayed - a.holesPlayed
    return a.netStrokes - b.netStrokes
  })
}

export function scoreRelativeToPar(strokes: number, par: number): number {
  return strokes - par
}

export function scoreLabel(strokes: number, par: number): string {
  const diff = strokes - par
  if (diff <= -2) return 'eagle'
  if (diff === -1) return 'birdie'
  if (diff === 0) return 'par'
  if (diff === 1) return 'bogey'
  return 'double'
}

export function formatVsPar(vsPar: number): string {
  if (vsPar === 0) return 'E'
  return vsPar > 0 ? `+${vsPar}` : `${vsPar}`
}

export function coursePar(holeConfigs: HoleConfig[]): number {
  return holeConfigs.reduce((sum, h) => sum + h.par, 0)
}
