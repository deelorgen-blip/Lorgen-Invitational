import { createServerSupabase } from '@/lib/supabase-server'
import type { Tournament } from '@/types'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const scrambleSteps = [
  {
    num: 1,
    title: 'Begge Slår Ut',
    desc: 'Begge lagspillere slår sine utslagsslag. Velg det beste utslaget — det er derfra spillet fortsetter.',
  },
  {
    num: 2,
    title: 'Spill fra Beste Ballen',
    desc: 'Begge spillere plukker opp og spiller fra det valgte stedet. Gjenta prosessen for hvert slag frem til ballen er i hullet.',
  },
  {
    num: 3,
    title: 'Scorekortsummen',
    desc: 'Når ballen er i hullet, noter det totale antallet slag brukt. Registrer poengsummen via appen etter at hullet er fullført.',
  },
  {
    num: 4,
    title: 'Fotoutfordringer',
    desc: 'På utvalgte hull må du laste opp et bilde før poengsummen godtas. Følg appens instruksjoner — det er en del av moroa!',
  },
]

export const revalidate = 60

export default async function SpillereglePage() {
  const supabase = createServerSupabase()
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['upcoming', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const t = tournament as Tournament | null

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-cream-gradient py-12 px-4 text-center border-b border-gold/10">
        <span className="badge mb-4">
          📋 Spilleregler & Informasjon
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-3">
          Spilleregler & Informasjon
        </h1>
        <p className="text-gray-500 text-sm">
          {t ? formatDate(t.date) : ''}{t?.course ? ` · ${t.course}` : ''}
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Tournament details */}
        <section>
          <div className="text-center mb-8">
            <span className="badge mb-3">Detaljer</span>
            <h2 className="section-title">
              Turneringsdetaljer{' '}
              <span className="text-gold">informasjon</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📅', label: 'Dato', value: t ? formatDate(t.date) : '—' },
              { icon: '📍', label: 'Bane', value: t?.course ?? '—' },
              { icon: '👥', label: 'Format', value: t?.format ?? '—' },
              { icon: '🏌️', label: 'Hull', value: t ? `${t.holes} Hull` : '18 Hull' },
            ].map((item) => (
              <div key={item.label} className="info-card flex flex-col items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-xs uppercase tracking-widest text-gray-400">{item.label}</p>
                <p className="font-medium text-navy text-sm text-center leading-snug">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Format rules */}
        <section>
          <div className="text-center mb-8">
            <span className="badge mb-3">Slik spilles det</span>
            <h2 className="section-title">
              {t?.format ?? '2-Mann Scramble'}{' '}
              <span className="text-gold">Format</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Et lagformat designet for maksimal moro og konkurranse
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {scrambleSteps.map((step) => (
              <div key={step.num} className="bg-white border border-gold/15 rounded-xl p-6 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy font-bold text-sm">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-navy mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Handicap */}
        <section>
          <div className="text-center mb-6">
            <span className="badge mb-3">Handicap</span>
            <h2 className="section-title">
              Handicap{' '}
              <span className="text-gold">beregning</span>
            </h2>
          </div>
          <div className="bg-white border border-gold/15 rounded-xl p-6 max-w-2xl mx-auto text-center">
            <p className="text-4xl font-serif font-bold text-gold mb-2">
              {t?.handicap_pct ?? 25}%
            </p>
            <p className="text-sm text-gray-500">
              Lag-handicap beregnes som {t?.handicap_pct ?? 25}% av lagspillernes kombinerte
              handicap, og trekkes fra totalscoren automatisk.
            </p>
          </div>
        </section>

        {/* General rules */}
        <section>
          <div className="text-center mb-6">
            <span className="badge mb-3">Generelle regler</span>
            <h2 className="section-title">
              Viktige{' '}
              <span className="text-gold">regler</span>
            </h2>
          </div>
          <ul className="max-w-2xl mx-auto space-y-3">
            {[
              'Alle slag registreres hull-for-hull via Scorekort-funksjonen i appen.',
              'Ballen må spilles fra innen 30 cm av valgt posisjon (ikke nærmere hullet).',
              'Maximum dobbelt bogey per hull i scramble-formatet.',
              'Alkohol er tillatt i moderate mengder — god tone er obligatorisk.',
              'Fotografering er oppmuntret! Last opp bilder fra banen under turneringen.',
              'Dommernes avgjørelser er endelige og ufravikelige.',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 bg-white border border-gold/10 rounded-lg px-5 py-4">
                <span className="text-gold font-bold text-sm mt-0.5">{i + 1}.</span>
                <p className="text-sm text-gray-600 leading-relaxed">{rule}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
