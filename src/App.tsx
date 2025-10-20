import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './components/providers'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import AIHealthPage from './pages/AIHealthPage'
import SymptomJournalPage from './pages/SymptomJournalPage'
import EducationPage from './pages/EducationPage'
import ContactsPage from './pages/ContactsPage'
import IoTMonitorPage from './pages/IoTMonitorPage'
import SettingsPage from './pages/SettingsPage'
import AppLayout from './components/AppLayout'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ai-health" element={<AIHealthPage />} />
            <Route path="symptom-journal" element={<SymptomJournalPage />} />
            <Route path="education" element={<EducationPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="iot-monitor" element={<IoTMonitorPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Редиректы для старых роутов */}
            <Route path="ai-assistant" element={<Navigate to="/app/ai-health" replace />} />
            <Route path="triage" element={<Navigate to="/app/ai-health?tab=triage" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
