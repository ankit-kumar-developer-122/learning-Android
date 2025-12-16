# NLU & Voice Service

Multilingual Natural Language Understanding and voice interaction service for APRHS.

## Features

- **Multilingual Support**: English and Hindi (extensible to more languages)
- **Symptom Detection**: Automatic identification of health symptoms
- **Conversational AI**: Context-aware dialogue management
- **Voice Integration**: Works with Web Speech API
- **Suggestion System**: Quick-response buttons for common queries
- **RESTful API**: Easy integration with frontend

## Installation

```bash
pip install -r ../../requirements.txt
```

## Running the Service

```bash
python main.py
```

The service will start on `http://localhost:8003`

## API Endpoints

### POST /start
Start a new conversation

**Request:**
```json
{
  "language": "en"
}
```

**Response:**
```json
{
  "reply": "Hello! I am your AI health assistant. How can I help you today?",
  "conversation_id": "conv_1705320000000",
  "suggestions": ["I have a fever", "I have a cough", "I have a headache"]
}
```

### POST /message
Send a message and get a response

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
  "reply": "I understand you have a fever. Can you tell me your temperature and how long you've had it?",
  "conversation_id": "conv_1705320000000",
  "suggestions": null
}
```

### GET /languages
Get list of supported languages

### DELETE /conversation/{id}
End and clear a conversation

### GET /health
Health check endpoint

## Supported Languages

- **English (en)**: Full support
- **Hindi (hi)**: Full support with Devanagari script

## Symptom Detection

The service can detect and respond to:
- Fever (बुखार)
- Cough (खांसी)
- Headache (सिरदर्द)
- Pain (दर्द)
- Breathing difficulties (सांस की समस्या)

## Integration

### With GramAarogya
This service incorporates multilingual chatbot patterns from [GramAarogya](https://github.com/Sid3503/GramAarogya) with enhanced NLU capabilities.

### With Web Speech API
- Frontend uses Web Speech API for voice input
- Service processes transcribed text
- Language-specific speech recognition (hi-IN, en-US)

### With Frontend Chatbot
```javascript
// Start conversation
const response = await chatbotAPI.startConversation('hi')

// Send message
const reply = await chatbotAPI.sendMessage(
  'मुझे बुखार है',
  'hi',
  conversationId
)
```

## Current Implementation

This is a **rule-based conversational system** with:
- Pattern matching for symptom detection
- Context tracking across conversation turns
- Multilingual response templates
- Follow-up question generation

## Future Enhancements

### Advanced NLU
- [ ] Transformer-based intent classification
- [ ] Named entity recognition for medical terms
- [ ] Sentiment analysis
- [ ] Multi-turn dialogue management with RASA

### Language Expansion
- [ ] Tamil
- [ ] Telugu
- [ ] Bengali
- [ ] Marathi
- [ ] Additional regional languages

### Voice Features
- [ ] Server-side speech-to-text
- [ ] Text-to-speech response playback
- [ ] Accent and dialect support
- [ ] Emotion detection from voice

### Medical Knowledge
- [ ] Integration with medical knowledge bases
- [ ] Drug interaction checking
- [ ] Symptom-disease mapping
- [ ] Treatment recommendations

## Performance

- **Latency**: < 100ms per message
- **Languages**: 2 (English, Hindi)
- **Conversation Memory**: In-memory (use Redis for production)
- **Concurrent Conversations**: Unlimited (memory permitting)

## Best Practices

1. **Keep messages short**: Better for voice input
2. **Use suggestions**: Guide users to relevant topics
3. **Confirm understanding**: Repeat back key information
4. **Escalate when needed**: Know when to recommend human doctor

## License

MIT
