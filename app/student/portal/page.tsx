import { createServerSupabase } from '@/lib/supabase-server'
import { StatCard, Alert, NoticeCard } from '@/components/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Student Dashboard' }

export default async function StudentDashboard() {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session!.user.id)
    .single()

  const { data: latestResult } = await supabase
    .from('results')
    .select('*, result_subjects(*)')
    .eq('student_id', session!.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  const subjects = latestResult?.result_subjects ?? []
  const avg = subjects.length
    ? (subjects.reduce((s: number, sub: { total: number }) => s + sub.total, 0) / subjects.length).toFixed(1)
    : null

  return (
    <>
      {/* Portal header */}
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="font-serif font-semibold text-xl">Dashboard</div>
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="font-mono text-xs">{profile?.reg_number}</span>
          <div className="w-9 h-9 rounded-full bg-green flex items-center justify-center text-white font-semibold text-sm">
            {(profile?.full_name ?? 'S').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        <div className="mb-5">
          <Alert variant="info">
            Welcome back, <strong>{profile?.full_name}</strong>.
            {latestResult ? ` Your ${latestResult.term} results are available.` : ' No results uploaded yet.'}
          </Alert>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard label="Class" value={profile?.class ?? '—'} sub="2024/2025 Session" />
          <StatCard label="Average Score" value={avg ?? '—'} sub={latestResult?.term ?? 'No results yet'} />
          <StatCard label="Position" value={latestResult?.position ?? '—'} sub={latestResult ? `of ${latestResult.total_students}` : ''} />
          <StatCard label="Status" value={profile?.status ?? 'Active'} sub="Current" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Notices */}
          <div>
            <div className="font-serif font-semibold text-lg mb-4">Recent Notices</div>
            {(notices ?? []).length === 0 ? (
              <div className="text-ink-soft text-sm">No notices yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {(notices ?? []).map((n: { id: string; type: string; title: string; body: string; created_at: string }) => (
                  <NoticeCard
                    key={n.id}
                    type={n.type}
                    title={n.title}
                    body={n.body}
                    date={new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Subject bars */}
          <div>
            <div className="font-serif font-semibold text-lg mb-4">Subject Performance</div>
            {subjects.length === 0 ? (
              <div className="text-ink-soft text-sm">No results available.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {subjects.slice(0, 6).map((s: { id: string; subject_name: string; total: number }) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-[13.5px] mb-1">
                      <span>{s.subject_name}</span>
                      <span className="font-medium">{s.total}/100</span>
                    </div>
                    <div className="h-1.5 bg-rule rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${s.total}%`,
                          background: s.total >= 75 ? '#1a6b3a' : s.total >= 50 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
