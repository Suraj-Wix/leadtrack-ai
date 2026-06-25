// src/components/Dashboard/Badges.jsx

const priorityStyles = {
  High:   { bg: '#3b0f0f', color: '#f87171', border: '#7f1d1d' },
  Medium: { bg: '#3b2a0f', color: '#fbbf24', border: '#78350f' },
  Low:    { bg: '#1a2e1a', color: '#4ade80', border: '#14532d' },
}

const categoryColors = {
  'AI Automation':       '#a78bfa',
  'Mobile Development':  '#60a5fa',
  'Web Development':     '#34d399',
  'Digital Marketing':   '#f472b6',
  'Backend / Integration': '#38bdf8',
  'E-Commerce':          '#fb923c',
  'Design':              '#e879f9',
  'Cybersecurity':       '#f87171',
  'General Inquiry':     '#94a3b8',
}

export function PriorityBadge({ priority }) {
  const s = priorityStyles[priority] || priorityStyles.Low
  return (
    <span
      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {priority}
    </span>
  )
}

export function CategoryBadge({ category }) {
  const color = categoryColors[category] || '#94a3b8'
  return (
    <span
      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: color + '1a',
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {category}
    </span>
  )
}

export function StatusBadge({ emailSent, emailOpened, linkClicked }) {
  if (emailOpened) return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{ background: '#0f2e1a', color: '#4ade80', border: '1px solid #14532d' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Opened
    </span>
  )
  if (linkClicked) return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{ background: '#1a1a3e', color: '#818cf8', border: '1px solid #3730a3' }}>
      Clicked
    </span>
  )
  if (emailSent) return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{ background: '#0f1f2e', color: '#60a5fa', border: '1px solid #1e3a5f' }}>
      Sent
    </span>
  )
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded-full"
      style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
      Pending
    </span>
  )
}
