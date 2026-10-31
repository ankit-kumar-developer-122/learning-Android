import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import dbService from '../services/database'
import '../styles/HomePage.css'

function HomePage() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalPatients: 0,
    unsyncedCount: 0,
    todayVisits: 0
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const statistics = await dbService.getStatistics()
      setStats(statistics)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncMessage('Syncing...')
    try {
      const result = await dbService.syncToRemote()
      setSyncMessage(`✓ Synced ${result.visitsSynced} visits and ${result.patientsSynced} patients`)
      await loadStats()
      setTimeout(() => setSyncMessage(''), 3000)
    } catch (error) {
      setSyncMessage('✗ Sync failed - will retry when connection is available')
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>🏥 Welcome to APRHS</h1>
        <p className="subtitle">AI-Powered Rural Healthcare System</p>
        <p className="description">
          Providing quality healthcare to rural communities through technology,
          AI-powered diagnosis, and offline-first design.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.totalVisits}</div>
          <div className="stat-label">Total Visits</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.todayVisits}</div>
          <div className="stat-label">Today's Visits</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">🔄</div>
          <div className="stat-value">{stats.unsyncedCount}</div>
          <div className="stat-label">Unsynced Visits</div>
        </div>
      </div>

      {stats.unsyncedCount > 0 && (
        <div className="sync-section">
          <button 
            className="btn-primary" 
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? '⏳ Syncing...' : '🔄 Sync to Cloud'}
          </button>
          {syncMessage && (
            <div className={`sync-message ${syncMessage.includes('✓') ? 'success' : 'error'}`}>
              {syncMessage}
            </div>
          )}
        </div>
      )}

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/new-visit" className="action-card">
            <div className="action-icon">➕</div>
            <h3>New Visit</h3>
            <p>Record a new patient visit</p>
          </Link>
          <Link to="/visits" className="action-card">
            <div className="action-icon">📋</div>
            <h3>View Visits</h3>
            <p>Browse all patient visits</p>
          </Link>
          <Link to="/chatbot" className="action-card">
            <div className="action-icon">💬</div>
            <h3>Symptom Checker</h3>
            <p>AI-powered symptom assessment</p>
          </Link>
          <Link to="/dashboard" className="action-card">
            <div className="action-icon">📈</div>
            <h3>Dashboard</h3>
            <p>View analytics and insights</p>
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Offline First</h3>
            <p>Works without internet connection</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Smart triage and diagnosis support</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Multilingual</h3>
            <p>Support for local languages</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Image Analysis</h3>
            <p>Wound and skin condition assessment</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
