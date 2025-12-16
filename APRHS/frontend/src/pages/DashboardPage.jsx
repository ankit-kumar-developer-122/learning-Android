import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { analyticsAPI } from '../services/api'
import dbService from '../services/database'
import '../styles/DashboardPage.css'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [localStats, setLocalStats] = useState(null)
  const [outbreakAlerts, setOutbreakAlerts] = useState([])
  const [selectedVillage, setSelectedVillage] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [selectedVillage])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load analytics from API (with mock fallback)
      const analyticsData = await analyticsAPI.getVillageStats(selectedVillage)
      setStats(analyticsData)

      // Load local statistics
      const local = await dbService.getStatistics()
      setLocalStats(local)

      // Load outbreak alerts
      const alerts = await analyticsAPI.getOutbreakAlerts()
      setOutbreakAlerts(alerts)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>📈 Health Authority Dashboard</h1>
          <p>Village-level health metrics and analytics</p>
        </div>
        <button className="btn-primary" onClick={loadDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {/* Outbreak Alerts */}
      {outbreakAlerts.length > 0 && (
        <div className="alerts-section">
          <h2>🚨 Outbreak Alerts</h2>
          <div className="alerts-grid">
            {outbreakAlerts.map((alert, index) => (
              <div key={index} className="alert-card">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <h3>{alert.title}</h3>
                  <p>{alert.description}</p>
                  <span className="alert-location">{alert.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{stats?.totalVisits || 0}</div>
            <div className="metric-label">Total Visits</div>
            {localStats && (
              <div className="metric-sublabel">
                {localStats.unsyncedCount} pending sync
              </div>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{stats?.totalPatients || 0}</div>
            <div className="metric-label">Total Patients</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👨‍⚕️</div>
          <div className="metric-content">
            <div className="metric-value">{stats?.activeVHWs || 0}</div>
            <div className="metric-label">Active VHWs</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🏘️</div>
          <div className="metric-content">
            <div className="metric-value">{stats?.villages || 0}</div>
            <div className="metric-label">Villages Covered</div>
          </div>
        </div>

        <div className="metric-card highlight">
          <div className="metric-icon">🚨</div>
          <div className="metric-content">
            <div className="metric-value">{stats?.emergencyCases || 0}</div>
            <div className="metric-label">Emergency Cases</div>
            <div className="metric-sublabel">Requires immediate attention</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Visits Trend */}
        <div className="card chart-card">
          <h2>📈 Visits Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#2563eb"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Common Symptoms */}
        <div className="card chart-card">
          <h2>🩺 Most Common Symptoms</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.commonSymptoms || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symptom" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Local System Status */}
      {localStats && (
        <div className="card">
          <h2>💾 Local System Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-label">Total Local Visits</div>
              <div className="status-value">{localStats.totalVisits}</div>
            </div>
            <div className="status-item">
              <div className="status-label">Local Patients</div>
              <div className="status-value">{localStats.totalPatients}</div>
            </div>
            <div className="status-item">
              <div className="status-label">Today's Visits</div>
              <div className="status-value">{localStats.todayVisits}</div>
            </div>
            <div className="status-item highlight">
              <div className="status-label">Pending Sync</div>
              <div className="status-value">{localStats.unsyncedCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Data Insights */}
      <div className="insights-section">
        <h2>💡 Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <h3>Visit Pattern</h3>
            <p>Average {Math.round((stats?.totalVisits || 0) / 7)} visits per day in the last week</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⏱️</div>
            <h3>Response Time</h3>
            <p>Most cases triaged within 2 hours of reporting</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <h3>Coverage</h3>
            <p>{stats?.villages || 0} villages actively monitored</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📱</div>
            <h3>Offline Capability</h3>
            <p>System operational even without internet connectivity</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
