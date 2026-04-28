import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-ink text-white pt-14 pb-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-serif text-xl font-semibold mb-3">Govt. Secondary School, Jiwa</div>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Providing quality secondary education to the youth of Jiwa and FCT Abuja since 1980. Committed to excellence, character, and self-reliance.
            </p>
            <p className="font-serif italic text-white/30 text-sm">&ldquo;Education for Self Reliance&rdquo;</p>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-white/35 mb-4">Navigation</div>
            <ul className="flex flex-col gap-2.5">
              {[['/', 'Home'], ['/about', 'About Us'], ['/academics', 'Academics'], ['/news', 'News & Notices'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-white/35 mb-4">Portal Access</div>
            <ul className="flex flex-col gap-2.5">
              {[['/login', 'Student Portal'], ['/admin/login', 'Admin Dashboard']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-white/35 mb-4">Contact</div>
            <ul className="flex flex-col gap-2.5 text-sm text-white/55">
              <li>Jiwa, FCT Abuja, Nigeria</li>
              <li><a href="tel:+2348000000000" className="hover:text-white transition-colors">+234 800 000 0000</a></li>
              <li><a href="mailto:info@gssjiwa.edu.ng" className="hover:text-white transition-colors">info@gssjiwa.edu.ng</a></li>
              <li><a href="mailto:admissions@gssjiwa.edu.ng" className="hover:text-white transition-colors">admissions@gssjiwa.edu.ng</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.08] py-5 flex justify-between items-center flex-wrap gap-2 text-[12px] text-white/30">
          <span>&copy; {new Date().getFullYear()} Government Secondary School, Jiwa. All rights reserved.</span>
          <span>FCT Abuja, Nigeria</span>
        </div>
      </div>
    </footer>
  )
}
