import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import dbService from '../services/database'
import { visionAPI } from '../services/api'
import '../styles/VisitDetailPage.css'

function VisitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [visit, setVisit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzingImages, setAnalyzingImages] = useState(false)

  useEffect(() => {
    loadVisit()
  }, [id])

  const loadVisit = async () => {
    try {
      const visitData = await dbService.getVisit(id)
      setVisit(visitData)
      
      // Auto-analyze images if not already analyzed
      if (visitData.images?.length > 0 && !visitData.visionResult) {
        analyzeImages(visitData)
      }
    } catch (error) {
      console.error('Error loading visit:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeImages = async (visitData) => {
    setAnalyzingImages(true)
    try {
      const imageResults = []
      
      for (const image of visitData.images) {
        const result = await visionAPI.analyzeImage(image.data, 'wound')
        imageResults.push(result)
      }

      const visionResult = {
        images: imageResults,
        analyzedAt: new Date().toISOString()
      }

      await dbService.updateVisit(id, { visionResult })
      setVisit(prev => ({ ...prev, visionResult }))
    } catch (error) {
      console.error('Error analyzing images:', error)
    } finally {
      setAnalyzingImages(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this visit?')) {
      try {
        await dbService.deleteVisit(id)
        navigate('/visits')
      } catch (error) {
        console.error('Error deleting visit:', error)
        alert('Error deleting visit')
      }
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="visit-detail-page">
        <div className="loading">Loading visit...</div>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="visit-detail-page">
        <div className="error-state">
          <h2>Visit not found</h2>
          <Link to="/visits" className="btn-primary">Back to Visits</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="visit-detail-page">
      <div className="page-header">
        <div>
          <Link to="/visits" className="back-link">← Back to Visits</Link>
          <h1>{visit.patientName}</h1>
          <div className="visit-meta">
            {visit.age} years • {visit.gender} • {visit.village}
          </div>
        </div>
        <div className="header-actions">
          {!visit.synced && (
            <span className="badge badge-warning">🔄 Unsynced</span>
          )}
          <button className="btn-danger" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="visit-content">
        <div className="main-column">
          {/* Triage Results */}
          {visit.triageResult && (
            <div className="card triage-card">
              <h2>🏥 Triage Assessment</h2>
              <div className="triage-result">
                <div className="priority-indicator" data-priority={visit.triageResult.priority}>
                  <div className="priority-label">Priority Level</div>
                  <div className="priority-value">
                    {visit.triageResult.priority?.toUpperCase() || 'ROUTINE'}
                  </div>
                  <div className="confidence">
                    Confidence: {Math.round((visit.triageResult.confidence || 0.7) * 100)}%
                  </div>
                </div>
                <div className="recommendation">
                  <strong>Recommendation:</strong>
                  <p>{visit.triageResult.recommendation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Symptoms */}
          {visit.symptoms && visit.symptoms.length > 0 && (
            <div className="card">
              <h2>🩺 Symptoms</h2>
              <div className="symptoms-list">
                {visit.symptoms.map((symptom, index) => (
                  <span key={index} className="symptom-tag">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vital Signs */}
          {visit.vitals && Object.values(visit.vitals).some(v => v) && (
            <div className="card">
              <h2>💓 Vital Signs</h2>
              <div className="vitals-grid">
                {visit.vitals.temperature && (
                  <div className="vital-item">
                    <div className="vital-label">Temperature</div>
                    <div className="vital-value">{visit.vitals.temperature}°F</div>
                  </div>
                )}
                {visit.vitals.bloodPressure && (
                  <div className="vital-item">
                    <div className="vital-label">Blood Pressure</div>
                    <div className="vital-value">{visit.vitals.bloodPressure}</div>
                  </div>
                )}
                {visit.vitals.heartRate && (
                  <div className="vital-item">
                    <div className="vital-label">Heart Rate</div>
                    <div className="vital-value">{visit.vitals.heartRate} bpm</div>
                  </div>
                )}
                {visit.vitals.oxygenLevel && (
                  <div className="vital-item">
                    <div className="vital-label">Oxygen Level</div>
                    <div className="vital-value">{visit.vitals.oxygenLevel}%</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images and Vision Analysis */}
          {visit.images && visit.images.length > 0 && (
            <div className="card">
              <h2>📸 Images & Analysis</h2>
              {analyzingImages && (
                <div className="analyzing-banner">
                  ⏳ Analyzing images with AI vision service...
                </div>
              )}
              <div className="images-grid">
                {visit.images.map((image, index) => (
                  <div key={index} className="image-container">
                    <img src={image.data} alt={`Medical ${index + 1}`} />
                    {visit.visionResult?.images?.[index] && (
                      <div className="vision-result">
                        <div className="severity-badge" data-severity={visit.visionResult.images[index].severity}>
                          {visit.visionResult.images[index].severity}
                        </div>
                        <div className="vision-description">
                          {visit.visionResult.images[index].description}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {visit.notes && (
            <div className="card">
              <h2>📝 Clinical Notes</h2>
              <p className="notes-content">{visit.notes}</p>
            </div>
          )}
        </div>

        <div className="side-column">
          {/* Visit Info */}
          <div className="card">
            <h3>Visit Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Created</span>
                <span className="info-value">{formatDate(visit.createdAt)}</span>
              </div>
              {visit.updatedAt && visit.updatedAt !== visit.createdAt && (
                <div className="info-item">
                  <span className="info-label">Updated</span>
                  <span className="info-value">{formatDate(visit.updatedAt)}</span>
                </div>
              )}
              {visit.createdBy && (
                <div className="info-item">
                  <span className="info-label">Created By</span>
                  <span className="info-value">{visit.createdBy}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">
                  {visit.synced ? (
                    <span className="badge badge-success">✓ Synced</span>
                  ) : (
                    <span className="badge badge-warning">🔄 Unsynced</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {visit.phoneNumber && (
            <div className="card">
              <h3>Contact Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{visit.phoneNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VisitDetailPage
