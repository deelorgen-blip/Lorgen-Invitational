'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Photo } from '@/types'
import { Heart } from 'lucide-react'

interface Props {
  tournamentId: string | null
  initialPhotos: Photo[]
}

export default function PhotoGallery({ tournamentId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [voted, setVoted] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!tournamentId) return
    const channel = supabase
      .channel('photos-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, async () => {
        const { data } = await supabase
          .from('photos')
          .select('*, teams(name)')
          .eq('tournament_id', tournamentId)
          .order('votes', { ascending: false })
        if (data) setPhotos(data as Photo[])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tournamentId])

  async function vote(photoId: string) {
    if (voted.has(photoId)) return
    setVoted((prev) => new Set([...prev, photoId]))
    const current = photos.find((p) => p.id === photoId)
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, votes: p.votes + 1 } : p))
    )
    await supabase.from('photos').update({ votes: (current?.votes ?? 0) + 1 }).eq('id', photoId)
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gold/15 p-12 text-center shadow-sm">
        <p className="text-4xl mb-3">📷</p>
        <h3 className="font-serif text-xl font-bold text-navy mb-2">Ingen bilder ennå</h3>
        <p className="text-gray-500 text-sm mb-6">
          Bilder dukker opp her etter hvert som spillere laster opp fra hullene.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/scorekort" className="btn-gold text-sm">
            ⛳ Gå til Scorekort
          </Link>
          <Link href="/resultater" className="btn-outline text-sm">
            📊 Live Resultater
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo, idx) => (
        <div key={photo.id} className="bg-white rounded-2xl border border-gold/15 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {idx === 0 && (
            <div className="bg-gold text-navy text-xs font-bold uppercase tracking-widest text-center py-1.5 px-3">
              🏆 Blinkskudd-leder
            </div>
          )}
          <div className="relative aspect-square">
            <Image
              src={photo.storage_path}
              alt={photo.caption ?? `Hull ${photo.hole}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {photo.hole && (
                  <p className="text-xs text-gold font-medium">Hull {photo.hole}</p>
                )}
                <p className="text-sm font-semibold text-navy">
                  {(photo as unknown as { teams?: { name: string } }).teams?.name ?? 'Ukjent lag'}
                </p>
                {photo.caption && (
                  <p className="text-xs text-gray-500 mt-0.5">{photo.caption}</p>
                )}
              </div>
              <button
                onClick={() => vote(photo.id)}
                disabled={voted.has(photo.id)}
                className={`flex flex-col items-center gap-0.5 transition-all ${
                  voted.has(photo.id)
                    ? 'text-red-500'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart
                  size={20}
                  fill={voted.has(photo.id) ? 'currentColor' : 'none'}
                />
                <span className="text-xs font-bold">{photo.votes}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
