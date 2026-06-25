// src/pages/TrackingPage.jsx
// Shows real-time tracking events from Supabase.
// Also demonstrates the simulation for demo purposes.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLeads } from '../hooks/useLeads'
import MetricCard from '../components/Dashboard/MetricCard'
import { Mail, Eye, MousePointer, Clock } from 'lucide-react'

const EVENT_ICONS = {
  email_sent:    { icon: Mail,         color: '#60a5fa', label: 'Email sent'    },
  email_opened:  { icon: Eye,          color: '#4ade80', label: 'Email opened'  },
  link_clicked:  { icon: MousePointer, color: '#a78bfa', label: 'Link clicked'  },
}

export default function TrackingPage() {
  const { leads, metrics, markOpened, recordClick } = useLeads()
  const [events, setEvents] = useState([])
  const [simLead, setSimLead] = useState('')

  useEffect(() => {
    // Fetch tracking events from Supabase
    supabase
      .from('tracking_events')
      .select('*, leads(name, email)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setEvents(data || []))

    // Subscribe to real-time tracking events
    const channel = supabase
      .channel('tracking_events_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tracking_events' }, payload => {
        setEvents(prev => [payload.new, ...prev].slice(0, 50))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleSimulateOpen = async () => {
    if (!simLead) return
    await markOpened(simLead)
    setSimLead('')
  }

  const handleSimulateClick = async () => {
    if (!simLead) return
    await recordClick(simLead)
    setSimLead('')
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Tracking Events</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Real-time email open and link click events via Supabase
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Emails sent"   value={metrics.emailsSent}   color="#60a5fa" />
        <MetricCard label="Opens tracked" value={metrics.emailsOpened} color="#4ade80" sub="Via tracking pixel" />
        <MetricCard label="Link clicks"   value={metrics.linksClicked} color="#a78bfa" />
        <MetricCard label="Engagement"    value={`${Math.round((metrics.emailsOpened + metrics.linksClicked) / Math.max(metrics.emailsSent * 2, 1) * 100)}%`} />
      </div>

      {/* How tracking works */}
      <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>How tracking works</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg p-4" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <p className="font-medium mb-1" style={{ color: '#60a5fa' }}>📧 Email open tracking</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A 1×1px invisible image is embedded in every email at{' '}
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: 3, fontSize: 12 }}>
                /api/open/:leadId
              </code>
              . When the email client loads it, Supabase is updated with <code style={{ fontSize: 12, background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: 3 }}>email_opened=true</code>.
            </p>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <p className="font-medium mb-1" style={{ color: '#a78bfa' }}>🔗 Link click tracking</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Every email contains a unique URL{' '}
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: 3, fontSize: 12 }}>
                /track/:leadId
              </code>
              . When clicked, it records the event in Supabase, then redirects to the destination.
            </p>
          </div>
        </div>
      </div>

      {/* Simulate engagement */}
      <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Simulate engagement</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
          In production, these are triggered automatically. Use this panel to test tracking in development.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={simLead}
            onChange={e => setSimLead(e.target.value)}
            style={{ width: 220 }}
          >
            <option value="">Select a lead…</option>
            {leads.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.email})</option>
            ))}
          </select>
          <button
            onClick={handleSimulateOpen}
            disabled={!simLead}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-opacity"
            style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', opacity: simLead ? 1 : 0.4 }}
          >
            <Eye size={13} /> Simulate email open
          </button>
          <button
            onClick={handleSimulateClick}
            disabled={!simLead}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-opacity"
            style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', opacity: simLead ? 1 : 0.4 }}
          >
            <MousePointer size={13} /> Simulate link click
          </button>
        </div>
      </div>

      {/* Event log */}
      <div className="rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Event log</p>
        </div>
        <div>
          {events.length === 0 ? (
            <p className="p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              No events yet. Submit a lead and simulate engagement above.
            </p>
          ) : (
            events.map((ev, i) => {
              const config = EVENT_ICONS[ev.event_type] || EVENT_ICONS.email_sent
              const Icon   = config.icon
              return (
                <div
                  key={ev.id || i}
                  className="flex items-start gap-3 p-4"
                  style={{ borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: config.color + '1a' }}>
                    <Icon size={14} color={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {config.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {ev.leads?.name ? `${ev.leads.name} · ${ev.leads.email}` : `Lead ID: ${ev.lead_id?.slice(0, 8)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                    <Clock size={11} />
                    {new Date(ev.created_at).toLocaleTimeString()}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
