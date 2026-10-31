from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime
import base64
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from common.models import VisionRequest, VisionResult
from common.config import settings

app = FastAPI(
    title="APRHS Vision Service",
    description="AI-powered wound and skin condition analysis",
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


def analyze_image_placeholder(image_data: str, image_type: str = "wound") -> VisionResult:
    """
    Placeholder image analysis function
    In production, this would use CO2Dnet or similar model
    """
    # Simple placeholder logic based on image size
    image_size = len(image_data)
    
    # Simulate analysis based on image characteristics
    if image_size > 500000:  # Large image
        severity = "severe"
        confidence = 0.75
        description = "Large affected area detected. Significant skin damage visible."
        recommendations = [
            "Immediate medical consultation required",
            "Keep area clean and covered",
            "Do not apply any ointments without doctor advice",
            "Monitor for signs of infection"
        ]
    elif image_size > 200000:  # Medium image
        severity = "moderate"
        confidence = 0.70
        description = "Moderate skin condition detected. Requires medical attention."
        recommendations = [
            "Consult healthcare provider within 24-48 hours",
            "Clean affected area gently",
            "Apply prescribed antiseptic if available",
            "Monitor for worsening symptoms"
        ]
    else:  # Small image or mild condition
        severity = "mild"
        confidence = 0.65
        description = "Minor skin condition detected. Appears manageable with basic care."
        recommendations = [
            "Monitor the affected area",
            "Keep area clean and dry",
            "Apply basic first aid as needed",
            "Consult doctor if condition worsens"
        ]
    
    return VisionResult(
        severity=severity,
        confidence=confidence,
        description=description,
        recommendations=recommendations,
        analyzed_at=datetime.now()
    )


@app.get("/")
async def root():
    return {
        "service": "APRHS Vision Service",
        "version": "1.0.0",
        "status": "operational",
        "model": settings.VISION_MODEL,
        "note": "Currently using placeholder analysis. Integrate CO2Dnet for production."
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/analyze", response_model=VisionResult)
async def analyze_image(
    image: UploadFile = File(...),
    type: str = Form("wound")
):
    """
    Analyze uploaded medical image (wound, rash, skin condition)
    """
    try:
        # Read image file
        image_data = await image.read()
        
        # Convert to base64 for processing
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Analyze image
        result = analyze_image_placeholder(image_base64, type)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


@app.post("/analyze-base64", response_model=VisionResult)
async def analyze_base64_image(request: VisionRequest):
    """
    Analyze base64 encoded image
    """
    try:
        # Remove data URL prefix if present
        image_data = request.image
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
        
        # Analyze image
        result = analyze_image_placeholder(image_data, request.type)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


@app.get("/supported-types")
async def get_supported_types():
    """
    Get list of supported image analysis types
    """
    return {
        "types": [
            {"id": "wound", "name": "Wound Assessment", "description": "Analyze cuts, burns, and wounds"},
            {"id": "rash", "name": "Rash Detection", "description": "Identify skin rashes and conditions"},
            {"id": "lesion", "name": "Lesion Analysis", "description": "Analyze skin lesions"},
            {"id": "burn", "name": "Burn Assessment", "description": "Evaluate burn severity"},
            {"id": "infection", "name": "Infection Detection", "description": "Detect signs of infection"}
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
