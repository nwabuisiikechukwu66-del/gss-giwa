import type { Metadata } from 'next'
import PublicLayout from '@/app/public/layout'
import { PageHero, Tag } from '@/components/ui'

export const metadata: Metadata = { title: 'About Us' }

export default function AboutPage() {
  return (
    <PublicLayout>
      <PageHero
        tag="About Us"
        title="Government Secondary School, Jiwa"
        sub="Educating and empowering the youth of FCT Abuja since 1980."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-14">
            {/* Main content */}
            <div>
              <h2 className="font-serif font-semibold text-3xl mb-5">Our History</h2>
              <p className="text-[15px] text-ink-soft leading-relaxed mb-4">
                Government Secondary School Jiwa was established in 1980 by the Federal Capital Territory Administration to provide quality secondary education to the growing population of Jiwa and its environs. From modest beginnings with just a handful of classrooms and teachers, the school has grown into a thriving institution with over 1,200 students and 48 dedicated staff.
              </p>
              <p className="text-[15px] text-ink-soft leading-relaxed mb-4">
                Over the decades, GSS Jiwa has produced graduates who have gone on to excel in medicine, law, engineering, education, the military, and public service. Our alumni are found in every sector of Nigerian life, a testament to the quality of foundation laid within these walls.
              </p>
              <p className="text-[15px] text-ink-soft leading-relaxed mb-10">
                The school offers both Junior Secondary School (JSS1–JSS3) and Senior Secondary School (SS1–SS3) education, with a rigorous curriculum aligned to national standards set by the Federal Ministry of Education and examined by WAEC and NECO.
              </p>

              <h2 className="font-serif font-semibold text-2xl mb-5">School Leadership</h2>
              <div className="bg-green-pale border border-rule-dark rounded p-5 mb-4">
                <div className="font-serif font-semibold text-xl mb-1">Mr. Adewale Ogundimu</div>
                <div className="font-mono text-[11px] tracking-widest uppercase text-green mb-3">Principal</div>
                <p className="text-[14px] text-ink-soft leading-relaxed">
                  Mr. Ogundimu has led the school with distinction for over seven years, overseeing significant improvements in academic performance, infrastructure, and student welfare.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ['Mrs. Ngozi Achebe', 'VP — Academics'],
                  ['Mr. Kabiru Lawal', 'VP — Administration'],
                ].map(([name, role]) => (
                  <div key={name} className="bg-white border border-rule rounded p-4">
                    <div className="font-serif font-semibold text-[17px] mb-0.5">{name}</div>
                    <div className="font-mono text-[10px] tracking-widest uppercase text-green">{role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar facts */}
            <div>
              <div className="bg-green-dark text-white rounded p-6 mb-5">
                <div className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-4">School at a Glance</div>
                {[
                  ['Year Founded', '1980'],
                  ['Location', 'Jiwa, FCT Abuja'],
                  ['School Type', 'Co-educational'],
                  ['Levels', 'JSS1 – SS3'],
                  ['Students', '1,200+'],
                  ['Teaching Staff', '48'],
                  ['Exam Bodies', 'WAEC, NECO'],
                  ['Language', 'English'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 border-b border-white/10 text-[13.5px]">
                    <span className="text-white/50">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-green-light border border-rule-dark rounded p-6 text-center">
                <div className="font-serif font-medium text-xl italic text-green-dark leading-snug">&ldquo;Education for Self Reliance&rdquo;</div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mt-3">School Motto</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-14 bg-green-pale border-t border-rule">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Tag>Achievements</Tag>
          <h2 className="font-serif font-semibold text-3xl mt-3 mb-10">Why GSS Jiwa</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              ['94%', 'WAEC Pass Rate', '2024 results showing outstanding student performance.'],
              ['1,200+', 'Students', 'A vibrant student community from across FCT.'],
              ['40+ Years', 'Of Service', 'Decades of consistent educational excellence in Jiwa.'],
            ].map(([n, t, d]) => (
              <div key={t} className="bg-white border border-rule rounded p-8">
                <div className="font-serif font-semibold text-5xl text-green mb-2">{n}</div>
                <div className="font-semibold text-base mb-2">{t}</div>
                <div className="text-sm text-ink-soft">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
