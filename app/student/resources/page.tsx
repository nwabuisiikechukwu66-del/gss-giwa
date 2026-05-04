'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Badge, Alert } from '@/components/ui'
import { Search, Download, FileText, Filter, BookOpen } from 'lucide-react'

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

export default function StudentResourcesPage() {
  const supabase = createClient()
  const [resources, setResources] = useState<Resource[]>([])
  const [filtered, setFiltered] = useState<Resource[]>([])
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [loading, setLoading] = useState(true)

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
      resources.filter(r => {
        const matchesQuery = r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
        const matchesCat = catFilter === 'All' || r.category === catFilter
        return matchesQuery && matchesCat
      })
    )
  }, [query, catFilter, resources])

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))]

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4 flex items-center justify-between">
        <div className="font-serif font-semibold text-xl">Learning Resources</div>
      </div>

      <div className="p-4 md:p-8 bg-green-pale flex-1">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
          {/* Search */}
          <div className="bg-white border border-rule rounded px-4 py-2 flex items-center gap-3">
            <Search size={18} className="text-ink-soft flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search past questions, notes, or files…"
              className="flex-1 text-sm outline-none bg-transparent py-1"
            />
          </div>
          {/* Category Filter */}
          <div className="bg-white border border-rule rounded px-3 py-2 flex items-center gap-2">
            <Filter size={16} className="text-ink-soft flex-shrink-0" />
            <select 
              value={catFilter} 
              onChange={e => setCatFilter(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-ink-soft">Loading resources…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 bg-white border border-dashed border-rule rounded text-center">
            <BookOpen className="mx-auto mb-3 text-rule-dark" size={32} />
            <div className="text-ink-soft font-medium">No resources found</div>
            <div className="text-xs text-ink-soft mt-1">Try adjusting your search or filter.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(r => (
              <div key={r.id} className="bg-white border border-rule rounded p-5 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="green">{r.category}</Badge>
                  <span className="text-[10px] font-bold uppercase text-ink-soft border border-rule px-1.5 py-0.5 rounded">{r.file_type}</span>
                </div>
                <h3 className="font-serif font-semibold text-[17px] mb-2 leading-snug">{r.title}</h3>
                <p className="text-[13px] text-ink-soft mb-5 flex-1 leading-relaxed">{r.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-rule mt-auto">
                  <div className="text-[11px] text-ink-soft font-mono">
                    {r.class && <span>{r.class} · </span>}
                    {new Date(r.created_at).toLocaleDateString('en-GB')}
                  </div>
                  <a 
                    href={r.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-green text-white px-3.5 py-1.5 rounded text-[13px] font-medium hover:bg-green-dark transition-all"
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
