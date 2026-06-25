// src/pages/TrackOpenPage.jsx
// Tracking pixel endpoint — called when email is opened.
// URL: /api/open/:leadId
//
// NOTE: For production email open tracking, you need a server-side endpoint
// that returns a 1×1 GIF and records the open. This client-side component
// is a simulation that works the same way when the link is opened in a browser.
//
// For a real server, use a Supabase Edge Function or Vercel serverless function
// (see the /supabase/functions/ directory in this repo for the Edge Function).

import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function TrackOpenPage() {
  const { leadId } = useParams()

  useEffect(() => {
    async function trackOpen() {
      if (!leadId) return
      try {
        await supabase
          .from('leads')
          .update({
            email_opened: true,
            email_opened_at: new Date().toISOString(),
          })
          .eq('id', leadId)

        await supabase.from('tracking_events').insert([{
          lead_id: leadId,
          event_type: 'email_opened',
        }])
      } catch (err) {
        console.error('Open tracking error:', err)
      }
    }

    trackOpen()
  }, [leadId])

  // Return a 1×1 transparent GIF (base64 encoded)
  return (
    <img
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      width={1}
      height={1}
      alt=""
      style={{ display: 'block' }}
    />
  )
}

// ============================================================
// PRODUCTION: Supabase Edge Function for server-side tracking
// ============================================================
// Create file: supabase/functions/track-open/index.ts
//
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
//
// const GIF_1x1 = Uint8Array.from(atob(
//   'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
// ), c => c.charCodeAt(0))
//
// Deno.serve(async (req) => {
//   const url    = new URL(req.url)
//   const leadId = url.pathname.split('/').pop()
//
//   const supabase = createClient(
//     Deno.env.get('SUPABASE_URL')!,
//     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
//   )
//
//   await supabase.from('leads').update({
//     email_opened: true,
//     email_opened_at: new Date().toISOString(),
//   }).eq('id', leadId)
//
//   await supabase.from('tracking_events').insert([{
//     lead_id: leadId,
//     event_type: 'email_opened',
//   }])
//
//   return new Response(GIF_1x1, {
//     headers: {
//       'Content-Type': 'image/gif',
//       'Cache-Control': 'no-store, no-cache, must-revalidate',
//     },
//   })
// })
