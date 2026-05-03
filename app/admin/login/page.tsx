'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Alert, Button } from '@/components/ui'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    })

    if (authError) {
      console.error('Admin login error:', authError)
      setError('Invalid credentials. Please check and try again.')
      setLoading(false)
      return
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      console.error('Role verification error:', profileError || 'Not an admin')
      await supabase.auth.signOut()
      setError('Access denied. This login is for admin staff only.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_480px]">
      {/* Left panel */}
      <div className="hidden lg:flex bg-green-dark items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, white 40px, white 41px)',
        }} />
        <div className="relative z-10 text-center text-white">
          <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20">
            <Image src="/logo.jpg" alt="GSS Jiwa" width={112} height={112} className="w-full h-full object-cover" />
          </div>
          <div className="font-serif text-3xl font-semibold leading-tight mb-2">Admin Dashboard</div>
          <div className="w-10 h-0.5 bg-white/25 mx-auto my-4" />
          <div className="font-serif italic text-white/55 text-base">Staff & Administration Access Only</div>
          <div className="mt-10 p-5 bg-white/[0.06] border border-white/12 rounded text-left">
            <div className="font-mono text-[10px] tracking-widest uppercase text-white/35 mb-3">Access Level</div>
            <div className="font-mono text-[12px] text-white/60 space-y-1.5">
              <div>Full student management</div>
              <div>Results entry & editing</div>
              <div>Notice board control</div>
              <div>Staff directory</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-12 bg-white min-h-screen">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-light">
              <Image src="/logo.jpg" alt="GSS Jiwa" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-serif font-semibold text-green-dark leading-tight text-sm">Admin Dashboard</div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-ink-soft">GSS Jiwa</div>
            </div>
          </div>

          <Link href="/" className="font-mono text-[11px] tracking-widest uppercase text-green mb-6 inline-block hover:underline">← Back to Website</Link>

          <div className="font-serif font-semibold text-3xl mb-1">Admin Login</div>
          <div className="text-ink-soft text-sm mb-7">Restricted to authorised school staff and administrators only.</div>

          {error && <div className="mb-5"><Alert variant="error">{error}</Alert></div>}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@gssjiwa.edu.ng"
                required
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded bg-white text-sm focus:border-green focus:ring-2 focus:ring-green/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded bg-white text-sm focus:border-green focus:ring-2 focus:ring-green/10 outline-none transition-all"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full justify-center py-3">
              {loading ? 'Signing in…' : 'Login to Dashboard'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-rule text-center">
            <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">← Student Portal Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
