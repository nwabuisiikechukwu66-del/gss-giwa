'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge, Button, Modal, Alert } from '@/components/ui'
import { Plus, Search, Trash2, RefreshCw } from 'lucide-react'

type Staff = {
  id: string
  full_name: string
  role: string
  department: string
  phone: string
  email: string
  status: string
  created_at: string
}

const DEPARTMENTS = [
  'Administration', 'Sciences', 'Arts & Languages',
  'Social Sciences', 'Commercial', 'Technical', 'Non-Teaching',
]

const EMPTY_FORM = {
  full_name: '', role: '', department: 'Sciences',
  phone: '', email: '', status: 'Active',
}

export default function StaffPage() {
  const supabase = createClient()
  const [staff, setStaff] = useState<Staff[]>([])
  const [filtered, setFiltered] = useState<Staff[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('staff').select('*').order('full_name')
    setStaff(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(staff.filter(s =>
      s.full_name?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    ))
  }, [query, staff])

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.role) {
      setAlert({ type: 'error', msg: 'Full name and role are required.' }); return
    }
    setSaving(true); setAlert(null)

    const { error } = await supabase.from('staff').insert({
      full_name: form.full_name.trim(),
      role: form.role.trim(),
      department: form.department,
      phone: form.phone || null,
      email: form.email || null,
      status: form.status,
    })

    if (error) { setAlert({ type: 'error', msg: error.message }); setSaving(false); return }

    setAlert({ type: 'success', msg: `${form.full_name} added to staff directory.` })
    setForm(EMPTY_FORM)
    setAddOpen(false)
    fetchStaff()
    setSaving(false)
  }

  async function handleDelete(s: Staff) {
    if (!confirm(`Remove ${s.full_name} from staff directory?`)) return
    await supabase.from('staff').delete().eq('id', s.id)
    fetchStaff()
  }

  const deptGroups = DEPARTMENTS.map(dept => ({
    dept,
    members: filtered.filter(s => s.department === dept),
  })).filter(g => g.members.length > 0)

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="font-serif font-semibold text-xl">Staff Directory</div>
        <div className="flex gap-2">
          <button onClick={fetchStaff} className="p-2 text-ink-soft hover:text-ink" title="Refresh"><RefreshCw size={16} /></button>
          <Button onClick={() => { setAddOpen(true); setAlert(null) }}><Plus size={15} /> Add Staff</Button>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        {alert && <div className="mb-5"><Alert variant={alert.type}>{alert.msg}</Alert></div>}

        {/* Search */}
        <div className="bg-white border border-rule rounded mb-6">
          <div className="p-3 border-b border-rule flex items-center gap-3">
            <Search size={16} className="text-ink-soft flex-shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, role, or department…"
              className="flex-1 text-sm outline-none bg-transparent" />
            <span className="font-mono text-[11px] text-ink-soft">{filtered.length} staff</span>
          </div>
        </div>

        {loading ? (
          <div className="text-ink-soft text-sm">Loading staff…</div>
        ) : filtered.length === 0 ? (
          <div className="text-ink-soft text-sm">No staff members found.</div>
        ) : query ? (
          /* Flat table when searching */
          <div className="bg-white border border-rule rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {['Name', 'Role', 'Department', 'Phone', 'Status', ''].map(h => (
                      <th key={h} className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-4 py-3 border-b border-rule bg-green-pale">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-green-pale border-b border-rule last:border-0">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{s.full_name}</td>
                      <td className="px-4 py-3 text-ink-mid">{s.role}</td>
                      <td className="px-4 py-3 text-ink-soft">{s.department}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-ink-soft">{s.phone ?? '—'}</td>
                      <td className="px-4 py-3"><Badge variant={s.status === 'Active' ? 'green' : 'gray'}>{s.status}</Badge></td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(s)} className="p-1.5 text-ink-soft hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grouped by department */
          <div className="flex flex-col gap-6">
            {deptGroups.map(({ dept, members }) => (
              <div key={dept} className="bg-white border border-rule rounded overflow-hidden">
                <div className="px-5 py-3 border-b border-rule bg-green-pale flex justify-between items-center">
                  <div className="font-mono text-[11px] tracking-widest uppercase text-ink-soft">{dept}</div>
                  <div className="font-mono text-[11px] text-ink-soft">{members.length} member{members.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {['#', 'Name', 'Role', 'Phone', 'Email', 'Status', ''].map(h => (
                          <th key={h} className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-4 py-2.5 border-b border-rule">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-green-pale border-b border-rule last:border-0">
                          <td className="px-4 py-2.5 font-mono text-[11px] text-ink-soft">{String(idx + 1).padStart(2, '0')}</td>
                          <td className="px-4 py-2.5 font-medium whitespace-nowrap">{s.full_name}</td>
                          <td className="px-4 py-2.5 text-ink-mid">{s.role}</td>
                          <td className="px-4 py-2.5 font-mono text-[12px] text-ink-soft">{s.phone ?? '—'}</td>
                          <td className="px-4 py-2.5 text-ink-soft text-xs">{s.email ?? '—'}</td>
                          <td className="px-4 py-2.5"><Badge variant={s.status === 'Active' ? 'green' : 'gray'}>{s.status}</Badge></td>
                          <td className="px-4 py-2.5">
                            <button onClick={() => handleDelete(s)} className="p-1.5 text-ink-soft hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD STAFF MODAL */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Staff Member" sub="Add a new staff member to the school directory.">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Full Name *</label>
            <input value={form.full_name} onChange={e => upd('full_name', e.target.value)} placeholder="e.g. Mrs. Ngozi Achebe" required
              className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Role / Position *</label>
            <input value={form.role} onChange={e => upd('role', e.target.value)} placeholder="e.g. Mathematics Teacher" required
              className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Department</label>
              <select value={form.department} onChange={e => upd('department', e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none bg-white">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Status</label>
              <select value={form.status} onChange={e => upd('status', e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none bg-white">
                <option>Active</option><option>On Leave</option><option>Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="080XXXXXXXX"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="staff@gssjiwa.edu.ng"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add Staff Member'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
