import { createServerSupabase } from '@/lib/supabase-server'
import { Badge } from '@/components/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session!.user.id)
    .single()

  if (!profile) return <div className="p-8 text-ink-soft">Profile not found.</div>

  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4">
        <div className="font-serif font-semibold text-xl">My Profile</div>
      </div>
      <div className="p-4 md:p-8 bg-green-pale flex-1">
        <div className="max-w-xl">
          <div className="bg-white border border-rule rounded overflow-hidden">
            {/* Header */}
            <div className="bg-green-dark px-6 py-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center font-serif text-2xl font-semibold text-white">
                {initials}
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold text-white">{profile.full_name}</div>
                <div className="font-mono text-[11px] tracking-widest uppercase text-white/50">{profile.reg_number}</div>
              </div>
            </div>

            {/* Fields */}
            <div className="p-5">
              {[
                ['Full Name', profile.full_name],
                ['Registration Number', profile.reg_number],
                ['Class', profile.class],
                ['Gender', profile.gender],
                ['Date of Birth', profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                ['Session', profile.session ?? '2024/2025'],
                ['Status', null],
                ['Guardian / Parent', profile.guardian_name],
                ['Guardian Phone', profile.guardian_phone],
                ['Home Address', profile.address],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between items-start py-2.5 border-b border-rule last:border-0 text-sm">
                  <span className="font-mono text-[11px] tracking-wider uppercase text-ink-soft w-40 flex-shrink-0">{label}</span>
                  <span className="font-medium text-right flex-1 ml-4">
                    {label === 'Status'
                      ? <Badge variant="green">{profile.status ?? 'Active'}</Badge>
                      : (value as string) || <span className="text-ink-soft font-normal">—</span>
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-ink-soft mt-4 text-center">
            To update your profile details, please contact the school administration office.
          </p>
        </div>
      </div>
    </>
  )
}
