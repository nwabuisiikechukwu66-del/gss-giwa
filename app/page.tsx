import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/app/public/layout'
import { Tag, NoticeCard } from '@/components/ui'

export const metadata: Metadata = { title: 'Home' }

const NOTICES = [
  { type: 'Academic', title: '3rd Term Examination Timetable Released', body: 'Examinations commence 10th June 2025. Collect timetables from your class teachers.', date: '12 May 2025' },
  { type: 'General', title: 'PTA Meeting — Saturday 24th May 2025', body: 'All parents and guardians are invited to the PTA meeting at 10:00 AM in the school hall.', date: '8 May 2025' },
  { type: 'Sports', title: 'Inter-House Sports Day — 30th May 2025', body: 'House captains submit team lists to the sports master by 20th May 2025.', date: '5 May 2025' },
]

export default function HomePage() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="bg-green-dark text-white py-20 lg:py-28 relative overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, white 39px, white 40px)',
        }} />
        {/* Decorative circle */}
        <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full border-[80px] border-white/[0.04] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-[1fr_200px] gap-12 items-center">
            <div>
              <Tag>Est. 1980 — Jiwa, FCT Abuja</Tag>
              <h1 className="font-serif font-semibold tracking-tight leading-[1.1] text-4xl sm:text-5xl lg:text-6xl mt-4 mb-5">
                Shaping <em className="italic text-white/65">Minds,</em><br />
                Building <em className="italic text-white/65">Futures</em>
              </h1>
              <p className="text-white/72 text-base leading-relaxed max-w-lg mb-8">
                Government Secondary School Jiwa is committed to academic excellence, character development, 
                and equipping students for a life of self-reliance and national service.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/about" className="bg-white text-green-dark font-semibold px-6 py-3 rounded text-sm hover:bg-green-light transition-all">
                  Learn About Us
                </Link>
                <Link href="/login" className="border border-white/40 text-white/90 px-6 py-3 rounded text-sm hover:bg-white/10 transition-all">
                  Student Portal
                </Link>
              </div>
              <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-white/10">
                {[['1,200+','Students Enrolled'],['48','Teaching Staff'],['18','Classrooms'],['40+','Years of Service']].map(([n,l]) => (
                  <div key={l}>
                    <span className="font-serif font-semibold text-2xl block">{n}</span>
                    <span className="text-xs text-white/50">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WAEC badge */}
            <div className="hidden lg:block bg-white/[0.07] border border-white/15 rounded p-6 text-center">
              <span className="font-serif font-semibold text-5xl block">2024</span>
              <span className="font-mono text-[10px] tracking-widest uppercase text-white/50 block mt-1">WAEC</span>
              <div className="mt-4 pt-4 border-t border-white/15">
                <span className="font-serif font-semibold text-3xl block">94%</span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-white/50">Pass Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-green border-y border-green-dark overflow-hidden py-3">
        <div className="flex animate-marquee gap-0 w-max">
          {[...Array(2)].map((_, di) =>
            ['3rd Term Examinations — 10th June 2025','PTA Meeting — 24th May 2025','Inter-House Sports Day — 30th May 2025','WAEC Registration: SS3 Students Report to Exam Office','2nd Term Results Now on Student Portal'].map((t) => (
              <span key={`${di}-${t}`} className="whitespace-nowrap font-mono text-[13px] text-white/90 tracking-widest px-10 before:content-['◆'] before:mr-8 before:text-white/30">
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* QUICK ACCESS */}
      <section className="py-16 bg-green-pale border-b border-rule">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <Tag>Quick Access</Tag>
            <h2 className="font-serif font-semibold text-3xl mt-3 mb-2">Everything You Need</h2>
            <p className="text-ink-soft text-[15px]">Access your portal, results, notices, and more.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { href: '/login', icon: '👤', title: 'Student Portal', desc: 'Check results, timetables, and notices with your registration number.' },
              { href: '/news', icon: '📋', title: 'News & Notices', desc: 'Stay up to date with school announcements and events.' },
              { href: '/academics', icon: '📚', title: 'Academics', desc: 'Explore our curriculum, subjects, and academic programmes.' },
              { href: '/contact', icon: '📞', title: 'Contact Us', desc: 'Reach the school administration or send us a message.' },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="bg-white border border-rule rounded p-6 text-center hover:border-green hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl mb-3">{c.icon}</div>
                <div className="font-serif font-semibold text-[17px] mb-2">{c.title}</div>
                <div className="text-sm text-ink-soft leading-relaxed">{c.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <Tag>Who We Are</Tag>
              <h2 className="font-serif font-semibold text-3xl lg:text-4xl tracking-tight mt-3 mb-4">
                A Legacy of <em className="italic text-green">Excellence</em> in Jiwa
              </h2>
              <p className="text-ink-soft text-[15px] leading-relaxed mb-4">
                Founded in 1980, Government Secondary School Jiwa has stood as a pillar of education in the Federal Capital Territory. 
                With a proud tradition of producing outstanding graduates, we continue to uphold our motto: <em>Education for Self Reliance.</em>
              </p>
              <p className="text-ink-soft text-[15px] leading-relaxed mb-6">
                We offer Junior and Senior Secondary education across Science, Arts, and Commercial streams — preparing students for WAEC, NECO, and tertiary institutions nationwide.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 bg-green text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-green-dark transition-all">
                Read More About Us
              </Link>
            </div>
            <div className="bg-green-light border border-rule-dark rounded p-8">
              <div className="font-serif text-xl font-semibold text-green-dark mb-5 leading-snug">&ldquo;Education for Self Reliance&rdquo;</div>
              <div className="flex flex-col gap-4">
                {[
                  ['Vision', 'To be the leading secondary school in the FCT, producing well-rounded, self-reliant graduates.'],
                  ['Mission', 'To provide quality education that develops the intellectual, moral, and physical potential of every student.'],
                  ['Core Values', 'Discipline, Integrity, Excellence, Service, and Community.'],
                ].map(([t, d]) => (
                  <div key={t} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm mb-0.5">{t}</div>
                      <div className="text-[13.5px] text-ink-soft">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST NEWS */}
      <section className="py-16 bg-green-pale border-y border-rule">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
            <div>
              <Tag>Latest</Tag>
              <h2 className="font-serif font-semibold text-3xl mt-3">News &amp; Announcements</h2>
            </div>
            <Link href="/news" className="text-sm border border-green text-green px-4 py-2 rounded hover:bg-green hover:text-white transition-all">
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {NOTICES.map((n) => <NoticeCard key={n.title} {...n} />)}
          </div>
        </div>
      </section>

      {/* STUDENT PORTAL CTA */}
      <section className="py-20 bg-green-dark text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <Tag>Student Access</Tag>
          <h2 className="font-serif font-semibold text-3xl lg:text-4xl tracking-tight mt-4 mb-3">Access Your Student Portal</h2>
          <p className="text-white/65 text-[15px] max-w-lg mx-auto mb-8 leading-relaxed">
            Check results, view timetables, read school notices, and manage your profile — all with your registration number.
          </p>
          <Link href="/login" className="inline-block bg-white text-green-dark font-semibold px-8 py-3.5 rounded text-sm hover:bg-green-light transition-all">
            Login to Student Portal
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
