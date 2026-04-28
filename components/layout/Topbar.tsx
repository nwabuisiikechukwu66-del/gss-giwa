export default function Topbar() {
  return (
    <div className="bg-green-dark text-white/80 text-xs py-2 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center flex-wrap gap-2">
        <span>Government Secondary School, Jiwa &nbsp;·&nbsp; Jiwa, FCT Abuja, Nigeria</span>
        <div className="flex gap-5">
          <a href="tel:+2348000000000" className="hover:text-white transition-colors">+234 800 000 0000</a>
          <a href="mailto:info@gssjiwa.edu.ng" className="hover:text-white transition-colors">info@gssjiwa.edu.ng</a>
        </div>
      </div>
    </div>
  )
}
