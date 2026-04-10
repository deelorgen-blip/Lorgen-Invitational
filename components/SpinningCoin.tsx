'use client'

import Image from 'next/image'

interface SpinningCoinProps {
  backImageUrl?: string | null
  size?: number
}

export default function SpinningCoin({ backImageUrl, size = 140 }: SpinningCoinProps) {
  const logoSize = Math.round(size * 0.78)

  return (
    <div
      className="mx-auto relative"
      style={{ width: size, height: size, perspective: '800px' }}
    >
      <div className="coin-spinner relative w-full h-full">
        {/* Front: Lorgen logo on white */}
        <div className="coin-face coin-front w-full h-full rounded-full border-2 border-gold/50 bg-white shadow-xl flex items-center justify-center overflow-hidden">
          <Image
            src="/logo.png"
            alt="Lorgen Invitational"
            width={logoSize}
            height={logoSize}
            className="object-contain"
            priority
          />
        </div>

        {/* Back: custom image, or logo on gold gradient */}
        <div className="coin-face coin-back w-full h-full rounded-full border-2 border-gold/50 shadow-xl overflow-hidden">
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
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #E8D5A0, #C9A84C 50%, #A8813A)',
              }}
            >
              <Image
                src="/logo.png"
                alt="Lorgen Invitational"
                width={logoSize}
                height={logoSize}
                className="object-contain mix-blend-multiply"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
