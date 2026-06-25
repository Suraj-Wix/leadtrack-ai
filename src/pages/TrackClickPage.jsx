// src/pages/TrackClickPage.jsx
// This page is the tracking redirect endpoint.
// URL: /track/:leadId
// It records the click event in Supabase, then redirects to the destination.

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const REDIRECT_URL = 'https://yourwebsite.com'  // Change to your actual destination

export default function TrackClickPage() {
  const { leadId } = useParams()
  const [status, setStatus] = useState('Recording click…')

  useEffect(() => {
    async function trackAndRedirect() {
      try {
        // 1. Record click in Supabase
        const { data: lead } = await supabase
          .from('leads')
          .select('click_count')
          .eq('id', leadId)
          .single()

        const newCount = (lead?.click_count || 0) + 1

        await supabase
          .from('leads')
          .update({
            link_clicked: true,
            link_clicked_at: new Date().toISOString(),
            click_count: newCount,
          })
          .eq('id', leadId)

        // 2. Log tracking event
        await supabase.from('tracking_events').insert([{
          lead_id: leadId,
          event_type: 'link_clicked',
          metadata: { click_count: newCount },
        }])

        setStatus('Redirecting…')
      } catch (err) {
        console.error('Tracking error:', err)
        setStatus('Redirecting…')
      } finally {
        // 3. Always redirect (even if tracking fails)
        setTimeout(() => {
          window.location.href = REDIRECT_URL
        }, 300)
      }
    }

    if (leadId) trackAndRedirect()
  }, [leadId])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#13161e',
      color: '#8b8fa8',
      fontFamily: 'system-ui, sans-serif',
      fontSize: 14,
    }}>
      {status}
    </div>
  )
}
