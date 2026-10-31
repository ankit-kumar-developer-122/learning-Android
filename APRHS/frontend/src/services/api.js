import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Triage Service API
export const triageAPI = {
  analyzeSymptoms: async (symptoms, patientData) => {
    try {
      const response = await apiClient.post('/triage/analyze', {
        symptoms,
        patient: patientData
      })
      return response.data
    } catch (error) {
      console.error('Triage API error:', error)
      // Fallback to simple rule-based triage if API fails
      return performLocalTriage(symptoms)
    }
  }
}

// Vision Service API
export const visionAPI = {
  analyzeImage: async (imageData, imageType = 'wound') => {
    try {
      const formData = new FormData()
      formData.append('image', imageData)
      formData.append('type', imageType)

      const response = await apiClient.post('/vision/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Vision API error:', error)
      // Return placeholder result if API fails
      return {
        severity: 'moderate',
        confidence: 0.5,
        description: 'Image uploaded - awaiting analysis',
        recommendations: ['Consult with healthcare provider']
      }
    }
  }
}

// Chatbot/NLU Service API
export const chatbotAPI = {
  sendMessage: async (message, language = 'en', conversationId = null) => {
    try {
      const response = await apiClient.post('/chatbot/message', {
        message,
        language,
        conversationId
      })
      return response.data
    } catch (error) {
      console.error('Chatbot API error:', error)
      return {
        reply: 'I apologize, but I am currently unavailable. Please try again later.',
        conversationId: conversationId || `conv_${Date.now()}`
      }
    }
  },

  startConversation: async (language = 'en') => {
    try {
      const response = await apiClient.post('/chatbot/start', { language })
      return response.data
    } catch (error) {
      console.error('Chatbot start error:', error)
      return {
        conversationId: `conv_${Date.now()}`,
        greeting: 'Hello! How can I help you today?'
      }
    }
  }
}

// Notification Service API
export const notificationAPI = {
  subscribe: async (subscription) => {
    try {
      const response = await apiClient.post('/notifications/subscribe', subscription)
      return response.data
    } catch (error) {
      console.error('Notification subscribe error:', error)
      throw error
    }
  }
}

// Dashboard/Analytics API
export const analyticsAPI = {
  getVillageStats: async (village = null) => {
    try {
      const params = village ? { village } : {}
      const response = await apiClient.get('/analytics/village-stats', { params })
      return response.data
    } catch (error) {
      console.error('Analytics API error:', error)
      // Return mock data if API fails
      return generateMockAnalytics()
    }
  },

  getOutbreakAlerts: async () => {
    try {
      const response = await apiClient.get('/analytics/outbreak-alerts')
      return response.data
    } catch (error) {
      console.error('Outbreak alerts API error:', error)
      return []
    }
  }
}

// Local fallback triage function (rule-based)
function performLocalTriage(symptoms) {
  const emergencySymptoms = [
    'chest pain',
    'difficulty breathing',
    'severe bleeding',
    'loss of consciousness',
    'severe head injury'
  ]

  const urgentSymptoms = [
    'high fever',
    'severe pain',
    'vomiting',
    'dehydration'
  ]

  const symptomsLower = symptoms.map(s => s.toLowerCase())

  const hasEmergency = emergencySymptoms.some(es => 
    symptomsLower.some(s => s.includes(es))
  )

  const hasUrgent = urgentSymptoms.some(us => 
    symptomsLower.some(s => s.includes(us))
  )

  let priority = 'routine'
  let recommendation = 'Schedule regular checkup'
  let color = 'green'

  if (hasEmergency) {
    priority = 'emergency'
    recommendation = 'Immediate medical attention required - call ambulance or visit ER'
    color = 'red'
  } else if (hasUrgent) {
    priority = 'urgent'
    recommendation = 'Seek medical attention within 24 hours'
    color = 'orange'
  } else if (symptoms.length > 0) {
    priority = 'moderate'
    recommendation = 'Schedule appointment with doctor soon'
    color = 'yellow'
  }

  return {
    priority,
    recommendation,
    color,
    confidence: 0.7,
    symptoms: symptomsLower,
    timestamp: new Date().toISOString()
  }
}

// Mock analytics data generator
function generateMockAnalytics() {
  return {
    totalVisits: Math.floor(Math.random() * 500) + 100,
    totalPatients: Math.floor(Math.random() * 300) + 50,
    activeVHWs: Math.floor(Math.random() * 20) + 5,
    villages: Math.floor(Math.random() * 10) + 3,
    emergencyCases: Math.floor(Math.random() * 20),
    trends: [
      { date: '2024-01-01', visits: 45 },
      { date: '2024-01-02', visits: 52 },
      { date: '2024-01-03', visits: 48 },
      { date: '2024-01-04', visits: 61 },
      { date: '2024-01-05', visits: 55 },
      { date: '2024-01-06', visits: 43 },
      { date: '2024-01-07', visits: 58 }
    ],
    commonSymptoms: [
      { symptom: 'Fever', count: 89 },
      { symptom: 'Cough', count: 76 },
      { symptom: 'Headache', count: 54 },
      { symptom: 'Body Pain', count: 43 },
      { symptom: 'Fatigue', count: 38 }
    ]
  }
}

export default apiClient
