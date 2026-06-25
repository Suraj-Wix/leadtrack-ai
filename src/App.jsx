// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import AddLeadPage from './pages/AddLeadPage'
import TrackingPage from './pages/TrackingPage'
import TrackClickPage from './pages/TrackClickPage'
import TrackOpenPage from './pages/TrackOpenPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tracking endpoints — no layout shell */}
        <Route path="/track/:leadId"     element={<TrackClickPage />} />
        <Route path="/api/open/:leadId"  element={<TrackOpenPage />} />

        {/* Main app with sidebar layout */}
        <Route element={<Layout />}>
          <Route path="/"           element={<DashboardPage />} />
          <Route path="/leads"      element={<LeadsPage />} />
          <Route path="/add-lead"   element={<AddLeadPage />} />
          <Route path="/tracking"   element={<TrackingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
