import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dbService from '../services/database'
import { triageAPI } from '../services/api'
import '../styles/NewVisitPage.css'

function NewVisitPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    village: '',
    phoneNumber: '',
    symptoms: '',
    vitals: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      oxygenLevel: ''
    },
    notes: '',
    images: []
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleVitalChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [name]: value
      }
    }))
  }

  const handleImageCapture = async (e) => {
    const files = Array.from(e.target.files)
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve({
            data: reader.result,
            name: file.name,
            type: file.type,
            capturedAt: new Date().toISOString()
          })
        }
        reader.readAsDataURL(file)
      })
    })

    const images = await Promise.all(imagePromises)
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...images]
    }))
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parse symptoms
      const symptomsArray = formData.symptoms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      // Create patient record
      const patient = await dbService.createOrUpdatePatient({
        name: formData.patientName,
        age: parseInt(formData.age),
        gender: formData.gender,
        village: formData.village,
        phoneNumber: formData.phoneNumber
      })

      // Create visit record
      const visit = await dbService.createVisit({
        patientId: patient._id,
        patientName: formData.patientName,
        age: parseInt(formData.age),
        gender: formData.gender,
        village: formData.village,
        symptoms: symptomsArray,
        vitals: formData.vitals,
        notes: formData.notes,
        images: formData.images
      })

      // Perform triage if symptoms exist
      if (symptomsArray.length > 0) {
        try {
          const triageResult = await triageAPI.analyzeSymptoms(symptomsArray, {
            age: formData.age,
            gender: formData.gender
          })
          
          // Update visit with triage result
          await dbService.updateVisit(visit._id, {
            triageResult
          })
        } catch (error) {
          console.error('Triage analysis failed:', error)
        }
      }

      // Navigate to visit detail page
      navigate(`/visit/${visit._id}`)
    } catch (error) {
      console.error('Error creating visit:', error)
      alert('Error creating visit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="new-visit-page">
      <div className="page-header">
        <h1>📝 New Patient Visit</h1>
        <p>Create a new visit record (works offline)</p>
      </div>

      <form onSubmit={handleSubmit} className="visit-form">
        <div className="card">
          <h2>Patient Information</h2>
          
          <div className="form-group">
            <label htmlFor="patientName">Patient Name *</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              required
              placeholder="Enter patient name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="0"
                max="120"
                placeholder="Age"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="village">Village *</label>
              <input
                type="text"
                id="village"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                required
                placeholder="Village name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Phone number (optional)"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Symptoms</h2>
          
          <div className="form-group">
            <label htmlFor="symptoms">Symptoms (comma-separated)</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              rows="3"
              placeholder="e.g., fever, cough, headache"
            />
            <small>Separate multiple symptoms with commas</small>
          </div>
        </div>

        <div className="card">
          <h2>Vital Signs</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="temperature">Temperature (°F)</label>
              <input
                type="number"
                id="temperature"
                name="temperature"
                value={formData.vitals.temperature}
                onChange={handleVitalChange}
                step="0.1"
                placeholder="98.6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bloodPressure">Blood Pressure</label>
              <input
                type="text"
                id="bloodPressure"
                name="bloodPressure"
                value={formData.vitals.bloodPressure}
                onChange={handleVitalChange}
                placeholder="120/80"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="heartRate">Heart Rate (bpm)</label>
              <input
                type="number"
                id="heartRate"
                name="heartRate"
                value={formData.vitals.heartRate}
                onChange={handleVitalChange}
                placeholder="72"
              />
            </div>

            <div className="form-group">
              <label htmlFor="oxygenLevel">Oxygen Level (%)</label>
              <input
                type="number"
                id="oxygenLevel"
                name="oxygenLevel"
                value={formData.vitals.oxygenLevel}
                onChange={handleVitalChange}
                min="0"
                max="100"
                placeholder="98"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2>📸 Photos/Images</h2>
          
          <div className="form-group">
            <label htmlFor="images">Capture or Upload Images</label>
            <input
              type="file"
              id="images"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleImageCapture}
            />
            <small>Capture photos of wounds, rashes, or other visible symptoms</small>
          </div>

          {formData.images.length > 0 && (
            <div className="image-preview-grid">
              {formData.images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={image.data} alt={`Captured ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Additional Notes</h2>
          
          <div className="form-group">
            <label htmlFor="notes">Clinical Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Any additional observations or notes..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/visits')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : '💾 Save Visit'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewVisitPage
