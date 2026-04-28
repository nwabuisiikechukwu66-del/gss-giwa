import { createServerSupabase } from '@/lib/supabase-server'
import { GradeBadge, Alert } from '@/components/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Results' }

function gradeFromTotal(total: number): string {
  if (total >= 75) return 'A'
  if (total >= 60) return 'B'
  if (total >= 50) return 'C'
  if (total >= 40) return 'D'
  return 'F'
}

export default async function ResultsPage() {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, reg_number, class, session')
    .eq('id', session!.user.id)
    .single()

  const { data: results } = await supabase
    .from('results')
    .select('*, result_subjects(*)')
    .eq('student_id', session!.user.id)
    .order('created_at', { ascending: false })

  const allResults = results ?? []

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between">
        <div className="font-serif font-semibold text-xl">My Results</div>
        <div className="font-mono text-xs text-ink-soft">{profile?.reg_number}</div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        {allResults.length === 0 ? (
          <Alert variant="info">No results have been uploaded yet. Check back after your term examinations.</Alert>
        ) : (
          <div className="flex flex-col gap-8">
            {allResults.map((result) => {
              const subjects = result.result_subjects ?? []
              const avg = subjects.length
                ? (subjects.reduce((s: number, sub: { total: number }) => s + sub.total, 0) / subjects.length).toFixed(1)
                : '—'

              return (
                <div key={result.id}>
                  {/* Result header */}
                  <div className="bg-green-dark text-white rounded-t p-5 flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div className="font-serif text-xl font-semibold mb-3">{result.term} Results</div>
                      <div className="flex flex-wrap gap-6">
                        {[
                          ['Student', profile?.full_name],
                          ['Reg. No.', profile?.reg_number],
                          ['Class', result.class],
                          ['Session', result.session],
                          ['Position', `${result.position} of ${result.total_students}`],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <div className="font-mono text-[9px] tracking-widest uppercase text-white/40 mb-0.5">{k}</div>
                            <div className="font-medium text-sm">{v ?? '—'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="bg-white text-green-dark text-sm font-semibold px-4 py-2 rounded hover:bg-green-light transition-all no-print"
                    >
                      Print
                    </button>
                  </div>

                  {/* Result body */}
                  <div className="bg-white border border-rule border-t-0 rounded-b p-5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            {['Subject','C.A. (30)','Exam (70)','Total (100)','Grade','Remark'].map(h => (
                              <th key={h} className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-3 py-2.5 border-b-2 border-rule-dark bg-green-pale">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map((s: { id: string; subject_name: string; ca_score: number; exam_score: number; total: number; remark?: string }) => {
                            const grade = gradeFromTotal(s.total)
                            return (
                              <tr key={s.id} className="hover:bg-green-pale">
                                <td className="px-3 py-2.5 border-b border-rule font-medium">{s.subject_name}</td>
                                <td className="px-3 py-2.5 border-b border-rule text-ink-mid">{s.ca_score}</td>
                                <td className="px-3 py-2.5 border-b border-rule text-ink-mid">{s.exam_score}</td>
                                <td className="px-3 py-2.5 border-b border-rule font-semibold">{s.total}</td>
                                <td className="px-3 py-2.5 border-b border-rule"><GradeBadge grade={grade} /></td>
                                <td className="px-3 py-2.5 border-b border-rule text-ink-soft">{s.remark ?? grade === 'A' ? 'Excellent' : grade === 'B' ? 'Good' : grade === 'C' ? 'Fair' : 'Needs Improvement'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="px-3 py-3 font-serif font-semibold">Average Score</td>
                            <td className="px-3 py-3 font-bold text-base text-green">{avg}</td>
                            <td colSpan={2} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {(result.principal_remark || result.class_teacher_remark) && (
                      <div className="grid sm:grid-cols-2 gap-4 mt-5">
                        {result.class_teacher_remark && (
                          <div className="bg-green-pale border border-rule-dark rounded p-4">
                            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mb-2">Class Teacher&apos;s Remark</div>
                            <div className="font-serif text-[15px] italic">&ldquo;{result.class_teacher_remark}&rdquo;</div>
                          </div>
                        )}
                        {result.principal_remark && (
                          <div className="bg-green-pale border border-rule-dark rounded p-4">
                            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mb-2">Principal&apos;s Remark</div>
                            <div className="font-serif text-[15px] italic">&ldquo;{result.principal_remark}&rdquo;</div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-rule">
                      <div className="font-mono text-[10px] tracking-widest text-ink-soft uppercase">
                        Grading: A = 75–100 (Excellent) · B = 60–74 (Good) · C = 50–59 (Fair) · D = 40–49 (Pass) · F = 0–39 (Fail)
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
