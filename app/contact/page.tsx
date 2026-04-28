'use client'
import { useState } from 'react'
import PublicLayout from '@/app/public/layout'
import { PageHero, Input, Select, Textarea, Button, Alert } from '@/components/ui'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle'|'success'|'error'>('idle')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Enquiry', message: '' })

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    // Simulate send — in production connect to email service or Supabase table
    await new Promise(r => setTimeout(r, 800))
    setStatus('success')
    setLoading(false)
    setForm({ name: '', email: '', subject: 'General Enquiry', message: '' })
  }

  return (
    <PublicLayout>
      <PageHero
        tag="Contact"
        title="Get in Touch"
        sub="Reach the school administration by phone, email, or in person."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <div className="font-serif font-semibold text-2xl mb-6">Send a Message</div>
              {status === 'success' && (
                <div className="mb-5">
                  <Alert variant="success">
                    Thank you, {form.name || 'there'}. Your message has been received. We will respond within 2 working days.
                  </Alert>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input label="Full Name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" required />
                <Input label="Email Address" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" required />
                <Select label="Subject" value={form.subject} onChange={e => update('subject', e.target.value)}>
                  {['General Enquiry','Admission','Student Result','Complaint','Partnership','Other'].map(o => <option key={o}>{o}</option>)}
                </Select>
                <Textarea label="Message" value={form.message} onChange={e => update('message', e.target.value)} placeholder="Type your message here…" required />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Contact info */}
            <div>
              <div className="font-serif font-semibold text-2xl mb-6">Contact Information</div>
              <div className="flex flex-col gap-4 mb-6">
                {[
                  ['Location', 'Government Secondary School Jiwa, Jiwa District, FCT Abuja, Nigeria'],
                  ['Phone', '+234 800 000 0000'],
                  ['Email', 'info@gssjiwa.edu.ng'],
                  ['Office Hours', 'Monday – Friday: 7:30 AM – 4:00 PM'],
                  ['Admissions', 'admissions@gssjiwa.edu.ng'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white border border-rule rounded p-4">
                    <div className="font-mono text-[10px] tracking-widest uppercase text-green mb-1.5">{k}</div>
                    <div className="text-[14.5px] font-medium">{v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-green-pale border border-rule-dark rounded p-5 text-center">
                <div className="font-serif font-semibold text-[17px] mb-2">Administration Hours</div>
                <div className="text-[13.5px] text-ink-soft leading-relaxed">
                  The school office is open <strong>7:30 AM to 4:00 PM</strong>, Monday through Friday. For urgent matters, please call directly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
