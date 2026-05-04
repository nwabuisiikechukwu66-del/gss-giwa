'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge, Button, Modal, Alert } from '@/components/ui'
import { Plus, Search, Trash2, Download, FileText, RefreshCw, Upload } from 'lucide-react'
import { addResource, deleteResource } from '@/app/actions/resources'

type Resource = {
  id: string
  title: string
  description: string
  file_url: string
  file_type: string
  category: string
  class: string
  created_at: string
}

const CATEGORIES = ['Past Questions', 'Lesson Notes', 'Syllabus', 'General', 'Assignment']
const CLASSES = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3', 'General']

const EMPTY_FORM = {
  title: '', description: '', category: 'Past Questions', className: 'General',
}

export default function AdminResourcesPage() {
  const supabase = createClient()
  const [resources, setResources] = useState<Resource[]>([])
  const [filtered, setFiltered] = useState<Resource[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
    setResources(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchResources() }, [fetchResources])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(
      resources.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.class?.toLowerCase().includes(q)
      )
    )
  }, [query, resources])

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !file) {
      setAlert({ type: 'error', msg: 'Title and file are required.' })
      return
    }

    setSaving(true)
    setAlert(null)

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath)

      // 2. Save to DB
      const { data: { user } } = await supabase.auth.getUser()
      const result = await addResource({
        ...form,
        file_url: publicUrl,
        file_type: fileExt || 'unknown',
        userId: user!.id
      })

      if (result.error) throw new Error(result.error)

      setAlert({ type: 'success', msg: 'Resource uploaded successfully.' })
      setForm(EMPTY_FORM)
      setFile(null)
      setAddOpen(false)
      fetchResources()
    } catch (err: any) {
      setAlert({ type: 'error', msg: err.message || 'Failed to upload resource.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this resource?')) return
    const result = await deleteResource(id)
    if (result.success) fetchResources()
    else setAlert({ type: 'error', msg: result.error || 'Failed to delete.' })
  }

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="font-serif font-semibold text-xl">School Resources</div>
        <div className="flex gap-2">
          <button onClick={fetchResources} className="p-2 text-ink-soft hover:text-ink transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <Button onClick={() => { setAddOpen(true); setAlert(null) }}>
            <Upload size={15} /> Upload Resource
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
          <div className="p-4 border-b border-rule flex items-center gap-3">
            <Search size={16} className="text-ink-soft flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search resources by title, category, or class…"
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <span className="font-mono text-[11px] text-ink-soft">{filtered.length} files</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Title', 'Category', 'Class', 'Type', 'Uploaded', 'Actions'].map(h => (
                    <th key={h} className="font-mono text-[10px] tracking-widest uppercase text-ink-soft text-left px-4 py-3 border-b border-rule bg-green-pale whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-soft text-sm">Loading resources…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-soft text-sm">No resources found.</td></tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} className="hover:bg-green-pale border-b border-rule last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{r.title}</div>
                        <div className="text-[11px] text-ink-soft truncate max-w-[200px]">{r.description}</div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="green">{r.category}</Badge></td>
                      <td className="px-4 py-3 text-ink-soft">{r.class}</td>
                      <td className="px-4 py-3 uppercase text-[10px] font-bold text-ink-soft">{r.file_type}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a href={r.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-ink-soft hover:text-green transition-colors">
                            <Download size={15} />
                          </a>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-ink-soft hover:text-red-600 transition-colors">
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Upload Resource" sub="Files will be accessible to students on their portal.">
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Resource Title *</label>
            <input value={form.title} onChange={e => upd('title', e.target.value)} placeholder="e.g. Mathematics Past Questions 2023" required
              className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => upd('description', e.target.value)} placeholder="Brief details about the file…" rows={3}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Category</label>
              <select value={form.category} onChange={e => upd('category', e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all bg-white">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Target Class</label>
              <select value={form.className} onChange={e => upd('className', e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded text-sm focus:border-green outline-none transition-all bg-white">
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Select File *</label>
            <div className="relative border-2 border-dashed border-rule-dark rounded p-8 text-center hover:bg-green-pale transition-colors cursor-pointer group">
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center">
                <FileText className={`mb-2 ${file ? 'text-green' : 'text-ink-soft'}`} size={24} />
                <div className="text-sm font-medium">{file ? file.name : 'Click to select or drag and drop'}</div>
                <div className="text-xs text-ink-soft mt-1">PDF, DOCX, JPG or PNG (Max 10MB)</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Uploading…' : 'Save Resource'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
