'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/academics', label: 'Academics' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="bg-white border-b-2 border-rule-dark sticky top-0 z-50 h-[70px]">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2 border-green-light">
              <Image src="/logo.jpg" alt="GSS Jiwa Logo" width={44} height={44} className="object-cover w-full h-full" />
            </div>
            <div className="min-w-0">
              <div className="font-serif text-green-dark font-semibold text-base leading-tight truncate">Govt. Sec. Sch. Jiwa</div>
              <div className="font-mono text-ink-soft text-[10px] tracking-widest uppercase">FCT Abuja · Est. 1980</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm px-4 py-2 rounded transition-all relative ${
                  pathname === l.href
                    ? 'text-green font-medium'
                    : 'text-ink-mid hover:text-green hover:bg-green-pale'
                }`}
              >
                {l.label}
                {pathname === l.href && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-green rounded-t" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium border border-green text-green px-4 py-2 rounded transition-all hover:bg-green hover:text-white"
            >
              Student Portal
            </Link>
            <Link
              href="/admin/login"
              className="text-sm font-medium bg-green text-white px-4 py-2 rounded transition-all hover:bg-green-dark"
            >
              Admin
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-green-dark/97 flex flex-col px-8 pt-20 pb-10 gap-2">
          <button
            className="absolute top-5 right-5 text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X size={28} />
          </button>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="font-serif text-3xl font-medium text-white/85 py-3 border-b border-white/10 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-white/80 font-serif text-xl py-2 border-b border-white/10"
            >
              Student Portal →
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="text-white/80 font-serif text-xl py-2"
            >
              Admin Dashboard →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
