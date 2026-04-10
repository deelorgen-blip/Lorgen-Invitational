'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Tournament, Team, Sponsor, HallOfFameEntry, HoleConfig } from '@/types'
import TournamentForm from '@/components/admin/TournamentForm'
import TeamManager from '@/components/admin/TeamManager'
import SponsorManager from '@/components/admin/SponsorManager'
import HallOfFameManager from '@/components/admin/HallOfFameManager'
import CourseManager from '@/components/admin/CourseManager'
import { supabase } from '@/lib/supabase'
import { LogOut, Trophy, Users, Building2, Star, Settings, Map, Upload } from 'lucide-react'

type Tab = 'turnering' | 'bane' | 'lag' | 'sponsorer' | 'hof' | 'innstillinger'

interface Props {
  initialTournament: Tournament | null
  allTournaments: Tournament[]
  initialTeams: Team[]
  initialSponsors: Sponsor[]
  initialHof: HallOfFameEntry[]
  initialHoleConfigs: HoleConfig[]
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'turnering', label: 'Turnering', icon: <Trophy size={16} /> },
  { id: 'bane', label: 'Bane', icon: <Map size={16} /> },
  { id: 'lag', label: 'Lag', icon: <Users size={16} /> },
  { id: 'sponsorer', label: 'Sponsorer', icon: <Building2 size={16} /> },
  { id: 'hof', label: 'Hall of Fame', icon: <Star size={16} /> },
  { id: 'innstillinger', label: 'Innstillinger', icon: <Settings size={16} /> },
]

export default function AdminDashboardClient({
  initialTournament,
  allTournaments,
  initialTeams,
  initialSponsors,
  initialHof,
  initialHoleConfigs,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('turnering')
  const [tournament, setTournament] = useState<Tournament | null>(initialTournament)
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors)
  const [hof, setHof] = useState<HallOfFameEntry[]>(initialHof)
  const [coinBackUrl, setCoinBackUrl] = useState(initialTournament?.coin_back_image_url ?? '')
  const [uploadingCoin, setUploadingCoin] = useState(false)
  const [coinMsg, setCoinMsg] = useState('')
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  async function uploadCoinBack(file: File) {
    if (!tournament) return
    setUploadingCoin(true)
    setCoinMsg('')
    const path = `coin-back/${Date.now()}-${file.name}`
    const { data, error: uploadError } = await supabase.storage
      .from('tournament-photos')
      .upload(path, file, { upsert: true })
    if (uploadError || !data) {
      setCoinMsg(`Feil: ${uploadError?.message}`)
      setUploadingCoin(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('tournament-photos').getPublicUrl(data.path)
    const { error } = await supabase
      .from('tournaments')
      .update({ coin_back_image_url: publicUrl })
      .eq('id', tournament.id)
    if (error) {
      setCoinMsg(`Feil: ${error.message}`)
    } else {
      setCoinBackUrl(publicUrl)
      setTournament((t) => t ? { ...t, coin_back_image_url: publicUrl } : t)
      setCoinMsg('Bilde lagret ✓')
    }
    setUploadingCoin(false)
  }

  async function removeCoinBack() {
    if (!tournament) return
    const { error } = await supabase
      .from('tournaments')
      .update({ coin_back_image_url: null })
      .eq('id', tournament.id)
    if (!error) {
      setCoinBackUrl('')
      setTournament((t) => t ? { ...t, coin_back_image_url: null } : t)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Admin top bar */}
      <div className="bg-navy px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-gold/30 overflow-hidden">
            <Image src="/logo.png" alt="Lorgen" width={32} height={32} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Administrasjonspanel</p>
            <p className="text-gold/60 text-xs">Lorgen Invitational</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <LogOut size={14} />
          Logg ut
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Active tournament badge */}
        {tournament && (
          <div className="mb-6 bg-white border border-gold/20 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Aktiv turnering</p>
              <p className="font-serif font-bold text-navy">{tournament.name}</p>
            </div>
            <span className={`badge text-xs ${
              tournament.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
              tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              {tournament.status === 'active' ? '🟢 Pågår' :
               tournament.status === 'upcoming' ? '🔵 Kommende' : '⚫ Avsluttet'}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto mb-6 bg-white rounded-xl border border-gold/15 p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-navy text-white shadow'
                  : 'text-gray-500 hover:text-navy hover:bg-gold/10'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl border border-gold/15 p-6 shadow-sm">
          {activeTab === 'turnering' && (
            <div>
              <h2 className="font-serif text-xl font-bold text-navy mb-5">
                {tournament ? 'Rediger turnering' : 'Opprett turnering'}
              </h2>
              <TournamentForm tournament={tournament} onSaved={setTournament} />
            </div>
          )}

          {activeTab === 'bane' && (
            <div>
              <h2 className="font-serif text-xl font-bold text-navy mb-2">Baneoppsett</h2>
              <p className="text-sm text-gray-400 mb-5">{tournament?.course ?? 'Banen ikke satt'}</p>
              <CourseManager tournament={tournament} initialConfigs={initialHoleConfigs} />
            </div>
          )}

          {activeTab === 'lag' && (
            <div>
              <h2 className="font-serif text-xl font-bold text-navy mb-5">Lag & Spillere</h2>
              <TeamManager
                teams={teams.filter((t) => !tournament || t.tournament_id === tournament.id)}
                tournament={tournament}
                onUpdated={setTeams}
              />
            </div>
          )}

          {activeTab === 'sponsorer' && (
            <div>
              <h2 className="font-serif text-xl font-bold text-navy mb-5">Sponsorer</h2>
              <SponsorManager sponsors={sponsors} onUpdated={setSponsors} />
            </div>
          )}

          {activeTab === 'hof' && (
            <div>
              <h2 className="font-serif text-xl font-bold text-navy mb-5">Hall of Fame</h2>
              <HallOfFameManager entries={hof} onUpdated={setHof} />
            </div>
          )}

          {activeTab === 'innstillinger' && (
            <div>
              <h2 className="font-serif text-xl font-bold text-navy mb-5">Innstillinger</h2>
              <div className="space-y-4">

                {/* Coin back image */}
                <div className="bg-gold/5 border border-gold/15 rounded-xl p-5">
                  <h3 className="font-semibold text-navy mb-1">🪙 Baksidebilde på spinnende mynt</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Valgfritt. Uten bilde vises logoen på begge sider av mynten.
                  </p>
                  {!tournament ? (
                    <p className="text-sm text-gray-400">Opprett en turnering først.</p>
                  ) : (
                    <div className="flex items-center gap-4 flex-wrap">
                      {coinBackUrl ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gold flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={coinBackUrl} alt="Mynt bakside" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gold/30 flex items-center justify-center flex-shrink-0 bg-white">
                          <span className="text-2xl">🪙</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 btn-outline text-xs px-4 py-2 rounded-lg">
                          <Upload size={14} />
                          {uploadingCoin ? 'Laster opp...' : coinBackUrl ? 'Bytt bilde' : 'Last opp bilde'}
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingCoin}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCoinBack(f) }} />
                        </label>
                        {coinBackUrl && (
                          <button onClick={removeCoinBack} className="text-xs text-red-400 hover:text-red-600 text-left">
                            Fjern bilde (bruk standard logo)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {coinMsg && (
                    <p className={`text-sm mt-3 font-medium ${coinMsg.startsWith('Feil') ? 'text-red-500' : 'text-green-600'}`}>
                      {coinMsg}
                    </p>
                  )}
                </div>

                <div className="bg-gold/5 border border-gold/15 rounded-xl p-5">
                  <h3 className="font-semibold text-navy mb-1">Statistikk</h3>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gold">{teams.length}</p>
                      <p className="text-xs text-gray-500">Lag</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gold">{sponsors.filter(s => s.visible).length}</p>
                      <p className="text-xs text-gray-500">Sponsorer</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gold">{hof.length}</p>
                      <p className="text-xs text-gray-500">Hall of Fame</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gold/5 border border-gold/15 rounded-xl p-5">
                  <h3 className="font-semibold text-navy mb-2">Database-oppsett</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Sørg for at Supabase-skjemaet er kjørt. Filen finner du i{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">supabase/schema.sql</code>.
                  </p>
                  <p className="text-sm text-gray-500">
                    Opprett en offentlig storage-bucket kalt{' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">tournament-photos</code>{' '}
                    i Supabase dashboard for bildeopplasting.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-semibold text-blue-800 mb-2">Vercel-deploy</h3>
                  <p className="text-sm text-blue-600">
                    Sett følgende miljøvariabler i Vercel-prosjektet:
                  </p>
                  <ul className="text-xs font-mono bg-blue-100 rounded-lg p-3 mt-2 space-y-1 text-blue-800">
                    <li>NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                    <li>SUPABASE_SERVICE_ROLE_KEY</li>
                    <li>ADMIN_PASSWORD</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
