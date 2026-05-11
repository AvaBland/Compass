import { useState } from 'react'
import { useStorage } from './hooks/useStorage'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import OnboardingMode from './components/OnboardingMode'
import DailyMode from './components/DailyMode'
import WeeklyMode from './components/WeeklyMode'
import Settings from './components/Settings'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { intelligenceFile, setIntelligenceFile, apiKey, setApiKey, model, setModel, baseUrl, setBaseUrl } = useStorage()

  return (
    <div className="app">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasIntelligenceFile={!!intelligenceFile}
        apiKey={apiKey}
      />
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            intelligenceFile={intelligenceFile}
            setIntelligenceFile={setIntelligenceFile}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'onboarding' && (
          <OnboardingMode
            apiKey={apiKey}
            model={model}
            baseUrl={baseUrl}
            setIntelligenceFile={setIntelligenceFile}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'daily' && (
          <DailyMode
            apiKey={apiKey}
            model={model}
            baseUrl={baseUrl}
            intelligenceFile={intelligenceFile}
            setIntelligenceFile={setIntelligenceFile}
          />
        )}
        {activeTab === 'weekly' && (
          <WeeklyMode
            apiKey={apiKey}
            model={model}
            baseUrl={baseUrl}
            intelligenceFile={intelligenceFile}
            setIntelligenceFile={setIntelligenceFile}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            apiKey={apiKey}
            setApiKey={setApiKey}
            model={model}
            setModel={setModel}
            baseUrl={baseUrl}
            setBaseUrl={setBaseUrl}
            intelligenceFile={intelligenceFile}
            setIntelligenceFile={setIntelligenceFile}
          />
        )}
      </main>
    </div>
  )
}
