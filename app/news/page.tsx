import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import PublicLayout from '@/app/public/layout'
import { PageHero, Tag, NoticeCard } from '@/components/ui'
import Link from 'next/link'

export const metadata: Metadata = { title: 'News & Notices' }
export const revalidate = 60

export default async function NewsPage() {
  const supabase = createServerSupabase()
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  const items = notices ?? []

  return (
    <PublicLayout>
      <PageHero
        tag="News"
        title="News &amp; Announcements"
        sub="Stay informed with the latest updates from Government Secondary School Jiwa."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'News' }]}
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">
            <div>
              <div className="font-serif font-semibold text-2xl mb-6">All Announcements</div>
              {items.length === 0 ? (
                <div className="text-ink-soft text-sm py-10 text-center">No announcements at this time. Check back soon.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((n: { id: string; type: string; title: string; body: string; created_at: string }) => (
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

            {/* Sidebar */}
            <div>
              <div className="sticky top-24">
                <div className="bg-green-dark text-white rounded p-5 mb-5">
                  <div className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-3">Recent Announcements</div>
                  {items.slice(0, 4).map((n: { id: string; title: string; created_at: string }) => (
                    <div key={n.id} className="flex justify-between py-2.5 border-b border-white/10 text-[13px] gap-4">
                      <span className="text-white/75 truncate">{n.title}</span>
                      <span className="font-mono text-[11px] text-white/40 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-white/30 text-xs py-2">No announcements.</div>}
                </div>
                <div className="bg-green-light border border-rule-dark rounded p-5 text-center">
                  <div className="font-serif font-semibold text-[17px] mb-2">Student Portal</div>
                  <div className="text-[13.5px] text-ink-soft mb-4">Access results, timetables, and notices.</div>
                  <Link href="/login" className="block w-full bg-green text-white text-sm font-medium py-2.5 rounded hover:bg-green-dark transition-all text-center">
                    Login Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
