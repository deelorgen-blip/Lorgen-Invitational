import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Team, Tournament, Score } from '@/types'
import ScoreEntry from '@/components/ScoreEntry'
import Link from 'next/link'

export default async function ScoreEntryPage({
  params,
}: {
  params: { teamId: string }
}) {
  const cookieStore = cookies()
  const teamIdCookie = cookieStore.get('team_id')?.value

  if (!teamIdCookie || teamIdCookie !== params.teamId) {
    redirect('/scorekort')
  }

  const supabase = createServerSupabase()

  const [{ data: team }, { data: tournament }] = await Promise.all([
    supabase.from('teams').select('*').eq('id', params.teamId).single(),
    supabase.from('tournaments').select('*').in('status', ['upcoming', 'active']).order('created_at', { ascending: false }).limit(1).single(),
  ])

  if (!team || !tournament) {
    redirect('/scorekort')
  }

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('team_id', params.teamId)

  return (
    <div className="min-h-screen bg-cream pb-10">
      {/* Header */}
      <div className="bg-cream-gradient border-b border-gold/10 py-6 px-4 text-center">
        <span className="badge mb-3">⛳ Scorekort</span>
        <h1 className="font-serif text-2xl font-bold text-navy">{(team as Team).name}</h1>
        <p className="text-gray-500 text-sm mt-1">{(tournament as Tournament).name} — {(tournament as Tournament).format}</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href="/resultater" className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline">
            📊 Se leaderboard
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/chat" className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline">
            💬 Live Chat
          </Link>
        </div>
      </div>

      <ScoreEntry
        team={team as Team}
        tournament={tournament as Tournament}
        initialScores={(scores ?? []) as Score[]}
      />
    </div>
  )
}
