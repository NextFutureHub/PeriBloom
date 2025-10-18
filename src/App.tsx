import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './components/providers'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import AIAssistantPage from './pages/AIAssistantPage'
import SymptomJournalPage from './pages/SymptomJournalPage'
import TriagePage from './pages/TriagePage'
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
            <Route path="ai-assistant" element={<AIAssistantPage />} />
            <Route path="symptom-journal" element={<SymptomJournalPage />} />
            <Route path="triage" element={<TriagePage />} />
            <Route path="education" element={<EducationPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="iot-monitor" element={<IoTMonitorPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
