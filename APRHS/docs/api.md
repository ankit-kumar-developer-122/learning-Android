# APRHS API Reference

Complete API documentation for all APRHS microservices.

## Base URLs

- **Triage Service**: `http://localhost:8001`
- **Vision Service**: `http://localhost:8002`
- **NLU/Voice Service**: `http://localhost:8003`

## Authentication

Currently, services are open for development. Production deployment should use JWT authentication:

```http
Authorization: Bearer <token>
```

## Triage Service API

### POST /analyze

Analyze symptoms and return triage priority.

**Request:**
```json
{
  "symptoms": ["fever", "cough", "headache"],
  "patient": {
    "age": 45,
    "gender": "male"
  }
}
```

**Response:**
```json
{
  "priority": "moderate",
  "recommendation": "Schedule appointment with doctor within 2-3 days.",
  "confidence": 0.75,
  "symptoms": ["fever", "cough", "headache"],
  "color": "yellow",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Priority Levels:**
- `emergency` - Immediate attention required
- `urgent` - Within 24 hours
- `moderate` - Within 2-3 days
- `routine` - Regular checkup

### POST /batch-analyze

Analyze multiple cases.

**Request:**
```json
[
  {
    "symptoms": ["fever"],
    "patient": {"age": 30, "gender": "female"}
  },
  {
    "symptoms": ["chest pain"],
    "patient": {"age": 60, "gender": "male"}
  }
]
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Vision Service API

### POST /analyze

Analyze uploaded medical image.

**Request:**
```http
POST /analyze
Content-Type: multipart/form-data

image: [file]
type: "wound"
```

**Response:**
```json
{
  "severity": "moderate",
  "confidence": 0.70,
  "description": "Moderate skin condition detected.",
  "recommendations": [
    "Consult healthcare provider within 24-48 hours",
    "Clean affected area gently",
    "Apply prescribed antiseptic if available"
  ],
  "analyzed_at": "2024-01-15T10:30:00.000Z"
}
```

### POST /analyze-base64

Analyze base64 encoded image.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "type": "wound"
}
```

**Response:** Same as `/analyze`

### GET /supported-types

Get supported image types.

**Response:**
```json
{
  "types": [
    {
      "id": "wound",
      "name": "Wound Assessment",
      "description": "Analyze cuts, burns, and wounds"
    },
    {
      "id": "rash",
      "name": "Rash Detection",
      "description": "Identify skin rashes"
    }
  ]
}
```

## NLU/Voice Service API

### POST /start

Start a new conversation.

**Request:**
```json
{
  "language": "en"
}
```

**Response:**
```json
{
  "reply": "Hello! I am your AI health assistant.",
  "conversation_id": "conv_1705320000000",
  "suggestions": [
    "I have a fever",
    "I have a cough",
    "I have a headache"
  ]
}
```

### POST /message

Send a message and get response.

**Request:**
```json
{
  "message": "I have a fever and headache",
  "language": "en",
  "conversation_id": "conv_1705320000000"
}
```

**Response:**
```json
{
  "reply": "I understand you have a fever. Can you tell me your temperature?",
  "conversation_id": "conv_1705320000000",
  "suggestions": null
}
```

### GET /languages

Get supported languages.

**Response:**
```json
{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "native_name": "English"
    },
    {
      "code": "hi",
      "name": "Hindi",
      "native_name": "हिंदी"
    }
  ]
}
```

### DELETE /conversation/{id}

End a conversation.

**Response:**
```json
{
  "status": "conversation ended",
  "conversation_id": "conv_1705320000000"
}
```

## Error Responses

All services return errors in this format:

```json
{
  "detail": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Production deployments should implement rate limiting:

- 100 requests per minute per IP
- 1000 requests per hour per user

## CORS

All services support CORS for:
- `http://localhost:3000`
- `http://localhost:5173`
- Production domains (configure in settings)

## WebSocket Support

Future versions will support WebSocket for:
- Real-time notifications
- Live sync status
- Chat streaming

## Versioning

API versioning follows semantic versioning:
- Current version: `v1`
- Breaking changes will increment major version
- New endpoints increment minor version

## SDK Examples

### JavaScript/TypeScript

```javascript
import axios from 'axios'

const triageAPI = {
  analyze: async (symptoms, patient) => {
    const response = await axios.post('http://localhost:8001/analyze', {
      symptoms,
      patient
    })
    return response.data
  }
}
```

### Python

```python
import requests

def analyze_symptoms(symptoms, patient):
    response = requests.post(
        'http://localhost:8001/analyze',
        json={'symptoms': symptoms, 'patient': patient}
    )
    return response.json()
```

### curl

```bash
# Triage analysis
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever"], "patient": {"age": 30, "gender": "male"}}'

# Image analysis
curl -X POST http://localhost:8002/analyze \
  -F "image=@wound.jpg" \
  -F "type=wound"

# Chatbot
curl -X POST http://localhost:8003/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I have a fever", "language": "en"}'
```

## Interactive Documentation

Each service provides interactive API documentation:

- Triage: http://localhost:8001/docs
- Vision: http://localhost:8002/docs
- NLU: http://localhost:8003/docs

Built with FastAPI's automatic OpenAPI/Swagger UI.

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0
