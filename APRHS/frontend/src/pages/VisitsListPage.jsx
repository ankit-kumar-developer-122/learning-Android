import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import dbService from '../services/database'
import '../styles/VisitsListPage.css'

function VisitsListPage() {
  const [visits, setVisits] = useState([])
  const [filteredVisits, setFilteredVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadVisits()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [visits, filter, searchTerm])

  const loadVisits = async () => {
    try {
      const allVisits = await dbService.getAllVisits()
      setVisits(allVisits)
    } catch (error) {
      console.error('Error loading visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...visits]

    // Apply sync filter
    if (filter === 'unsynced') {
      filtered = filtered.filter(v => !v.synced)
    } else if (filter === 'synced') {
      filtered = filtered.filter(v => v.synced)
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(v => 
        v.patientName?.toLowerCase().includes(term) ||
        v.village?.toLowerCase().includes(term) ||
        v.symptoms?.some(s => s.toLowerCase().includes(term))
      )
    }

    setFilteredVisits(filtered)
  }

  const getPriorityBadge = (triageResult) => {
    if (!triageResult) return null

    const priorityMap = {
      emergency: { class: 'badge-danger', label: '🚨 Emergency' },
      urgent: { class: 'badge-warning', label: '⚠️ Urgent' },
      moderate: { class: 'badge-warning', label: '📝 Moderate' },
      routine: { class: 'badge-success', label: '✓ Routine' }
    }

    const priority = priorityMap[triageResult.priority] || priorityMap.routine
    return <span className={`badge ${priority.class}`}>{priority.label}</span>
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="visits-list-page">
        <div className="loading">Loading visits...</div>
      </div>
    )
  }

  return (
    <div className="visits-list-page">
      <div className="page-header">
        <div>
          <h1>📋 Patient Visits</h1>
          <p>Total: {visits.length} visits</p>
        </div>
        <Link to="/new-visit" className="btn-primary">
          ➕ New Visit
        </Link>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by name, village, or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({visits.length})
          </button>
          <button
            className={`filter-tab ${filter === 'unsynced' ? 'active' : ''}`}
            onClick={() => setFilter('unsynced')}
          >
            Unsynced ({visits.filter(v => !v.synced).length})
          </button>
          <button
            className={`filter-tab ${filter === 'synced' ? 'active' : ''}`}
            onClick={() => setFilter('synced')}
          >
            Synced ({visits.filter(v => v.synced).length})
          </button>
        </div>
      </div>

      {filteredVisits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No visits found</h2>
          <p>
            {searchTerm
              ? 'No visits match your search criteria'
              : 'Create your first patient visit to get started'}
          </p>
          <Link to="/new-visit" className="btn-primary">
            Create New Visit
          </Link>
        </div>
      ) : (
        <div className="visits-grid">
          {filteredVisits.map(visit => (
            <Link
              key={visit._id}
              to={`/visit/${visit._id}`}
              className="visit-card"
            >
              <div className="visit-header">
                <div>
                  <h3>{visit.patientName}</h3>
                  <div className="visit-meta">
                    {visit.age} years • {visit.gender} • {visit.village}
                  </div>
                </div>
                {!visit.synced && (
                  <span className="badge badge-warning">🔄 Unsynced</span>
                )}
              </div>

              {visit.symptoms && visit.symptoms.length > 0 && (
                <div className="visit-symptoms">
                  <strong>Symptoms:</strong>{' '}
                  {visit.symptoms.slice(0, 3).join(', ')}
                  {visit.symptoms.length > 3 && ` +${visit.symptoms.length - 3} more`}
                </div>
              )}

              {visit.triageResult && (
                <div className="visit-triage">
                  {getPriorityBadge(visit.triageResult)}
                </div>
              )}

              {visit.images && visit.images.length > 0 && (
                <div className="visit-images-indicator">
                  📸 {visit.images.length} image{visit.images.length !== 1 ? 's' : ''}
                </div>
              )}

              <div className="visit-footer">
                <span className="visit-date">
                  📅 {formatDate(visit.createdAt)}
                </span>
                {visit.createdBy && (
                  <span className="visit-author">
                    👤 {visit.createdBy}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default VisitsListPage
