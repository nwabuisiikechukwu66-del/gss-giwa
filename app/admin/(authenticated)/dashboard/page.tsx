import { createServerSupabase } from '@/lib/supabase-server'
import { StatCard, Badge } from '@/components/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const supabase = createServerSupabase()

  const [
    { count: studentCount, error: studentErr },
    { data: recentStudents, error: recentErr },
    { data: notices, error: noticesErr },
    { count: staffCount, error: staffErr },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('full_name, reg_number, class, status, created_at').eq('role', 'student').order('created_at', { ascending: false }).limit(6),
    supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('staff').select('*', { count: 'exact', head: true }),
  ])

  if (studentErr || recentErr || noticesErr || staffErr) {
    console.error('Dashboard data fetch error:', { studentErr, recentErr, noticesErr, staffErr })
  }

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between">
        <div className="font-serif font-semibold text-xl">Dashboard</div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-green flex items-center justify-center text-white font-semibold text-sm">AD</div>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard label="Total Students" value={studentCount ?? 0} sub="Registered" />
          <StatCard label="Staff Members" value={Number(staffCount ?? 0)} sub="Teaching & Non-teaching" />
          <StatCard label="Classes" value={18} sub="JSS1 – SS3" />
          <StatCard label="Active Session" value="2024/25" sub="Third Term" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent students */}
          <div className="bg-white border border-rule rounded">
            <div className="px-5 py-4 border-b border-rule font-serif font-semibold text-lg">Recent Students</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {['Reg. No.','Name','Class','Status'].map(h => (
                      <th key={h} className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-4 py-2.5 border-b border-rule bg-green-pale">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(recentStudents ?? []).map((s: { reg_number: string; full_name: string; class: string; status: string }) => (
                    <tr key={s.reg_number} className="hover:bg-green-pale">
                      <td className="px-4 py-2.5 border-b border-rule font-mono text-[11.5px] text-ink-soft">{s.reg_number}</td>
                      <td className="px-4 py-2.5 border-b border-rule font-medium">{s.full_name}</td>
                      <td className="px-4 py-2.5 border-b border-rule">{s.class}</td>
                      <td className="px-4 py-2.5 border-b border-rule"><Badge variant="green">{s.status ?? 'Active'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notices */}
          <div className="bg-white border border-rule rounded">
            <div className="px-5 py-4 border-b border-rule font-serif font-semibold text-lg">Recent Notices</div>
            <div className="p-4 flex flex-col gap-3">
              {(notices ?? []).map((n: { id: string; type: string; title: string; created_at: string }) => (
                <div key={n.id} className="flex gap-3 items-start py-2 border-b border-rule last:border-0">
                  <Badge variant="green">{n.type}</Badge>
                  <div>
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="font-mono text-[11px] text-ink-soft">{new Date(n.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
