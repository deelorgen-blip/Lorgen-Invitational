'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Hjem' },
  { href: '/spilleregler', label: 'Spilleregler & Informasjon' },
  { href: '/resultater', label: 'Live Resultater' },
  { href: '/bilder', label: 'Turneringsbilder' },
  { href: '/hall-of-fame', label: 'Hall of Fame' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="w-9 h-9 rounded-full border border-gold/40 overflow-hidden bg-navy flex items-center justify-center">
              <Image src="/logo.png" alt="Lorgen" width={32} height={32} />
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-medium tracking-widest uppercase transition-colors ${
                    active
                      ? 'text-gold border-b border-gold pb-0.5'
                      : 'text-gray-300 hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right side: Scorekort + hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/scorekort"
              className="btn-gold text-xs px-4 py-2 rounded-full"
            >
              Scorekort
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 transition-colors"
              aria-label="Meny"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-navy border-t border-gold/20">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded text-sm font-medium tracking-wide transition-colors ${
                    active
                      ? 'text-gold bg-gold/10'
                      : 'text-gray-300 hover:text-gold hover:bg-gold/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
