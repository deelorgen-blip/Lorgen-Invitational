import type { Team, Score, LeaderboardEntry } from '@/types'

const DEFAULT_PARS = Array(18).fill(4) // par 72

export function calculateLeaderboard(
  teams: Team[],
  allScores: Score[],
  holePars: number[] = DEFAULT_PARS
): LeaderboardEntry[] {
  const coursePar = holePars.reduce((a, b) => a + b, 0)

  const entries: LeaderboardEntry[] = teams.map((team) => {
    const teamScores = allScores.filter((s) => s.team_id === team.id)
    const grossStrokes = teamScores.reduce((sum, s) => sum + (s.strokes ?? 0), 0)
    const holesPlayed = teamScores.filter((s) => s.strokes !== null).length

    // Handicap allowance: 25% of team handicap strokes across 18 holes
    const handicapStrokes = Math.round(team.handicap * 0.25)
    const netStrokes = Math.max(0, grossStrokes - handicapStrokes)

    // vs par: only meaningful when all holes played
    const parForHolesPlayed = holePars
      .slice(0, holesPlayed)
      .reduce((a, b) => a + b, 0)
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

export function coursePar(holePars: number[]): number {
  return holePars.reduce((a, b) => a + b, 0)
}
