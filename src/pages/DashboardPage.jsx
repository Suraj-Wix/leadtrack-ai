// src/pages/DashboardPage.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useLeads } from '../hooks/useLeads'
import MetricCard from '../components/Dashboard/MetricCard'
import { CategoryBadge, PriorityBadge, StatusBadge } from '../components/Dashboard/Badges'
import { RefreshCw } from 'lucide-react'

// Build last-7-day chart data from leads
function buildDailyData(leads) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toDateString()
    days.push({
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      leads: leads.filter(l => new Date(l.created_at).toDateString() === dateStr).length,
    })
  }
  return days
}

function buildCategoryData(leads) {
  const counts = {}
  leads.forEach(l => {
    if (l.category) counts[l.category] = (counts[l.category] || 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg p-2 text-xs" style={{ background: '#1a1d27', border: '1px solid #2a2d3e', color: '#e2e4ed' }}>
      <p className="font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { leads, loading, metrics, refetch } = useLeads()
  const dailyData    = buildDailyData(leads)
  const categoryData = buildCategoryData(leads)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Analytics Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Lead engagement and email tracking metrics
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <MetricCard label="Total leads"    value={metrics.totalLeads}   sub="All submissions" />
        <MetricCard label="Emails sent"    value={metrics.emailsSent}   sub="Delivered" color="#60a5fa" />
        <MetricCard label="Emails opened"  value={metrics.emailsOpened} sub="Pixel fired" color="#4ade80" />
        <MetricCard label="Open rate"      value={`${metrics.openRate}%`} sub="Industry avg: 20%" color="#4ade80" />
        <MetricCard label="Link clicks"    value={metrics.linksClicked} sub="Unique clicks" color="#a78bfa" />
        <MetricCard label="Click rate"     value={`${metrics.clickRate}%`} sub="Of emails sent" color="#a78bfa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Daily leads bar chart */}
        <div className="lg:col-span-2 rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Lead submissions — last 7 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#8b8fa8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b8fa8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution pie chart */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Leads by category</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: '#8b8fa8' }}>{value}</span>}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent leads table */}
      <div className="rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Recent leads</p>
        </div>
        <div className="overflow-x-auto">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Email status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>
                    No leads yet — submit the Add Lead form to get started
                  </td>
                </tr>
              ) : (
                leads.slice(0, 10).map(lead => (
                  <tr key={lead.id}>
                    <td className="font-medium">{lead.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lead.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lead.company || '—'}</td>
                    <td><CategoryBadge category={lead.category} /></td>
                    <td><PriorityBadge priority={lead.priority} /></td>
                    <td>
                      <StatusBadge
                        emailSent={lead.email_sent}
                        emailOpened={lead.email_opened}
                        linkClicked={lead.link_clicked}
                      />
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
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
