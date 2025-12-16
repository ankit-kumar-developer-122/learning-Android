# Triage Service

AI-powered symptom triage and prioritization service for APRHS.

## Features

- **Rule-Based Triage**: Fast, reliable symptom classification
- **Priority Levels**: Emergency, Urgent, Moderate, Routine
- **Age-Adjusted**: Considers patient age for priority adjustment
- **Batch Processing**: Analyze multiple cases simultaneously
- **RESTful API**: Easy integration with frontend

## Installation

```bash
pip install -r ../../requirements.txt
```

## Running the Service

```bash
python main.py
```

The service will start on `http://localhost:8001`

## API Endpoints

### POST /analyze
Analyze symptoms and return triage priority

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
  "timestamp": "2024-01-15T10:30:00"
}
```

### POST /batch-analyze
Analyze multiple symptom sets

### GET /health
Health check endpoint

## Symptom Classification

### Emergency (Red)
- Chest pain
- Difficulty breathing
- Severe bleeding
- Loss of consciousness
- Severe head injury
- Stroke symptoms

### Urgent (Orange)
- High fever
- Severe pain
- Persistent vomiting
- Severe dehydration
- Seizures
- Deep cuts

### Moderate (Yellow)
- Fever
- Persistent cough
- Body pain
- Diarrhea
- Mild headache
- Rash

### Routine (Green)
- Mild symptoms
- General checkup
- No urgent concerns

## Integration

### With Gramin-Ai
This service extends concepts from [Gramin-Ai](https://github.com/sajidkhnx/Gramin-Ai) with enhanced rule-based logic and RESTful API design.

### With IMAS
Incorporates triage workflow patterns from [IMAS](https://github.com/uheal/IMAS) for structured symptom analysis.

## Future Enhancements

- [ ] LLM-based triage using GPT/BERT
- [ ] Multi-language symptom recognition
- [ ] Medical knowledge graph integration
- [ ] Historical data learning
- [ ] Doctor feedback loop

## License

MIT
