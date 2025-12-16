from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime
import random
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from common.models import ChatMessage, ChatResponse
from common.config import settings

app = FastAPI(
    title="APRHS NLU & Voice Service",
    description="Multilingual chatbot and voice interaction service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple conversation state storage (in production, use Redis or similar)
conversations = {}

# Multilingual responses
GREETINGS = {
    "en": "Hello! I am your AI health assistant. How can I help you today?",
    "hi": "नमस्ते! मैं आपका एआई स्वास्थ्य सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?"
}

SYMPTOM_RESPONSES = {
    "en": {
        "fever": "I understand you have a fever. Can you tell me your temperature and how long you've had it?",
        "cough": "You mentioned a cough. Is it dry or productive? How long have you had it?",
        "headache": "I see you have a headache. Can you describe the pain? Is it mild, moderate, or severe?",
        "pain": "Where is the pain located? Can you rate it on a scale of 1-10?",
        "breathing": "Breathing difficulties can be serious. Are you able to breathe or is it very difficult?",
        "default": "Thank you for sharing. Can you provide more details about your symptoms?"
    },
    "hi": {
        "fever": "मुझे समझ आया कि आपको बुखार है। क्या आप अपना तापमान बता सकते हैं?",
        "cough": "आपने खांसी का उल्लेख किया। यह सूखी है या कफ के साथ?",
        "headache": "मैं देख रहा हूं कि आपको सिरदर्द है। क्या आप दर्द का वर्णन कर सकते हैं?",
        "pain": "दर्द कहाँ है? क्या आप इसे 1-10 के पैमाने पर रेट कर सकते हैं?",
        "breathing": "सांस लेने में कठिनाई गंभीर हो सकती है। क्या आप सांस ले पा रहे हैं?",
        "default": "धन्यवाद। क्या आप अपने लक्षणों के बारे में और बता सकते हैं?"
    }
}

SUGGESTIONS = {
    "en": [
        "I have a fever",
        "I have a cough",
        "I have a headache",
        "I have body pain",
        "I need a doctor"
    ],
    "hi": [
        "मुझे बुखार है",
        "मुझे खांसी है",
        "मुझे सिरदर्द है",
        "मुझे शरीर में दर्द है",
        "मुझे डॉक्टर की जरूरत है"
    ]
}

FOLLOW_UP_QUESTIONS = {
    "en": [
        "How long have you had these symptoms?",
        "Have you taken any medication?",
        "Do you have any other symptoms?",
        "Have you seen a doctor about this?"
    ],
    "hi": [
        "आपको ये लक्षण कब से हैं?",
        "क्या आपने कोई दवा ली है?",
        "क्या आपको कोई अन्य लक्षण हैं?",
        "क्या आपने इस बारे में डॉक्टर को दिखाया है?"
    ]
}


def detect_symptoms(message: str) -> List[str]:
    """Detect symptoms mentioned in the message"""
    message_lower = message.lower()
    symptoms = []
    
    symptom_keywords = {
        "fever": ["fever", "temperature", "बुखार"],
        "cough": ["cough", "coughing", "खांसी"],
        "headache": ["headache", "head pain", "सिरदर्द"],
        "pain": ["pain", "ache", "hurt", "दर्द"],
        "breathing": ["breath", "breathing", "breathless", "सांस"]
    }
    
    for symptom, keywords in symptom_keywords.items():
        if any(keyword in message_lower for keyword in keywords):
            symptoms.append(symptom)
    
    return symptoms


def generate_response(message: str, language: str, conversation_id: str) -> ChatResponse:
    """Generate chatbot response based on message and context"""
    
    # Detect symptoms in message
    symptoms = detect_symptoms(message)
    
    # Get or create conversation context
    if conversation_id not in conversations:
        conversations[conversation_id] = {
            "messages": [],
            "symptoms": [],
            "turn": 0
        }
    
    context = conversations[conversation_id]
    context["messages"].append(message)
    context["symptoms"].extend(symptoms)
    context["turn"] += 1
    
    # Generate response based on detected symptoms
    responses = SYMPTOM_RESPONSES.get(language, SYMPTOM_RESPONSES["en"])
    
    if symptoms:
        # Respond to first detected symptom
        reply = responses.get(symptoms[0], responses["default"])
        suggestions = []  # No suggestions when asking follow-up
    else:
        # General response
        if context["turn"] == 1:
            reply = GREETINGS[language]
            suggestions = SUGGESTIONS.get(language, SUGGESTIONS["en"])[:3]
        elif context["turn"] > 3 and context["symptoms"]:
            # After several turns, suggest seeing a doctor
            if language == "hi":
                reply = "आपके लक्षणों के आधार पर, मैं सुझाव देता हूं कि आप जल्द ही डॉक्टर से परामर्श लें।"
            else:
                reply = "Based on your symptoms, I recommend consulting with a doctor soon."
            suggestions = []
        else:
            # Ask a follow-up question
            follow_ups = FOLLOW_UP_QUESTIONS.get(language, FOLLOW_UP_QUESTIONS["en"])
            reply = random.choice(follow_ups)
            suggestions = []
    
    return ChatResponse(
        reply=reply,
        conversation_id=conversation_id,
        suggestions=suggestions if suggestions else None
    )


@app.get("/")
async def root():
    return {
        "service": "APRHS NLU & Voice Service",
        "version": "1.0.0",
        "status": "operational",
        "languages": ["en", "hi"],
        "model": settings.NLU_MODEL
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/start", response_model=ChatResponse)
async def start_conversation(language: str = "en"):
    """Start a new conversation"""
    conversation_id = f"conv_{int(datetime.now().timestamp() * 1000)}"
    
    greeting = GREETINGS.get(language, GREETINGS["en"])
    suggestions = SUGGESTIONS.get(language, SUGGESTIONS["en"])[:3]
    
    conversations[conversation_id] = {
        "messages": [],
        "symptoms": [],
        "turn": 0
    }
    
    return ChatResponse(
        reply=greeting,
        conversation_id=conversation_id,
        suggestions=suggestions
    )


@app.post("/message", response_model=ChatResponse)
async def send_message(chat_message: ChatMessage):
    """Send a message and get a response"""
    try:
        if not chat_message.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Generate conversation ID if not provided
        conversation_id = chat_message.conversation_id or f"conv_{int(datetime.now().timestamp() * 1000)}"
        
        # Generate response
        response = generate_response(
            chat_message.message,
            chat_message.language,
            conversation_id
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Message processing failed: {str(e)}")


@app.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {
        "languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "hi", "name": "Hindi", "native_name": "हिंदी"}
        ]
    }


@app.delete("/conversation/{conversation_id}")
async def end_conversation(conversation_id: str):
    """End and clear a conversation"""
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"status": "conversation ended", "conversation_id": conversation_id}
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
