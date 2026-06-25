// src/components/Form/LeadForm.jsx
import { useState } from 'react'
import { Send, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { PriorityBadge, CategoryBadge } from '../Dashboard/Badges'

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

export default function LeadForm({ onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', requirement: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)  // { lead, trackingLink }

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name = 'Full name is required'
    if (!form.email.trim())       e.email = 'Email address is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim())       e.phone = 'Phone number is required'
    if (!form.requirement.trim()) e.requirement = 'Please describe your requirement'
    return e
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: null }))
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      const lead = await onSubmit(form)
      setResult({ lead, trackingLink: `${APP_URL}/track/${lead.id}` })
      setForm({ name: '', email: '', phone: '', company: '', requirement: '' })
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder, required, half }) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        aria-describedby={errors[name] ? `${name}-err` : undefined}
      />
      {errors[name] && (
        <p id={`${name}-err`} className="mt-1 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
          <AlertCircle size={12} /> {errors[name]}
        </p>
      )}
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        New Lead
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Submit the form to capture a lead, classify it with AI, and send a personalized email automatically.
      </p>

      {/* Form card */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 gap-4">
          <Field name="name"        label="Full name"        placeholder="Rahul Sharma"            required half />
          <Field name="email"       label="Email address"    type="email" placeholder="rahul@example.com" required half />
          <Field name="phone"       label="Phone number"     type="tel" placeholder="+91 98765 43210" required half />
          <Field name="company"     label="Company name"     placeholder="ABC Pvt Ltd (optional)"  half />
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Requirement / message <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              name="requirement"
              value={form.requirement}
              onChange={handleChange}
              placeholder="Describe what you need…"
              rows={4}
            />
            {errors.requirement && (
              <p className="mt-1 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                <AlertCircle size={12} /> {errors.requirement}
              </p>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="mt-4 p-3 rounded-lg text-sm flex items-center gap-2"
            style={{ background: '#3b0f0f', color: '#f87171', border: '1px solid #7f1d1d' }}>
            <AlertCircle size={14} /> {errors.submit}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.6 : 1 }}
        >
          {loading
            ? <><Sparkles size={14} className="animate-spin" /> Classifying & sending…</>
            : <><Send size={14} /> Submit & send email</>
          }
        </button>
      </div>

      {/* Success result */}
      {result && (
        <div className="mt-4 rounded-xl p-5" style={{ background: '#0f2e1a', border: '1px solid #14532d' }}>
          <div className="flex items-start gap-3">
            <CheckCircle size={20} color="#4ade80" className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm" style={{ color: '#4ade80' }}>Lead saved & email sent!</p>
              <p className="text-xs mt-1" style={{ color: '#86efac' }}>
                Personalized email delivered to {result.lead.email} with tracking link.
              </p>

              {/* AI classification result */}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span className="text-xs" style={{ color: '#86efac' }}>AI Classification:</span>
                <CategoryBadge category={result.lead.category} />
                <PriorityBadge priority={result.lead.priority} />
              </div>

              {/* Email preview */}
              <div className="mt-4 rounded-lg p-4 text-sm" style={{ background: 'rgba(0,0,0,0.3)', color: '#d1fae5' }}>
                <p className="text-xs mb-2" style={{ color: '#86efac', opacity: 0.7 }}>
                  Subject: Thank you for contacting us
                </p>
                <p>Hi {result.lead.name},</p>
                <br />
                <p>Thank you for reaching out.</p>
                <p>We received your requirement: <em>"{result.lead.requirement}"</em></p>
                <br />
                <p>
                  Learn more:{' '}
                  <a href={result.trackingLink} className="underline" style={{ color: '#818cf8' }}>
                    {result.trackingLink}
                  </a>
                </p>
                <br />
                <p>Regards,<br />LeadTrack AI Team</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
