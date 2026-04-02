import { createServerSupabase } from '@/lib/supabase-server'
import type { Tournament, Photo } from '@/types'
import PhotoGallery from '@/components/PhotoGallery'

export const revalidate = 0

export default async function BilderPage() {
  const supabase = createServerSupabase()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['upcoming', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const t = tournament as Tournament | null

  const { data: photos } = t
    ? await supabase
        .from('photos')
        .select('*, teams(name)')
        .eq('tournament_id', t.id)
        .order('votes', { ascending: false })
    : { data: [] }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-cream-gradient py-12 px-4 text-center border-b border-gold/10">
        <span className="badge mb-4">📸 Bildealbum</span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-2">
          Dagens Turneringsbilder
        </h1>
        <p className="text-gray-500 text-sm">
          Stem på ditt favorittbilde fra dagens runde — flest stemmer vinner blinkskudd-tittelen
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <span className="badge mb-3">Galleriet</span>
          <h2 className="section-title mt-2">
            Alle <span className="text-gold">Bilder</span>
          </h2>
        </div>

        <PhotoGallery
          tournamentId={t?.id ?? null}
          initialPhotos={(photos ?? []) as Photo[]}
        />
      </div>
    </div>
  )
}
