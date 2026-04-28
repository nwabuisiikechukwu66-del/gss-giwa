import { createServerSupabase } from '@/lib/supabase-server'
import { Alert } from '@/components/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Timetable' }

export default async function TimetablePage() {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, reg_number, class')
    .eq('id', session!.user.id)
    .single()

  const { data: timetable } = await supabase
    .from('timetables')
    .select('*')
    .eq('class', profile?.class ?? '')
    .order('period_order', { ascending: true })

  const rows = timetable ?? []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between">
        <div className="font-serif font-semibold text-xl">Timetable</div>
        <div className="font-mono text-xs text-ink-soft">{profile?.class}</div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        <div className="mb-5">
          <div className="font-serif font-semibold text-lg mb-1">Class Timetable — {profile?.class}</div>
          <div className="text-[13px] text-ink-soft">2024/2025 Academic Session · Third Term</div>
        </div>

        {rows.length === 0 ? (
          <Alert variant="info">No timetable has been uploaded for your class yet. Please check with your class teacher.</Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[640px]">
              <thead>
                <tr>
                  <th className="bg-green text-white font-mono text-[10px] tracking-widest uppercase px-3 py-2.5 text-left w-28">Time</th>
                  {days.map(d => (
                    <th key={d} className="bg-green text-white font-mono text-[10px] tracking-widest uppercase px-3 py-2.5 text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: {
                  id: string
                  time_slot: string
                  monday?: string
                  tuesday?: string
                  wednesday?: string
                  thursday?: string
                  friday?: string
                }) => {
                  const isBreak = row.time_slot?.toLowerCase().includes('break')
                  return (
                    <tr key={row.id} className={isBreak ? 'bg-green-pale' : 'odd:bg-white even:bg-green-pale/50'}>
                      <td className="font-mono text-[11.5px] text-ink-soft px-3 py-2.5 border border-rule bg-green-pale/80 font-medium whitespace-nowrap">{row.time_slot}</td>
                      {days.map(d => {
                        const val = row[d.toLowerCase() as 'monday'|'tuesday'|'wednesday'|'thursday'|'friday'] ?? '—'
                        return (
                          <td key={d} className={`px-3 py-2.5 border border-rule text-center ${isBreak ? 'text-ink-soft text-xs italic' : 'font-medium'}`}>
                            {val}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
