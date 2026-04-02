'use client'

import Image from 'next/image'

interface SpinningCoinProps {
  backImageUrl?: string | null
  size?: number
}

export default function SpinningCoin({ backImageUrl, size = 140 }: SpinningCoinProps) {
  return (
    <div
      className="spinning-coin-wrapper mx-auto"
      style={{ width: size, height: size, perspective: 800 }}
    >
      <div className="spinning-coin" style={{ width: size, height: size }}>
        {/* Front: Lorgen logo */}
        <div
          className="coin-face coin-front rounded-full border-2 border-gold/50 bg-white/80 shadow-xl flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Image
            src="/logo.svg"
            alt="Lorgen Invitational"
            width={size * 0.78}
            height={size * 0.78}
            priority
          />
        </div>

        {/* Back: custom image or default gold back */}
        <div
          className="coin-face coin-back rounded-full border-2 border-gold/50 shadow-xl overflow-hidden"
          style={{ width: size, height: size }}
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

      <style jsx>{`
        .spinning-coin-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinning-coin {
          position: relative;
          transform-style: preserve-3d;
          animation: coinSpin 4s linear infinite;
        }
        .coin-face {
          position: absolute;
          top: 0;
          left: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .coin-front {
          transform: rotateY(0deg);
        }
        .coin-back {
          transform: rotateY(180deg);
        }
        @keyframes coinSpin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  )
}
