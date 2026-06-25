// src/pages/AddLeadPage.jsx
import { useLeads } from '../hooks/useLeads'
import LeadForm from '../components/Form/LeadForm'

export default function AddLeadPage() {
  const { submitLead } = useLeads()
  return <LeadForm onSubmit={submitLead} />
}
