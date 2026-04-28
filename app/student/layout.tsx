import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import Sidebar from '@/components/layout/Sidebar'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, reg_number, class, role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin/dashboard')

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex">
        <Sidebar
          role="student"
          userName={profile?.full_name ?? 'Student'}
          userSub={`${profile?.reg_number ?? ''} · ${profile?.class ?? ''}`}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
