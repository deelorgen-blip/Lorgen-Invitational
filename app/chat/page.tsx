import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Team, Tournament, ChatMessage } from '@/types'
import LiveChat from '@/components/LiveChat'
import Link from 'next/link'

export default async function ChatPage() {
  const cookieStore = cookies()
  const teamId = cookieStore.get('team_id')?.value

  if (!teamId) redirect('/scorekort')

  const supabase = createServerSupabase()

  const [{ data: team }, { data: tournament }] = await Promise.all([
    supabase.from('teams').select('*').eq('id', teamId).single(),
    supabase
      .from('tournaments')
      .select('*')
      .in('status', ['upcoming', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  if (!team || !tournament) redirect('/scorekort')

  const t = tournament as Tournament

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('tournament_id', t.id)
    .order('created_at')
    .limit(100)

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-navy px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-serif font-bold">Live Chat</h1>
          <p className="text-gold/70 text-xs">{(team as Team).name}</p>
        </div>
        <Link href="/scorekort" className="text-xs text-gold hover:underline">
          ← Scorekort
        </Link>
      </div>

      <LiveChat
        tournamentId={t.id}
        team={team as Team}
        initialMessages={(messages ?? []) as ChatMessage[]}
      />
    </div>
  )
}
