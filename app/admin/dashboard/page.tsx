import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Tournament, Team, Sponsor, HallOfFameEntry } from '@/types'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboardPage() {
  const cookieStore = cookies()
  const isAdmin = cookieStore.get('admin_auth')?.value === 'true'
  if (!isAdmin) redirect('/admin')

  const supabase = createServerSupabase()

  const [
    { data: tournaments },
    { data: teams },
    { data: sponsors },
    { data: hofEntries },
  ] = await Promise.all([
    supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
    supabase.from('teams').select('*').order('created_at'),
    supabase.from('sponsors').select('*').order('sort_order'),
    supabase.from('hall_of_fame').select('*').order('year', { ascending: false }),
  ])

  const activeTournament = (tournaments ?? []).find(
    (t) => t.status === 'active' || t.status === 'upcoming'
  ) ?? null

  return (
    <AdminDashboardClient
      initialTournament={activeTournament as Tournament | null}
      allTournaments={(tournaments ?? []) as Tournament[]}
      initialTeams={(teams ?? []) as Team[]}
      initialSponsors={(sponsors ?? []) as Sponsor[]}
      initialHof={(hofEntries ?? []) as HallOfFameEntry[]}
    />
  )
}
