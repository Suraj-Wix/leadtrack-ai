// src/pages/LeadsPage.jsx
import { useState } from 'react'
import { useLeads } from '../hooks/useLeads'
import { CategoryBadge, PriorityBadge, StatusBadge } from '../components/Dashboard/Badges'
import { Search } from 'lucide-react'

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

export default function LeadsPage() {
  const { leads, loading } = useLeads()
  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat]   = useState('')
  const [filterPri, setFilterPri]   = useState('')

  const categories = [...new Set(leads.map(l => l.category).filter(Boolean))]

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.requirement.toLowerCase().includes(q)
    const matchCat = !filterCat || l.category === filterCat
    const matchPri = !filterPri || l.priority === filterPri
    return matchSearch && matchCat && matchPri
  })

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>All Leads</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
        {leads.length} leads total
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads…"
            style={{ width: 220, paddingLeft: 30 }}
          />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 180 }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPri} onChange={e => setFilterPri(e.target.value)} style={{ width: 140 }}>
          <option value="">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Requirement</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Tracking link</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No leads found</td></tr>
              ) : (
                filtered.map(lead => (
                  <tr key={lead.id}>
                    <td className="font-medium whitespace-nowrap">{lead.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lead.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lead.phone}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lead.company || '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: 12 }}>
                      {lead.requirement}
                    </td>
                    <td><CategoryBadge category={lead.category} /></td>
                    <td><PriorityBadge priority={lead.priority} /></td>
                    <td>
                      <StatusBadge
                        emailSent={lead.email_sent}
                        emailOpened={lead.email_opened}
                        linkClicked={lead.link_clicked}
                      />
                    </td>
                    <td>
                      <a
                        href={`${APP_URL}/track/${lead.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        /track/{lead.id.slice(0, 8)}…
                      </a>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
