'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ChatMessage, Team } from '@/types'
import BirdieOverlay from './BirdieOverlay'
import { Send } from 'lucide-react'

interface Props {
  tournamentId: string
  team: Team
  initialMessages: ChatMessage[]
}

export default function LiveChat({ tournamentId, team, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [birdieShow, setBirdieShow] = useState(false)
  const [birdieTeam, setBirdieTeam] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${tournamentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `tournament_id=eq.${tournamentId}` },
        (payload) => {
          const msg = payload.new as ChatMessage
          setMessages((prev) => [...prev, msg])
          if (msg.type === 'birdie_shoutout' && msg.team_id !== team.id) {
            setBirdieTeam(msg.team_name ?? '')
            setBirdieShow(true)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tournamentId, team.id])

  async function sendMessage(type: 'message' | 'birdie_shoutout' = 'message') {
    const msg = type === 'birdie_shoutout' ? '🐦 BIRDIE! Ta et shot!' : input.trim()
    if (!msg && type === 'message') return

    setSending(true)
    if (type === 'birdie_shoutout') {
      setBirdieTeam(team.name)
      setBirdieShow(true)
    }

    await supabase.from('chat_messages').insert({
      tournament_id: tournamentId,
      team_id: team.id,
      team_name: team.name,
      message: msg,
      type,
    })

    if (type === 'message') setInput('')
    setSending(false)
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <BirdieOverlay
        show={birdieShow}
        teamName={birdieTeam}
        onDone={() => setBirdieShow(false)}
      />

      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-lg mx-auto">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              Ingen meldinger ennå — si hei! 👋
            </div>
          )}
          {messages.map((msg) => {
            const isOwn = msg.team_id === team.id
            const isBirdie = msg.type === 'birdie_shoutout'

            if (isBirdie) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-gold/20 border border-gold/30 text-navy rounded-2xl px-5 py-3 text-center max-w-xs">
                    <p className="text-lg font-bold">🐦 BIRDIE!</p>
                    <p className="text-sm font-medium">{msg.team_name}</p>
                    <p className="text-xs text-gold mt-0.5">Ta et birdie-shot! 🥃</p>
                  </div>
                </div>
              )
            }

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isOwn && (
                    <p className="text-xs text-gold font-medium px-1">{msg.team_name}</p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-navy text-white rounded-br-sm'
                        : 'bg-white border border-gold/15 text-navy rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <p className="text-xs text-gray-400 px-1">{formatTime(msg.created_at)}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gold/15 bg-white p-3 space-y-2">
          {/* Birdie Shoutout button */}
          <button
            onClick={() => sendMessage('birdie_shoutout')}
            className="w-full btn-gold justify-center py-2.5 rounded-xl text-sm font-bold"
          >
            🐦 Birdie Shoutout! — Varsle alle om birdie
          </button>

          {/* Regular message */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Skriv en melding..."
              className="flex-1 border border-gold/20 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-gold text-navy"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-full bg-gold flex items-center justify-center hover:bg-gold-dark transition-colors disabled:opacity-40"
            >
              <Send size={15} className="text-navy" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
