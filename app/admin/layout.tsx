import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/login')

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex">
        <Sidebar
          role="admin"
          userName={profile?.full_name ?? 'Administrator'}
          userSub="Admin Dashboard"
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
