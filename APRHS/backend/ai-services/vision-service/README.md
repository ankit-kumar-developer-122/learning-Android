# Vision Service

AI-powered wound and skin condition analysis service for APRHS.

## Features

- **Image Analysis**: Automated wound/skin condition assessment
- **Severity Classification**: Mild, Moderate, Severe
- **Clinical Recommendations**: AI-generated care suggestions
- **Multiple Formats**: Support for file upload and base64 encoded images
- **RESTful API**: Easy integration with frontend

## Installation

```bash
pip install -r ../../requirements.txt
```

## Running the Service

```bash
python main.py
```

The service will start on `http://localhost:8002`

## API Endpoints

### POST /analyze
Analyze uploaded image file

**Request:**
```
POST /analyze
Content-Type: multipart/form-data

image: [image file]
type: "wound"
```

**Response:**
```json
{
  "severity": "moderate",
  "confidence": 0.70,
  "description": "Moderate skin condition detected. Requires medical attention.",
  "recommendations": [
    "Consult healthcare provider within 24-48 hours",
    "Clean affected area gently",
    "Apply prescribed antiseptic if available",
    "Monitor for worsening symptoms"
  ],
  "analyzed_at": "2024-01-15T10:30:00"
}
```

### POST /analyze-base64
Analyze base64 encoded image

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "type": "wound"
}
```

### GET /supported-types
Get list of supported analysis types

### GET /health
Health check endpoint

## Current Implementation

This service currently uses a **placeholder analysis** based on image characteristics. For production deployment, integrate:

### CO2Dnet Integration
Based on [CO2Dnet](https://github.com/simatec-uis/CO2Dnet) for wound assessment:

1. **Download CO2Dnet Model**
   ```bash
   git clone https://github.com/simatec-uis/CO2Dnet.git
   cd CO2Dnet
   # Follow their setup instructions
   ```

2. **Update main.py**
   - Replace `analyze_image_placeholder()` with CO2Dnet inference
   - Load pre-trained model weights
   - Add image preprocessing pipeline

3. **Docker Integration**
   ```dockerfile
   FROM python:3.9
   # Install CO2Dnet dependencies
   # Copy model weights
   # Run inference server
   ```

## Severity Levels

- **Mild**: Minor conditions, basic care sufficient
- **Moderate**: Requires medical attention within 24-48 hours
- **Severe**: Immediate medical consultation required

## Supported Image Types

- Wounds (cuts, lacerations)
- Burns
- Rashes
- Skin lesions
- Infections

## Integration Points

### With CO2Dnet
- Wound segmentation and assessment
- Severity scoring
- Healing progress tracking

### With Frontend
- Real-time image capture from mobile devices
- Offline image storage with sync
- Visual feedback and annotations

## Future Enhancements

- [ ] Real CO2Dnet model integration
- [ ] Multi-image comparison
- [ ] Healing progress tracking
- [ ] 3D wound mapping
- [ ] Infection prediction
- [ ] Doctor annotation feedback loop

## Performance

- **Latency**: < 2 seconds per image
- **Accuracy**: Placeholder ~65-75%, CO2Dnet target >85%
- **Supported Formats**: JPEG, PNG
- **Max Image Size**: 10MB

## License

MIT
