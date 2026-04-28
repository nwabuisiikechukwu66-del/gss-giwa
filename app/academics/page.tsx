import type { Metadata } from 'next'
import PublicLayout from '@/app/public/layout'
import { PageHero, Tag } from '@/components/ui'

export const metadata: Metadata = { title: 'Academics' }

export default function AcademicsPage() {
  return (
    <PublicLayout>
      <PageHero
        tag="Academics"
        title="Curriculum & Academic Programmes"
        sub="A well-structured curriculum covering Sciences, Arts, and Commercial studies."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Academics' }]}
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* JSS */}
            <div>
              <Tag>Junior Secondary</Tag>
              <h2 className="font-serif font-semibold text-3xl mt-3 mb-4">JSS 1 — JSS 3</h2>
              <p className="text-[14.5px] text-ink-soft leading-relaxed mb-5">
                The Junior Secondary programme runs three years and covers a broad curriculum giving students a solid foundation across all subject areas before senior school specialisation.
              </p>
              <div className="flex flex-wrap gap-2">
                {['English Language','Mathematics','Basic Science','Basic Technology','Social Studies','Civic Education','CRS / IRS','Physical Education','Computer Studies','Fine Arts','Agricultural Science','Home Economics','Yoruba / Hausa / Igbo'].map(s => (
                  <span key={s} className="bg-green-light border border-rule-dark rounded-sm px-2.5 py-1 text-xs font-mono">{s}</span>
                ))}
              </div>
            </div>

            {/* SS */}
            <div>
              <Tag>Senior Secondary</Tag>
              <h2 className="font-serif font-semibold text-3xl mt-3 mb-4">SS 1 — SS 3</h2>
              <p className="text-[14.5px] text-ink-soft leading-relaxed mb-5">
                Students choose from three main streams: Science, Arts, or Commercial. Each stream prepares them thoroughly for WAEC and NECO examinations.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  ['Science Stream', 'Mathematics, Physics, Chemistry, Biology, Further Maths, Agricultural Science'],
                  ['Arts Stream', 'Literature in English, Government, History, CRS/IRS, Yoruba, French'],
                  ['Commercial Stream', 'Economics, Financial Accounting, Commerce, Business Studies, Data Processing'],
                  ['Core (All Streams)', 'English Language, Civic Education, Physical Education'],
                ].map(([stream, subs]) => (
                  <div key={stream} className="bg-white border border-rule rounded p-4">
                    <div className="font-semibold text-sm text-green-dark mb-1">{stream}</div>
                    <div className="text-[13px] text-ink-soft">{subs}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-rule mb-16" />

          {/* Exams */}
          <div className="text-center mb-10">
            <Tag>Examinations</Tag>
            <h2 className="font-serif font-semibold text-3xl mt-3 mb-2">External Examinations</h2>
            <p className="text-ink-soft text-[15px] max-w-lg mx-auto">GSS Jiwa prepares and registers students for the following national examinations.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {[
              ['WAEC', 'West African Senior School Certificate', 'Primary external exam for SS3 students. Results accepted by Nigerian and West African tertiary institutions.'],
              ['NECO', 'National Examinations Council', 'Conducted by NECO, offering an additional certification pathway alongside WAEC.'],
              ['BECE', 'Basic Education Certificate', 'Taken by JSS3 students on completing the junior secondary programme, administered by NECO.'],
            ].map(([code, name, desc]) => (
              <div key={code} className="bg-white border border-rule rounded p-7">
                <div className="font-serif font-semibold text-4xl text-green mb-1">{code}</div>
                <div className="font-semibold text-sm mb-3">{name}</div>
                <div className="text-[13.5px] text-ink-soft leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>

          {/* Grading */}
          <div className="bg-green-pale border border-rule-dark rounded p-7">
            <h3 className="font-serif font-semibold text-xl mb-4">Grading Scale</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                ['A1', '75 – 100', 'Excellent'],
                ['B2', '70 – 74', 'Very Good'],
                ['B3', '65 – 69', 'Good'],
                ['C4–C6', '50 – 64', 'Credit'],
                ['F9', '0 – 49', 'Fail'],
              ].map(([grade, range, remark]) => (
                <div key={grade} className="bg-white border border-rule rounded p-3 text-center">
                  <div className="font-serif font-bold text-2xl text-green">{grade}</div>
                  <div className="font-mono text-[11px] text-ink-soft mt-1">{range}</div>
                  <div className="text-xs text-ink-mid font-medium mt-0.5">{remark}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
