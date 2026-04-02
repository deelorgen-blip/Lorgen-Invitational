'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { SpecialAward } from '@/types'

interface Props {
  tournamentId: string
  initialAwards: SpecialAward[]
}

export default function SpecialAwards({ tournamentId, initialAwards }: Props) {
  const [awards, setAwards] = useState<SpecialAward[]>(initialAwards)

  useEffect(() => {
    const channel = supabase
      .channel('special-awards-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'special_awards' }, async () => {
        const { data } = await supabase
          .from('special_awards')
          .select('*, teams(name, player1, player2)')
          .eq('tournament_id', tournamentId)
        if (data) setAwards(data as SpecialAward[])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tournamentId])

  const longestDrive = awards.filter((a) => a.type === 'longest_drive')
  const closestToPin = awards.filter((a) => a.type === 'closest_to_pin')

  return (
    <div className="bg-navy rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="badge">🏆 Utmerkelser</span>
      </div>
      <h2 className="font-serif text-2xl font-bold text-white mb-6">
        Spesielle <span className="text-gold">Utmerkelser</span>
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Longest Drive */}
        <div className="bg-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏌️</span>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-widest">
              Longest Drive
            </h3>
          </div>
          {longestDrive.length === 0 ? (
            <p className="text-gray-400 text-sm">Ikke registrert ennå</p>
          ) : (
            longestDrive.map((a) => (
              <div key={a.id} className="space-y-1">
                <p className="text-white font-semibold">{a.teams?.name ?? '—'}</p>
                {a.value && <p className="text-gold text-sm">{a.value}</p>}
                {a.hole && <p className="text-gray-400 text-xs">Hull {a.hole}</p>}
                {a.photo_url && (
                  <Image src={a.photo_url} alt="Longest drive" width={200} height={120} className="rounded-lg mt-2 object-cover w-full" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Closest to Pin */}
        <div className="bg-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎯</span>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-widest">
              Closest to Pin
            </h3>
          </div>
          {closestToPin.length === 0 ? (
            <p className="text-gray-400 text-sm">Ikke registrert ennå</p>
          ) : (
            closestToPin.map((a) => (
              <div key={a.id} className="space-y-1">
                <p className="text-white font-semibold">{a.teams?.name ?? '—'}</p>
                {a.value && <p className="text-gold text-sm">{a.value}</p>}
                {a.hole && <p className="text-gray-400 text-xs">Hull {a.hole}</p>}
                {a.photo_url && (
                  <Image src={a.photo_url} alt="Closest to pin" width={200} height={120} className="rounded-lg mt-2 object-cover w-full" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
