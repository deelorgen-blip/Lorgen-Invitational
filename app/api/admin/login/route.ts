import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const adminPwd = process.env.ADMIN_PASSWORD ?? 'lorgen2026'

  if (password !== adminPwd) {
    return NextResponse.json({ error: 'Feil passord' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_auth', 'true', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: 'lax',
  })
  return res
}
