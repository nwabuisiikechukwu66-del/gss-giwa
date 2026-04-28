'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge, Button, Modal, Alert, GradeBadge } from '@/components/ui'
import { Plus, Search, Eye, Trash2, RefreshCw, Printer } from 'lucide-react'

type StudentOption = { id: string; full_name: string; reg_number: string; class: string }
type Subject = { id?: string; subject_name: string; ca_score: number; exam_score: number; total: number }
type Result = {
  id: string
  student_id: string
  term: string
  session: string
  class: string
  position: string
  total_students: number
  principal_remark: string
  class_teacher_remark: string
  created_at: string
  profiles?: { full_name: string; reg_number: string }
  result_subjects?: Subject[]
}

const TERMS = ['First Term', 'Second Term', 'Third Term']
const DEFAULT_SUBJECTS = [
  'English Language', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Economics', 'Geography', 'Civic Education',
]

function calcTotal(ca: number, exam: number) {
  return Math.min(Number(ca || 0) + Number(exam || 0), 100)
}
function gradeFromTotal(t: number) {
  if (t >= 75) return 'A'
  if (t >= 60) return 'B'
  if (t >= 50) return 'C'
  if (t >= 40) return 'D'
  return 'F'
}
function remarkFromGrade(g: string) {
  return g === 'A' ? 'Excellent' : g === 'B' ? 'Good' : g === 'C' ? 'Fair' : g === 'D' ? 'Pass' : 'Fail'
}

export default function ResultsPage() {
  const supabase = createClient()
  const [results, setResults] = useState<Result[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [filtered, setFiltered] = useState<Result[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [viewResult, setViewResult] = useState<Result | null>(null)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [selectedStudent, setSelectedStudent] = useState('')
  const [term, setTerm] = useState('Second Term')
  const [session, setSession] = useState('2024/2025')
  const [position, setPosition] = useState('')
  const [totalStudents, setTotalStudents] = useState('')
  const [principalRemark, setPrincipalRemark] = useState('')
  const [teacherRemark, setTeacherRemark] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>(
    DEFAULT_SUBJECTS.map(n => ({ subject_name: n, ca_score: 0, exam_score: 0, total: 0 }))
  )

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: r }, { data: s }] = await Promise.all([
      supabase.from('results').select('*, profiles(full_name, reg_number), result_subjects(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, reg_number, class').eq('role', 'student').order('full_name'),
    ])
    setResults(r ?? [])
    setFiltered(r ?? [])
    setStudents(s ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(results.filter(r =>
      r.profiles?.full_name?.toLowerCase().includes(q) ||
      r.profiles?.reg_number?.toLowerCase().includes(q) ||
      r.term?.toLowerCase().includes(q) ||
      r.class?.toLowerCase().includes(q)
    ))
  }, [query, results])

  function updateSubject(idx: number, field: 'subject_name' | 'ca_score' | 'exam_score', val: string) {
    setSubjects(prev => prev.map((s, i) => {
      if (i !== idx) return s
      const updated = { ...s, [field]: field === 'subject_name' ? val : Number(val) }
      updated.total = calcTotal(
        field === 'ca_score' ? Number(val) : updated.ca_score,
        field === 'exam_score' ? Number(val) : updated.exam_score,
      )
      return updated
    }))
  }

  function addSubjectRow() {
    setSubjects(prev => [...prev, { subject_name: '', ca_score: 0, exam_score: 0, total: 0 }])
  }

  function removeSubjectRow(idx: number) {
    setSubjects(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudent) { setAlert({ type: 'error', msg: 'Please select a student.' }); return }
    if (subjects.some(s => !s.subject_name)) { setAlert({ type: 'error', msg: 'All subject names must be filled.' }); return }
    setSaving(true); setAlert(null)

    const student = students.find(s => s.id === selectedStudent)

    const { data: resultRow, error: rErr } = await supabase
      .from('results')
      .insert({
        student_id: selectedStudent,
        term,
        session,
        class: student?.class ?? '',
        position: position || null,
        total_students: totalStudents ? Number(totalStudents) : null,
        principal_remark: principalRemark || null,
        class_teacher_remark: teacherRemark || null,
      })
      .select()
      .single()

    if (rErr || !resultRow) {
      setAlert({ type: 'error', msg: rErr?.message ?? 'Failed to save result.' })
      setSaving(false); return
    }

    const subjectRows = subjects.map(s => ({
      result_id: resultRow.id,
      subject_name: s.subject_name,
      ca_score: s.ca_score,
      exam_score: s.exam_score,
      total: s.total,
      remark: remarkFromGrade(gradeFromTotal(s.total)),
    }))

    const { error: sErr } = await supabase.from('result_subjects').insert(subjectRows)
    if (sErr) { setAlert({ type: 'error', msg: sErr.message }); setSaving(false); return }

    setAlert({ type: 'success', msg: `Result for ${student?.full_name} saved successfully.` })
    setAddOpen(false)
    fetchAll()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this result? This cannot be undone.')) return
    await supabase.from('results').delete().eq('id', id)
    fetchAll()
  }

  function printResult(r: Result) {
    const subjects = r.result_subjects ?? []
    const avg = subjects.length
      ? (subjects.reduce((s, sub) => s + sub.total, 0) / subjects.length).toFixed(1)
      : '—'
    const win = window.open('', '_blank', 'width=900,height=750')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Result — ${r.profiles?.full_name}</title>
    <style>
      body{font-family:Georgia,serif;padding:36px;max-width:820px;margin:0 auto;color:#1a1a18}
      h1{font-size:22px;margin-bottom:4px;text-align:center}
      .sub{text-align:center;font-size:13px;color:#666;margin-bottom:4px}
      .motto{text-align:center;font-style:italic;font-size:13px;color:#999;margin-bottom:24px}
      h2{font-size:16px;border-bottom:2px solid #1a6b3a;color:#1a6b3a;padding-bottom:6px;margin:20px 0 10px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#1a6b3a;color:#fff;padding:8px 10px;text-align:left;font-family:monospace;font-size:11px;letter-spacing:0.06em;text-transform:uppercase}
      td{padding:8px 10px;border-bottom:1px solid #e0e0e0}
      tr:nth-child(even) td{background:#f9f9f7}
      .meta table td{border:none;padding:5px 10px}
      .grade-A{color:#1a6b3a;font-weight:600} .grade-B{color:#b7791f;font-weight:600}
      .grade-C{color:#6b6b64;font-weight:600} .grade-F{color:#c0392b;font-weight:600}
      .footer{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
      .sig{border-top:1px solid #ccc;padding-top:6px;font-size:12px;color:#666;margin-top:40px}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>Government Secondary School, Jiwa</h1>
    <div class="sub">Jiwa District, FCT Abuja, Nigeria</div>
    <div class="motto">Education for Self Reliance</div>
    <h2>${r.term} Academic Result — ${r.session}</h2>
    <div class="meta"><table>
      <tr><td><strong>Name:</strong> ${r.profiles?.full_name}</td><td><strong>Reg. No.:</strong> ${r.profiles?.reg_number}</td></tr>
      <tr><td><strong>Class:</strong> ${r.class}</td><td><strong>Session:</strong> ${r.session}</td></tr>
      <tr><td><strong>Position:</strong> ${r.position ?? '—'} of ${r.total_students ?? '—'}</td><td><strong>Average:</strong> ${avg}/100</td></tr>
    </table></div>
    <h2>Subject Scores</h2>
    <table><thead><tr><th>Subject</th><th>C.A. (30)</th><th>Exam (70)</th><th>Total (100)</th><th>Grade</th><th>Remark</th></tr></thead>
    <tbody>${subjects.map(s => {
      const g = gradeFromTotal(s.total)
      return `<tr><td>${s.subject_name}</td><td>${s.ca_score}</td><td>${s.exam_score}</td><td><strong>${s.total}</strong></td><td class="grade-${g}">${g}</td><td>${remarkFromGrade(g)}</td></tr>`
    }).join('')}
    <tr><td colspan="3"><strong>Average Score</strong></td><td><strong style="font-size:15px;color:#1a6b3a">${avg}</strong></td><td colspan="2"></td></tr>
    </tbody></table>
    ${(r.class_teacher_remark || r.principal_remark) ? `
    <div class="footer">
      ${r.class_teacher_remark ? `<div><div style="font-size:11px;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase;color:#666;margin-bottom:4px">Class Teacher's Remark</div><em>"${r.class_teacher_remark}"</em></div>` : ''}
      ${r.principal_remark ? `<div><div style="font-size:11px;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase;color:#666;margin-bottom:4px">Principal's Remark</div><em>"${r.principal_remark}"</em></div>` : ''}
    </div>` : ''}
    <div style="margin-top:24px;font-size:11px;font-family:monospace;color:#999">
      Grading: A=75–100 (Excellent) · B=60–74 (Good) · C=50–59 (Fair) · D=40–49 (Pass) · F=0–39 (Fail)
    </div>
    <div class="footer" style="margin-top:48px">
      <div class="sig">Class Teacher's Signature &amp; Date</div>
      <div class="sig">Principal's Signature &amp; Date</div>
    </div>
    </body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="font-serif font-semibold text-xl">Results Management</div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 text-ink-soft hover:text-ink" title="Refresh"><RefreshCw size={16} /></button>
          <Button onClick={() => { setAddOpen(true); setAlert(null) }}><Plus size={15} /> Upload Result</Button>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        {alert && <div className="mb-5"><Alert variant={alert.type}>{alert.msg}</Alert></div>}

        <div className="bg-white border border-rule rounded overflow-hidden">
          <div className="p-4 border-b border-rule flex items-center gap-3">
            <Search size={16} className="text-ink-soft flex-shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by student name, reg. number, or term…"
              className="flex-1 text-sm outline-none bg-transparent" />
            <span className="font-mono text-[11px] text-ink-soft">{filtered.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Student', 'Reg. No.', 'Class', 'Term', 'Session', 'Avg Score', 'Position', 'Actions'].map(h => (
                    <th key={h} className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-4 py-3 border-b border-rule bg-green-pale whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-ink-soft text-sm">Loading results…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-ink-soft text-sm">No results uploaded yet.</td></tr>
                ) : filtered.map(r => {
                  const subs = r.result_subjects ?? []
                  const avg = subs.length ? (subs.reduce((s, sub) => s + sub.total, 0) / subs.length).toFixed(1) : '—'
                  return (
                    <tr key={r.id} className="hover:bg-green-pale border-b border-rule last:border-0">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{r.profiles?.full_name ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-[11.5px] text-ink-soft">{r.profiles?.reg_number ?? '—'}</td>
                      <td className="px-4 py-3">{r.class}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.term}</td>
                      <td className="px-4 py-3">{r.session}</td>
                      <td className="px-4 py-3 font-semibold text-green">{avg}</td>
                      <td className="px-4 py-3">{r.position ? `${r.position} / ${r.total_students}` : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setViewResult({ ...r, result_subjects: r.result_subjects })} className="p-1.5 text-ink-soft hover:text-green transition-colors" title="View"><Eye size={15} /></button>
                          <button onClick={() => printResult(r)} className="p-1.5 text-ink-soft hover:text-green transition-colors" title="Print"><Printer size={15} /></button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-ink-soft hover:text-red-600 transition-colors" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD RESULT MODAL */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Upload Student Result" sub="Enter scores for each subject. Totals are calculated automatically.">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Student & meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Student *</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none bg-white">
                <option value="">— Select student —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.reg_number}) — {s.class}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Term</label>
              <select value={term} onChange={e => setTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none bg-white">
                {TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Session</label>
              <input value={session} onChange={e => setSession(e.target.value)} placeholder="2024/2025"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Position in Class</label>
              <input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. 3rd"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Total Students in Class</label>
              <input type="number" value={totalStudents} onChange={e => setTotalStudents(e.target.value)} placeholder="e.g. 38"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none" />
            </div>
          </div>

          {/* Subjects table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[13px] font-medium text-ink-mid">Subject Scores</label>
              <button type="button" onClick={addSubjectRow}
                className="text-xs text-green font-medium hover:underline">+ Add subject</button>
            </div>
            <div className="border border-rule-dark rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-pale">
                    <th className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-3 py-2 border-b border-rule">Subject</th>
                    <th className="font-mono text-[10px] tracking-widest uppercase text-ink-soft px-3 py-2 border-b border-rule w-20">CA /30</th>
                    <th className="font-mono text-[10px] tracking-widest uppercase text-ink-soft px-3 py-2 border-b border-rule w-20">Exam /70</th>
                    <th className="font-mono text-[10px] tracking-widest uppercase text-ink-soft px-3 py-2 border-b border-rule w-16">Total</th>
                    <th className="w-8 border-b border-rule" />
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <tr key={i} className="border-b border-rule last:border-0">
                      <td className="px-2 py-1.5">
                        <input value={s.subject_name} onChange={e => updateSubject(i, 'subject_name', e.target.value)}
                          placeholder="Subject name" className="w-full text-sm outline-none border-0 bg-transparent" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" min="0" max="30" value={s.ca_score || ''} onChange={e => updateSubject(i, 'ca_score', e.target.value)}
                          className="w-full text-sm outline-none text-center border border-rule rounded px-1 py-0.5" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" min="0" max="70" value={s.exam_score || ''} onChange={e => updateSubject(i, 'exam_score', e.target.value)}
                          className="w-full text-sm outline-none text-center border border-rule rounded px-1 py-0.5" />
                      </td>
                      <td className="px-2 py-1.5 text-center font-semibold text-green">{s.total}</td>
                      <td className="px-2 py-1.5 text-center">
                        <button type="button" onClick={() => removeSubjectRow(i)} className="text-ink-soft hover:text-red-600 text-xs">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Class Teacher&apos;s Remark</label>
              <textarea value={teacherRemark} onChange={e => setTeacherRemark(e.target.value)} placeholder="e.g. Excellent performance. Keep it up!"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none resize-none h-20" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Principal&apos;s Remark</label>
              <textarea value={principalRemark} onChange={e => setPrincipalRemark(e.target.value)} placeholder="e.g. A diligent student. Keep it up!"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none resize-none h-20" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-1">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Result'}</Button>
          </div>
        </form>
      </Modal>

      {/* VIEW RESULT MODAL */}
      {viewResult && (
        <Modal open={!!viewResult} onClose={() => setViewResult(null)} title={`${viewResult.term} — ${viewResult.profiles?.full_name}`} sub={`${viewResult.session} · ${viewResult.class}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse mb-4">
              <thead>
                <tr>
                  {['Subject', 'CA', 'Exam', 'Total', 'Grade'].map(h => (
                    <th key={h} className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-3 py-2 border-b-2 border-rule-dark bg-green-pale">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(viewResult.result_subjects ?? []).map((s, i) => (
                  <tr key={i} className="border-b border-rule hover:bg-green-pale">
                    <td className="px-3 py-2 font-medium">{s.subject_name}</td>
                    <td className="px-3 py-2 text-ink-mid">{s.ca_score}</td>
                    <td className="px-3 py-2 text-ink-mid">{s.exam_score}</td>
                    <td className="px-3 py-2 font-semibold">{s.total}</td>
                    <td className="px-3 py-2"><GradeBadge grade={gradeFromTotal(s.total)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setViewResult(null)}>Close</Button>
            <Button onClick={() => printResult(viewResult)}><Printer size={14} /> Print Result</Button>
          </div>
        </Modal>
      )}
    </>
  )
}
