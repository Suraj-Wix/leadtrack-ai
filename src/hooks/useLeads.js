// src/hooks/useLeads.js
// Custom React hook — CRUD operations on the leads table via Supabase.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { classify } from '../lib/classifier'
import { sendLeadEmail } from '../lib/email'

export function useLeads() {
  const [leads, setLeads]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // ── Fetch all leads from Supabase ──────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  // ── Submit a new lead ──────────────────────────────────────
  const submitLead = useCallback(async (formData) => {
    setError(null)

    // 1. AI classification
    const { category, priority } = await classify(formData.requirement)

    // 2. Insert into Supabase
    const { data, error: insertError } = await supabase
      .from('leads')
      .insert([{
        name:        formData.name,
        email:       formData.email,
        phone:       formData.phone,
        company:     formData.company || null,
        requirement: formData.requirement,
        email_sent:  false,
        email_opened: false,
        link_clicked: false,
        click_count: 0,
        category,
        priority,
      }])
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)

    // 3. Send personalized email (async, non-blocking)
    sendLeadEmail(data).then(() => {
      supabase.from('leads').update({ email_sent: true }).eq('id', data.id)
      // Log tracking event
      supabase.from('tracking_events').insert([{
        lead_id: data.id,
        event_type: 'email_sent',
      }])
    }).catch(console.error)

    // 4. Refresh local state
    setLeads(prev => [{ ...data, email_sent: true }, ...prev])
    return { ...data, category, priority }
  }, [])

  // ── Mark email as opened (called by tracking endpoint) ─────
  const markOpened = useCallback(async (leadId) => {
    const { error } = await supabase
      .from('leads')
      .update({ email_opened: true, email_opened_at: new Date().toISOString() })
      .eq('id', leadId)

    if (!error) {
      await supabase.from('tracking_events').insert([{
        lead_id: leadId,
        event_type: 'email_opened',
      }])
      setLeads(prev =>
        prev.map(l => l.id === leadId ? { ...l, email_opened: true } : l)
      )
    }
  }, [])

  // ── Record link click ──────────────────────────────────────
  const recordClick = useCallback(async (leadId) => {
    const lead = leads.find(l => l.id === leadId)
    const newCount = (lead?.click_count || 0) + 1

    const { error } = await supabase
      .from('leads')
      .update({
        link_clicked: true,
        link_clicked_at: new Date().toISOString(),
        click_count: newCount,
      })
      .eq('id', leadId)

    if (!error) {
      await supabase.from('tracking_events').insert([{
        lead_id: leadId,
        event_type: 'link_clicked',
        metadata: { click_count: newCount },
      }])
      setLeads(prev =>
        prev.map(l => l.id === leadId
          ? { ...l, link_clicked: true, click_count: newCount }
          : l
        )
      )
    }
  }, [leads])

  // ── Computed analytics metrics ─────────────────────────────
  const metrics = {
    totalLeads:  leads.length,
    emailsSent:  leads.filter(l => l.email_sent).length,
    emailsOpened: leads.filter(l => l.email_opened).length,
    linksClicked: leads.filter(l => l.link_clicked).length,
    get openRate() {
      return this.emailsSent
        ? Math.round((this.emailsOpened / this.emailsSent) * 100)
        : 0
    },
    get clickRate() {
      return this.emailsSent
        ? Math.round((this.linksClicked / this.emailsSent) * 100)
        : 0
    },
  }

  return { leads, loading, error, metrics, submitLead, markOpened, recordClick, refetch: fetchLeads }
}
