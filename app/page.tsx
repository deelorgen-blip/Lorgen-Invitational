import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Tournament, Sponsor } from '@/types'
import SpinningCoin from '@/components/SpinningCoin'

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

export const revalidate = 60

export default async function HomePage() {
  const supabase = createServerSupabase()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['upcoming', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('*')
    .eq('visible', true)
    .order('sort_order')

  const t = tournament as Tournament | null
  const sponsorList = (sponsors ?? []) as Sponsor[]

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream-gradient flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Spinning coin logo */}
        <div className="mb-8">
          <SpinningCoin backImageUrl={t?.coin_back_image_url} size={144} />
        </div>

        {/* Tournament name */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-2 tracking-tight">
          {t?.name ?? 'Lorgen Invitational'}
        </h1>
        <p className="text-xs tracking-[0.3em] text-gold uppercase font-medium mb-10">
          Power · Precision · Party
        </p>

        {/* Info strip */}
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <div className="info-card">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Turnering</p>
            <p className="font-medium text-navy text-sm">{t?.name ?? '—'}</p>
          </div>
          <div className="info-card">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Dato</p>
            <p className="font-medium text-navy text-sm leading-snug">
              {t ? formatDate(t.date) : '—'}
            </p>
          </div>
          <div className="info-card">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Bane</p>
            <p className="font-medium text-navy text-sm">{t?.course ?? '—'}</p>
          </div>
          <div className="info-card">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Format</p>
            <p className="font-medium text-navy text-sm">{t?.format ?? '—'}</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/resultater" className="btn-gold gap-2">
            <span>⚡</span>
            Live Resultater
          </Link>
          <Link href="/spilleregler" className="btn-outline gap-2">
            <span>📋</span>
            Spilleregler & Informasjon
          </Link>
        </div>
      </section>

      {/* Sponsors section */}
      {sponsorList.length > 0 && (
        <section className="py-10 px-4 border-t border-gold/10">
          <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-6">
            Sponsorer
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto">
            {sponsorList.map((s) => (
              <div key={s.id}>
                {s.website_url ? (
                  <a href={s.website_url} target="_blank" rel="noopener noreferrer">
                    {s.logo_url ? (
                      <Image src={s.logo_url} alt={s.name} width={120} height={48} className="object-contain opacity-70 hover:opacity-100 transition-opacity" />
                    ) : (
                      <span className="text-gold font-semibold text-lg">{s.name}</span>
                    )}
                  </a>
                ) : s.logo_url ? (
                  <Image src={s.logo_url} alt={s.name} width={120} height={48} className="object-contain opacity-70" />
                ) : (
                  <span className="text-gold font-semibold text-lg">{s.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
