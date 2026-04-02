import { createServerSupabase } from '@/lib/supabase-server'
import type { HallOfFameEntry } from '@/types'
import Link from 'next/link'

export const revalidate = 60

export default async function HallOfFamePage() {
  const supabase = createServerSupabase()
  const { data: entries } = await supabase
    .from('hall_of_fame')
    .select('*')
    .order('year', { ascending: false })

  const hof = (entries ?? []) as HallOfFameEntry[]

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-cream-gradient py-12 px-4 text-center border-b border-gold/10">
        <span className="badge mb-4">🏆 Æresgalleri</span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-2">Arven</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Mestere risset i gull — en permanent oversikt over de som har conquert Lorgen Invitational
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="badge mb-3">Mestere</span>
          <h2 className="section-title">
            Æres<span className="text-gold">galleri</span>
          </h2>
        </div>

        {hof.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏆</p>
            <h3 className="font-serif text-2xl font-bold text-navy mb-2">
              Arven Begynner Her
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Den første mesteren vil bli udødeliggjort etter årets turnering. Blir det deg?
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hof.map((entry, idx) => (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${
                  idx === 0 ? 'border-gold' : 'border-gold/15'
                }`}
              >
                {idx === 0 && (
                  <div className="bg-gold px-4 py-2 text-navy text-xs font-bold uppercase tracking-widest text-center">
                    👑 Regjerende mester
                  </div>
                )}
                <div className="p-6 flex items-center gap-6">
                  <div className="text-center min-w-[64px]">
                    <p className="font-serif text-3xl font-bold text-gold">{entry.year}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-bold text-navy">{entry.team_name}</h3>
                    {(entry.player1 || entry.player2) && (
                      <p className="text-gray-500 text-sm mt-0.5">
                        {[entry.player1, entry.player2].filter(Boolean).join(' & ')}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {entry.format && (
                        <span className="text-xs badge">{entry.format}</span>
                      )}
                      {entry.score && (
                        <span className="text-xs font-semibold text-gold">{entry.score}</span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-gray-400 mt-2 italic">{entry.notes}</p>
                    )}
                  </div>
                  <div className="text-3xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quote section */}
        <div className="mt-16 text-center bg-navy rounded-2xl p-8">
          <p className="text-3xl mb-4">⛳</p>
          <blockquote className="font-serif text-xl text-white italic mb-3">
            "Golf er bedragersk enkelt og uendelig komplisert."
          </blockquote>
          <p className="text-gold text-sm">— Arnold Palmer</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/resultater" className="btn-gold text-sm">
              📊 Live Resultater
            </Link>
            <Link href="/" className="btn-outline text-sm text-white border-white/30 hover:bg-white/10">
              Tilbake til Hjem
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
