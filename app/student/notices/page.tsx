import { createServerSupabase } from '@/lib/supabase-server'
import { NoticeCard, Alert } from '@/components/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notice Board' }

export default async function NoticesPage() {
  const supabase = createServerSupabase()

  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  const items = notices ?? []

  return (
    <>
      <div className="bg-white border-b border-rule px-6 py-4">
        <div className="font-serif font-semibold text-xl">Notice Board</div>
      </div>
      <div className="p-4 md:p-8 bg-green-pale flex-1">
        {items.length === 0 ? (
          <Alert variant="info">No notices at this time. Check back soon.</Alert>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
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
    </>
  )
}
