// Reusable UI primitives for GSS Jiwa

import { ReactNode } from 'react'

// ---- Badge ----
type BadgeVariant = 'green' | 'red' | 'yellow' | 'gray'
export function Badge({ children, variant = 'green' }: { children: ReactNode; variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    green:  'bg-green-light text-green border border-rule',
    red:    'bg-red-50 text-red-700 border border-red-200',
    yellow: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    gray:   'bg-gray-100 text-gray-600 border border-gray-200',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wide font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}

// ---- Alert ----
type AlertVariant = 'success' | 'error' | 'info'
export function Alert({ children, variant = 'info' }: { children: ReactNode; variant?: AlertVariant }) {
  const styles: Record<AlertVariant, string> = {
    success: 'bg-green-light border border-rule-dark text-green-dark',
    error:   'bg-red-50 border border-red-200 text-red-800',
    info:    'bg-green-pale border border-rule-dark text-green-dark',
  }
  return (
    <div className={`px-4 py-3 rounded text-sm ${styles[variant]}`}>
      {children}
    </div>
  )
}

// ---- Tag ----
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block font-mono text-[11px] tracking-widest uppercase text-green border border-green px-2.5 py-1 rounded-sm">
      {children}
    </span>
  )
}

// ---- Stat Card ----
export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-rule rounded p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-green" />
      <div className="font-mono text-[11px] tracking-widest uppercase text-ink-soft mb-2">{label}</div>
      <div className="font-serif text-4xl font-semibold leading-none text-ink mb-1">{value}</div>
      {sub && <div className="text-xs text-ink-soft">{sub}</div>}
    </div>
  )
}

// ---- Card ----
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-rule rounded ${className}`}>
      {children}
    </div>
  )
}

// ---- Section heading ----
export function SectionHeading({ tag, title, sub, center }: { tag?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {tag && <Tag>{tag}</Tag>}
      <h2 className={`font-serif font-semibold tracking-tight leading-tight mt-3 mb-2 text-3xl lg:text-4xl`}>{title}</h2>
      {sub && <p className={`text-ink-soft text-[15px] leading-relaxed ${center ? 'mx-auto max-w-lg' : 'max-w-xl'}`}>{sub}</p>}
    </div>
  )
}

// ---- Page Hero ----
export function PageHero({ tag, title, sub, breadcrumbs }: {
  tag?: string
  title: string
  sub?: string
  breadcrumbs?: { label: string; href?: string }[]
}) {
  return (
    <section className="bg-green-dark text-white py-12 border-b-4 border-green">
      <div className="max-w-6xl mx-auto px-4">
        {tag && (
          <span className="inline-block font-mono text-[11px] tracking-widest uppercase border border-white/30 text-white/85 px-2.5 py-1 rounded-sm mb-3">
            {tag}
          </span>
        )}
        <h1 className="font-serif font-semibold tracking-tight leading-tight text-3xl md:text-4xl lg:text-5xl mb-2">{title}</h1>
        {sub && <p className="text-white/65 text-[15px]">{sub}</p>}
        {breadcrumbs && (
          <div className="flex gap-2 items-center font-mono text-xs text-white/40 mt-3">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex gap-2 items-center">
                {i > 0 && <span className="text-white/20">/</span>}
                {b.href ? (
                  <a href={b.href} className="hover:text-white/70 transition-colors">{b.label}</a>
                ) : (
                  <span>{b.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ---- Notice Card ----
export function NoticeCard({ type, title, body, date }: { type: string; title: string; body: string; date: string }) {
  return (
    <div className="border-l-4 border-green bg-white pl-5 pr-5 py-4 border border-l-green border-t-rule border-r-rule border-b-rule rounded-r">
      <div className="font-mono text-[10px] tracking-widest uppercase text-green mb-1">{type}</div>
      <div className="font-serif font-medium text-[17px] mb-1.5">{title}</div>
      <div className="text-sm text-ink-soft leading-relaxed">{body}</div>
      <div className="font-mono text-[11px] text-ink-soft mt-2">{date}</div>
    </div>
  )
}

// ---- Input ----
export function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-ink-mid tracking-wide">{label}</label>
      <input
        {...props}
        className="px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded bg-white text-sm focus:border-green focus:ring-2 focus:ring-green/10 outline-none transition-all"
      />
    </div>
  )
}

// ---- Select ----
export function Select({ label, children, ...props }: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-ink-mid tracking-wide">{label}</label>
      <select
        {...props}
        className="px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded bg-white text-sm focus:border-green focus:ring-2 focus:ring-green/10 outline-none transition-all"
      >
        {children}
      </select>
    </div>
  )
}

// ---- Textarea ----
export function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-ink-mid tracking-wide">{label}</label>
      <textarea
        {...props}
        className="px-3.5 py-2.5 border-[1.5px] border-rule-dark rounded bg-white text-sm focus:border-green focus:ring-2 focus:ring-green/10 outline-none transition-all resize-y min-h-[100px]"
      />
    </div>
  )
}

// ---- Button ----
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger'
export function Button({ children, variant = 'primary', className = '', ...props }: {
  children: ReactNode
  variant?: BtnVariant
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles: Record<BtnVariant, string> = {
    primary: 'bg-green text-white hover:bg-green-dark',
    outline: 'border border-green text-green hover:bg-green hover:text-white',
    ghost:   'text-ink-mid hover:bg-green-pale hover:text-green',
    danger:  'border border-red-300 text-red-700 hover:bg-red-50',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition-all cursor-pointer disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ---- Modal ----
export function Modal({ open, onClose, title, sub, children }: {
  open: boolean
  onClose: () => void
  title: string
  sub?: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-md p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="font-serif font-semibold text-xl mb-1">{title}</div>
        {sub && <div className="text-sm text-ink-soft mb-5">{sub}</div>}
        {children}
      </div>
    </div>
  )
}

// ---- Grade Badge ----
export function GradeBadge({ grade }: { grade: string }) {
  const v: BadgeVariant =
    grade === 'A' ? 'green' :
    grade === 'B' ? 'yellow' :
    grade === 'C' ? 'gray' : 'red'
  return <Badge variant={v}>{grade}</Badge>
}
