import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-gradient flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 mx-auto rounded-full border border-gold/30 bg-white/60 flex items-center justify-center mb-6 shadow">
        <Image src="/logo.svg" alt="Lorgen" width={64} height={64} />
      </div>
      <h1 className="font-serif text-6xl font-bold text-gold mb-2">404</h1>
      <h2 className="font-serif text-2xl font-bold text-navy mb-3">Siden finnes ikke</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        Det ser ut som du har slått ballen ut av banen. La oss finne veien tilbake.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-gold">
          ⛳ Tilbake til Hjem
        </Link>
        <Link href="/resultater" className="btn-outline">
          📊 Live Resultater
        </Link>
      </div>
    </div>
  )
}
