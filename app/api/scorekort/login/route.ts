import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()

  if (!pin || typeof pin !== 'string') {
    return NextResponse.json({ error: 'PIN mangler' }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('pin', pin.trim())
    .limit(1)
    .single()

  if (!team) {
    return NextResponse.json({ error: 'Feil PIN — prøv igjen' }, { status: 401 })
  }

  const res = NextResponse.json({ teamId: team.id, teamName: team.name })
  res.cookies.set('team_id', team.id, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
    sameSite: 'lax',
  })
  res.cookies.set('team_pin', pin.trim(), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 12,
    sameSite: 'lax',
  })
  return res
}
