from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from common.models import TriageRequest, TriageResult, Priority
from common.config import settings

app = FastAPI(
    title="APRHS Triage Service",
    description="AI-powered symptom triage and prioritization",
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


# Rule-based triage logic
EMERGENCY_SYMPTOMS = [
    "chest pain", "difficulty breathing", "severe bleeding",
    "loss of consciousness", "severe head injury", "stroke symptoms",
    "heart attack", "unable to breathe", "choking"
]

URGENT_SYMPTOMS = [
    "high fever", "severe pain", "vomiting", "dehydration",
    "severe headache", "seizure", "broken bone", "deep cut",
    "severe burn", "allergic reaction"
]

MODERATE_SYMPTOMS = [
    "fever", "persistent cough", "body pain", "diarrhea",
    "mild headache", "rash", "nausea", "sore throat"
]


def analyze_symptoms_rule_based(symptoms: List[str], patient_data: Dict[str, Any]) -> TriageResult:
    """
    Rule-based triage system
    Analyzes symptoms and returns priority level with recommendations
    """
    symptoms_lower = [s.lower().strip() for s in symptoms]
    
    # Check for emergency symptoms
    has_emergency = any(
        any(emergency in symptom for emergency in EMERGENCY_SYMPTOMS)
        for symptom in symptoms_lower
    )
    
    # Check for urgent symptoms
    has_urgent = any(
        any(urgent in symptom for urgent in URGENT_SYMPTOMS)
        for symptom in symptoms_lower
    )
    
    # Check for moderate symptoms
    has_moderate = any(
        any(moderate in symptom for moderate in MODERATE_SYMPTOMS)
        for symptom in symptoms_lower
    )
    
    # Determine priority
    if has_emergency:
        priority = Priority.EMERGENCY
        recommendation = "⚠️ IMMEDIATE MEDICAL ATTENTION REQUIRED - Call ambulance or visit emergency room immediately"
        color = "red"
        confidence = 0.9
    elif has_urgent:
        priority = Priority.URGENT
        recommendation = "Seek medical attention within 24 hours. Contact nearest health center or doctor."
        color = "orange"
        confidence = 0.8
    elif has_moderate:
        priority = Priority.MODERATE
        recommendation = "Schedule appointment with doctor within 2-3 days. Monitor symptoms."
        color = "yellow"
        confidence = 0.75
    elif len(symptoms) > 0:
        priority = Priority.ROUTINE
        recommendation = "Schedule routine checkup. Symptoms appear mild but should be monitored."
        color = "yellow"
        confidence = 0.7
    else:
        priority = Priority.ROUTINE
        recommendation = "No urgent symptoms detected. Regular health checkup recommended."
        color = "green"
        confidence = 0.85
    
    # Adjust for patient factors
    age = patient_data.get("age", 0)
    if age < 5 or age > 65:
        if priority == Priority.MODERATE:
            priority = Priority.URGENT
            recommendation = f"Due to age ({age}), elevated to URGENT. " + recommendation
            confidence = min(confidence + 0.1, 0.95)
    
    return TriageResult(
        priority=priority,
        recommendation=recommendation,
        confidence=confidence,
        symptoms=symptoms_lower,
        color=color,
        timestamp=datetime.now()
    )


@app.get("/")
async def root():
    return {
        "service": "APRHS Triage Service",
        "version": "1.0.0",
        "status": "operational",
        "model": settings.TRIAGE_MODEL
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/analyze", response_model=TriageResult)
async def analyze_symptoms(request: TriageRequest):
    """
    Analyze symptoms and return triage priority
    """
    try:
        if not request.symptoms:
            raise HTTPException(status_code=400, detail="No symptoms provided")
        
        # Use rule-based analysis
        result = analyze_symptoms_rule_based(request.symptoms, request.patient)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Triage analysis failed: {str(e)}")


@app.post("/batch-analyze")
async def batch_analyze(requests: List[TriageRequest]):
    """
    Analyze multiple symptom sets in batch
    """
    try:
        results = []
        for request in requests:
            result = analyze_symptoms_rule_based(request.symptoms, request.patient)
            results.append(result)
        
        return {"results": results, "count": len(results)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
