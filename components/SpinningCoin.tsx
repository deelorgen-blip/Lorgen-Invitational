'use client'

import Image from 'next/image'

interface SpinningCoinProps {
  backImageUrl?: string | null
  size?: number
}

export default function SpinningCoin({ backImageUrl, size = 140 }: SpinningCoinProps) {
  return (
    <div
      className="mx-auto relative"
      style={{ width: size, height: size, perspective: '800px' }}
    >
      <div
        className="coin-spinner relative w-full h-full"
      >
        {/* Front: Lorgen logo */}
        <div
          className="coin-face coin-front w-full h-full rounded-full border-2 border-gold/50 bg-white/80 shadow-xl flex items-center justify-center"
        >
          <Image
            src="/logo.png"
            alt="Lorgen Invitational"
            width={Math.round(size * 0.78)}
            height={Math.round(size * 0.78)}
            priority
          />
        </div>

        {/* Back: custom image or default gold back */}
        <div
          className="coin-face coin-back w-full h-full rounded-full border-2 border-gold/50 shadow-xl overflow-hidden"
        >
          {backImageUrl ? (
            <Image
              src={backImageUrl}
              alt="Mynt bakside"
              width={size}
              height={size}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #E8D5A0, #C9A84C 50%, #A8813A)',
              }}
            >
              <span className="font-serif font-bold text-navy/80 text-center text-xs leading-tight px-3">
                LORGEN<br />INVITATIONAL
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
