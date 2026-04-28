'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge, Button, Modal, Alert } from '@/components/ui'
import { Plus, Search, Eye, Trash2, RefreshCw } from 'lucide-react'

type Student = {
  id: string
  full_name: string
  reg_number: string
  class: string
  gender: string
  guardian_name: string
  guardian_phone: string
  address: string
  date_of_birth: string
  status: string
  session: string
  created_at: string
}

const CLASSES = [
  'JSS1A','JSS1B','JSS1C',
  'JSS2A','JSS2B','JSS2C',
  'JSS3A','JSS3B','JSS3C',
  'SS1A','SS1B','SS1C',
  'SS2A','SS2B','SS2C',
  'SS3A','SS3B','SS3C',
]

const EMPTY_FORM = {
  full_name: '', reg_number: '', class: 'SS1A', gender: 'Male',
  guardian_name: '', guardian_phone: '', address: '',
  date_of_birth: '', session: '2024/2025', password: '',
}

export default function StudentsPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [filtered, setFiltered] = useState<Student[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [viewStudent, setViewStudent] = useState<Student | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })
    setStudents(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(
      students.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.reg_number?.toLowerCase().includes(q) ||
        s.class?.toLowerCase().includes(q)
      )
    )
  }, [query, students])

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.reg_number || !form.password) {
      setAlert({ type: 'error', msg: 'Full name, registration number, and password are required.' })
      return
    }
    setSaving(true)
    setAlert(null)

    // Create auth user — email is derived from reg_number
    const email = `${form.reg_number.trim().toLowerCase().replace(/\//g, '_')}@gssjiwa.student`
    const { data: authData, error: authError } = await supabase.auth.admin
      ? { data: null, error: { message: 'Use service role on server' } }
      : await (async () => {
          // Fallback: use signUp (works with email confirmation disabled)
          const res = await supabase.auth.signUp({ email, password: form.password })
          return { data: res.data, error: res.error }
        })()

    if (authError && !authData?.user) {
      // Try direct signup
      const { data: sd, error: se } = await supabase.auth.signUp({ email, password: form.password })
      if (se || !sd.user) {
        setAlert({ type: 'error', msg: se?.message ?? 'Failed to create student account.' })
        setSaving(false)
        return
      }
      // Insert profile
      const { error: pe } = await supabase.from('profiles').upsert({
        id: sd.user.id,
        role: 'student',
        full_name: form.full_name.trim(),
        reg_number: form.reg_number.trim().toUpperCase(),
        class: form.class,
        gender: form.gender,
        guardian_name: form.guardian_name,
        guardian_phone: form.guardian_phone,
        address: form.address,
        date_of_birth: form.date_of_birth || null,
        session: form.session,
        status: 'Active',
      })
      if (pe) { setAlert({ type: 'error', msg: pe.message }); setSaving(false); return }
    }

    setAlert({ type: 'success', msg: `Student ${form.full_name} added successfully.` })
    setForm(EMPTY_FORM)
    setAddOpen(false)
    fetchStudents()
    setSaving(false)
  }

  async function handleDelete(student: Student) {
    if (!confirm(`Remove ${student.full_name} (${student.reg_number})? This cannot be undone.`)) return
    await supabase.from('profiles').delete().eq('id', student.id)
    fetchStudents()
  }

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="font-serif font-semibold text-xl">Student Management</div>
        <div className="flex gap-2">
          <button onClick={fetchStudents} className="p-2 text-ink-soft hover:text-ink transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <Button onClick={() => { setAddOpen(true); setAlert(null) }}>
            <Plus size={15} /> Add Student
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        {alert && (
          <div className="mb-5">
            <Alert variant={alert.type}>{alert.msg}</Alert>
          </div>
        )}

        <div className="bg-white border border-rule rounded overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-rule flex items-center gap-3">
            <Search size={16} className="text-ink-soft flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, reg. number or class…"
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <span className="font-mono text-[11px] text-ink-soft">{filtered.length} students</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Reg. No.', 'Full Name', 'Class', 'Gender', 'Guardian', 'Status', 'Actions'].map(h => (
                    <th key={h} className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-4 py-3 border-b border-rule bg-green-pale whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-soft text-sm">Loading students…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-soft text-sm">No students found.</td></tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id} className="hover:bg-green-pale border-b border-rule last:border-0">
                      <td className="px-4 py-3 font-mono text-[11.5px] text-ink-soft whitespace-nowrap">{s.reg_number}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{s.full_name}</td>
                      <td className="px-4 py-3">{s.class}</td>
                      <td className="px-4 py-3">{s.gender}</td>
                      <td className="px-4 py-3 text-ink-soft">{s.guardian_name ?? '—'}</td>
                      <td className="px-4 py-3"><Badge variant="green">{s.status ?? 'Active'}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewStudent(s)}
                            className="p-1.5 text-ink-soft hover:text-green transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-ink-soft hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Student"
        sub="Fill in the student's information. A portal account will be created automatically."
      >
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Full Name *</label>
              <input value={form.full_name} onChange={e => upd('full_name', e.target.value)} placeholder="e.g. Amara Okonkwo" required
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Reg. Number *</label>
              <input value={form.reg_number} onChange={e => upd('reg_number', e.target.value.toUpperCase())} placeholder="GSS/2024/001" required
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all uppercase" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Password *</label>
              <input type="password" value={form.password} onChange={e => upd('password', e.target.value)} placeholder="Student portal password" required
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Class</label>
              <select value={form.class} onChange={e => upd('class', e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all bg-white">
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Gender</label>
              <select value={form.gender} onChange={e => upd('gender', e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all bg-white">
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={e => upd('date_of_birth', e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Session</label>
              <input value={form.session} onChange={e => upd('session', e.target.value)} placeholder="2024/2025"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Guardian Name</label>
              <input value={form.guardian_name} onChange={e => upd('guardian_name', e.target.value)} placeholder="e.g. Mr. Emmanuel Okonkwo"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Guardian Phone</label>
              <input value={form.guardian_phone} onChange={e => upd('guardian_phone', e.target.value)} placeholder="080XXXXXXXX"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Home Address</label>
              <input value={form.address} onChange={e => upd('address', e.target.value)} placeholder="e.g. No. 5 Unity Road, Jiwa"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all" />
            </div>
          </div>

          <div className="bg-green-pale border border-rule-dark rounded p-3 text-[12.5px] text-ink-soft leading-relaxed">
            A student portal account will be created using the registration number and the password you set. The student can log in at <strong>/login</strong>.
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add Student'}</Button>
          </div>
        </form>
      </Modal>

      {/* VIEW STUDENT MODAL */}
      <Modal
        open={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title={viewStudent?.full_name ?? ''}
        sub={viewStudent?.reg_number}
      >
        {viewStudent && (
          <div className="flex flex-col gap-0">
            {[
              ['Registration Number', viewStudent.reg_number],
              ['Class', viewStudent.class],
              ['Gender', viewStudent.gender],
              ['Date of Birth', viewStudent.date_of_birth ? new Date(viewStudent.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
              ['Session', viewStudent.session],
              ['Status', viewStudent.status ?? 'Active'],
              ['Guardian', viewStudent.guardian_name ?? '—'],
              ['Guardian Phone', viewStudent.guardian_phone ?? '—'],
              ['Address', viewStudent.address ?? '—'],
              ['Registered', new Date(viewStudent.created_at).toLocaleDateString('en-GB')],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-rule last:border-0 text-sm">
                <span className="text-ink-soft font-mono text-[11px] tracking-wide uppercase">{k}</span>
                <span className="font-medium text-right ml-4">{v}</span>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setViewStudent(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
