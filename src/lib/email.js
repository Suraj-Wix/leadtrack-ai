// src/lib/email.js
// EmailJS integration for sending personalized automated emails.
//
// SETUP STEPS:
// 1. Go to https://emailjs.com and create a free account
// 2. Add Email Service (Gmail, Outlook, etc.) → note SERVICE_ID
// 3. Create Email Template with these template variables:
//    {{to_name}}, {{to_email}}, {{requirement}}, {{tracking_link}}, {{open_pixel_url}}
// 4. Copy Public Key from Account → API Keys
// 5. Add all values to .env.local

import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const APP_URL     = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

// EmailJS HTML email template to paste into the EmailJS dashboard:
// ---------------------------------------------------------------
// Subject: Thank you for contacting us, {{to_name}}
//
// <p>Hi {{to_name}},</p>
// <p>Thank you for reaching out.</p>
// <p>We received your requirement:<br><em>"{{requirement}}"</em></p>
// <p>Learn more: <a href="{{tracking_link}}">Click here</a></p>
// <p>Regards,<br>LeadTrack AI Team</p>
// <!-- Tracking pixel — records email open event -->
// <img src="{{open_pixel_url}}" width="1" height="1" style="display:none" />
// ---------------------------------------------------------------

/**
 * Send personalized email to a new lead.
 * @param {{ id: string, name: string, email: string, requirement: string }} lead
 * @returns {Promise<void>}
 */
export async function sendLeadEmail(lead) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[Email] EmailJS not configured — skipping send. Check .env.local')
    return
  }

  const trackingLink  = `${APP_URL}/track/${lead.id}`
  const openPixelUrl  = `${APP_URL}/api/open/${lead.id}`

  const templateParams = {
    to_name:       lead.name,
    to_email:      lead.email,
    requirement:   lead.requirement,
    tracking_link: trackingLink,
    open_pixel_url: openPixelUrl,
  }

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
  console.log(`[Email] Sent to ${lead.email}`)
}
