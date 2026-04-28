'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge, Button, Modal, Alert } from '@/components/ui'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

type Notice = {
  id: string
  type: string
  title: string
  body: string
  created_at: string
}

const TYPES = ['Academic', 'General', 'Sports', 'Administrative', 'Health', 'Urgent']

export default function NoticesPage() {
  const supabase = createClient()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: 'General', title: '', body: '' })

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false })
    setNotices(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchNotices() }, [fetchNotices])

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.body) { setAlert({ type: 'error', msg: 'Title and body are required.' }); return }
    setSaving(true); setAlert(null)

    const { error } = await supabase.from('notices').insert({
      type: form.type,
      title: form.title.trim(),
      body: form.body.trim(),
    })

    if (error) { setAlert({ type: 'error', msg: error.message }); setSaving(false); return }

    setAlert({ type: 'success', msg: 'Notice posted successfully.' })
    setForm({ type: 'General', title: '', body: '' })
    setAddOpen(false)
    fetchNotices()
    setSaving(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Remove notice: "${title}"?`)) return
    await supabase.from('notices').delete().eq('id', id)
    fetchNotices()
  }

  const typeColor: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
    Academic: 'green', General: 'gray', Sports: 'yellow',
    Administrative: 'gray', Health: 'red', Urgent: 'red',
  }

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="font-serif font-semibold text-xl">Notice Board</div>
        <div className="flex gap-2">
          <button onClick={fetchNotices} className="p-2 text-ink-soft hover:text-ink" title="Refresh"><RefreshCw size={16} /></button>
          <Button onClick={() => { setAddOpen(true); setAlert(null) }}><Plus size={15} /> Post Notice</Button>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        {alert && <div className="mb-5"><Alert variant={alert.type}>{alert.msg}</Alert></div>}

        {loading ? (
          <div className="text-ink-soft text-sm">Loading notices…</div>
        ) : notices.length === 0 ? (
          <div className="text-ink-soft text-sm">No notices posted yet. Use the button above to post the first one.</div>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl">
            {notices.map(n => (
              <div key={n.id} className="bg-white border border-rule border-l-4 border-l-green rounded-r p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={typeColor[n.type] ?? 'gray'}>{n.type}</Badge>
                      <span className="font-mono text-[11px] text-ink-soft">
                        {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="font-serif font-medium text-[17px] mb-1.5">{n.title}</div>
                    <div className="text-sm text-ink-soft leading-relaxed">{n.body}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id, n.title)}
                    className="p-1.5 text-ink-soft hover:text-red-600 transition-colors flex-shrink-0"
                    title="Delete notice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POST NOTICE MODAL */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Post New Notice"
        sub="This notice will immediately appear on the student portal and public news page."
      >
        <form onSubmit={handlePost} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Notice Type</label>
            <select value={form.type} onChange={e => upd('type', e.target.value)}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none bg-white">
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Title *</label>
            <input value={form.title} onChange={e => upd('title', e.target.value)} placeholder="e.g. Third Term Examination Timetable Released"
              required className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Body *</label>
            <textarea value={form.body} onChange={e => upd('body', e.target.value)}
              placeholder="Type the full notice content here…" required rows={5}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none resize-y" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Posting…' : 'Post Notice'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
