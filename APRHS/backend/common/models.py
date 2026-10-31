from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class Priority(str, Enum):
    EMERGENCY = "emergency"
    URGENT = "urgent"
    MODERATE = "moderate"
    ROUTINE = "routine"


class Patient(BaseModel):
    id: Optional[str] = None
    name: str
    age: int
    gender: Gender
    village: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Vitals(BaseModel):
    temperature: Optional[float] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    oxygen_level: Optional[int] = None


class MedicalImage(BaseModel):
    data: str  # Base64 encoded image
    name: str
    type: str
    captured_at: datetime


class TriageResult(BaseModel):
    priority: Priority
    recommendation: str
    confidence: float
    symptoms: List[str]
    timestamp: datetime = Field(default_factory=datetime.now)
    color: str = "green"


class VisionResult(BaseModel):
    severity: str
    confidence: float
    description: str
    recommendations: List[str]
    analyzed_at: datetime = Field(default_factory=datetime.now)


class Visit(BaseModel):
    id: Optional[str] = None
    patient_id: str
    patient_name: str
    age: int
    gender: Gender
    village: str
    symptoms: List[str] = []
    vitals: Vitals = Field(default_factory=Vitals)
    images: List[MedicalImage] = []
    notes: str = ""
    triage_result: Optional[TriageResult] = None
    vision_result: Optional[Dict[str, Any]] = None
    synced: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    created_by: str = "VHW"


class TriageRequest(BaseModel):
    symptoms: List[str]
    patient: Dict[str, Any]


class VisionRequest(BaseModel):
    image: str  # Base64 encoded
    type: str = "wound"


class ChatMessage(BaseModel):
    message: str
    language: str = "en"
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    suggestions: Optional[List[str]] = None


class User(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "vhw"  # vhw, doctor, admin
    village: Optional[str] = None
    disabled: bool = False


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
