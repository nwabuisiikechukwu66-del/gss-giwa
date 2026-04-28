'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Alert, Button } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [regNum, setRegNum] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Students log in with reg_number as email prefix + @gssjiwa.student
    const email = `${regNum.trim().toLowerCase().replace(/\//g, '_')}@gssjiwa.student`

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid registration number or password. Please check and try again.')
      setLoading(false)
      return
    }

    router.push('/student/portal')
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
          <div className="font-serif text-3xl font-semibold leading-tight mb-2">Government Secondary<br/>School, Jiwa</div>
          <div className="w-10 h-0.5 bg-white/25 mx-auto my-4" />
          <div className="font-serif italic text-white/55 text-base">Education for Self Reliance</div>
          <div className="mt-10 p-5 bg-white/[0.06] border border-white/12 rounded text-left">
            <div className="font-mono text-[10px] tracking-widest uppercase text-white/35 mb-3">Login Format</div>
            <div className="font-mono text-[12px] text-white/60 space-y-1.5">
              <div><span className="text-white/40">Reg:</span> GSS/2024/001</div>
              <div><span className="text-white/40">Pass:</span> Set by admin</div>
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
              <div className="font-serif font-semibold text-green-dark leading-tight text-sm">Govt. Sec. Sch. Jiwa</div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-ink-soft">FCT Abuja</div>
            </div>
          </div>

          <Link href="/" className="font-mono text-[11px] tracking-widest uppercase text-green mb-6 inline-block hover:underline">← Back to Website</Link>

          <div className="font-serif font-semibold text-3xl mb-1">Student Portal</div>
          <div className="text-ink-soft text-sm mb-7">Enter your registration number and password to access your portal.</div>

          {error && <div className="mb-5"><Alert variant="error">{error}</Alert></div>}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Registration Number</label>
              <input
                value={regNum}
                onChange={e => setRegNum(e.target.value)}
                placeholder="e.g. GSS/2024/001"
                required
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded bg-white text-sm focus:border-green focus:ring-2 focus:ring-green/10 outline-none transition-all uppercase"
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
              {loading ? 'Signing in…' : 'Login to Portal'}
            </Button>
          </form>

          <div className="mt-5 text-center text-[13px] text-ink-soft">
            Forgotten your password?{' '}
            <Link href="/contact" className="text-green font-medium hover:underline">Contact the school office.</Link>
          </div>

          <div className="mt-6 pt-5 border-t border-rule text-center">
            <Link href="/admin/login" className="text-sm text-ink-soft hover:text-ink transition-colors">Admin Dashboard →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
