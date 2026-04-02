import { createServerSupabase } from '@/lib/supabase-server'
import type { Tournament, Team, Score, SpecialAward } from '@/types'
import Leaderboard from '@/components/Leaderboard'
import SpecialAwards from '@/components/SpecialAwards'

export const revalidate = 0

export default async function ResultaterPage() {
  const supabase = createServerSupabase()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['upcoming', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!tournament) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-4">
        <div>
          <p className="text-4xl mb-4">⛳</p>
          <h1 className="font-serif text-2xl font-bold text-navy mb-2">Ingen aktiv turnering</h1>
          <p className="text-gray-500 text-sm">Resultater vil vises her under turneringen.</p>
        </div>
      </div>
    )
  }

  const t = tournament as Tournament

  const [{ data: teams }, { data: scores }, { data: awards }] = await Promise.all([
    supabase.from('teams').select('*').eq('tournament_id', t.id),
    supabase.from('scores').select('*').in(
      'team_id',
      (await supabase.from('teams').select('id').eq('tournament_id', t.id)).data?.map((x) => x.id) ?? []
    ),
    supabase.from('special_awards').select('*, teams(name, player1, player2)').eq('tournament_id', t.id),
  ])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-cream-gradient py-12 px-4 text-center border-b border-gold/10">
        <span className="badge mb-4">⚡ Live Resultater</span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-2">
          Resultattavle
        </h1>
        <p className="text-gray-500 text-sm">Oppdateres automatisk i sanntid</p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Leaderboard (realtime client component) */}
        <Leaderboard
          tournament={t}
          initialTeams={(teams ?? []) as Team[]}
          initialScores={(scores ?? []) as Score[]}
        />

        {/* Special awards */}
        <SpecialAwards
          tournamentId={t.id}
          initialAwards={(awards ?? []) as SpecialAward[]}
        />
      </div>
    </div>
  )
}
