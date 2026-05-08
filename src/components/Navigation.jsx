export default function Navigation({ activeTab, setActiveTab, hasIntelligenceFile, apiKey }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
  ]

  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="nav-logo-mark">C</div>
        <span className="nav-logo-text">Compass</span>
      </div>

      <div className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <div
          className={`nav-status-dot${hasIntelligenceFile ? '' : ' empty'}`}
          title={hasIntelligenceFile ? 'Intelligence File active' : 'No Intelligence File — run Onboarding first'}
        />
        <button
          className={`nav-settings-btn${activeTab === 'settings' ? ' active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          {apiKey ? 'Settings' : 'Add API Key ↗'}
        </button>
      </div>
    </nav>
  )
}
