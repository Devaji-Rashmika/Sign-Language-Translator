from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Landmark & Continuous AI schemas
class Landmark3D(BaseModel):
    x: float
    y: float
    z: float
    visibility: Optional[float] = 1.0

class FrameLandmarks(BaseModel):
    timestamp: float
    left_hand: Optional[List[Landmark3D]] = None
    right_hand: Optional[List[Landmark3D]] = None
    pose: Optional[List[Landmark3D]] = None
    face: Optional[List[Landmark3D]] = None

class ContinuousStreamFrame(BaseModel):
    frame_id: int
    timestamp: float
    landmarks: FrameLandmarks

class SignPrediction(BaseModel):
    sign: str
    confidence: float
    timestamp: float
    is_segment_break: bool = False

class ContinuousTranslationResponse(BaseModel):
    recognized_signs: List[str]
    english_translation: str
    current_confidence: float
    status: str  # "TRANSLATING", "WAITING", "UNCERTAIN", "NO_PERSON", "HANDS_UNCLEAR"
    message: Optional[str] = None
    is_sentence_completed: bool = False
    completed_sentence: Optional[str] = None

class TextTranslationRequest(BaseModel):
    signs: List[str]

class TextTranslationResponse(BaseModel):
    raw_sequence: List[str]
    english_sentence: str
    confidence: float

# Vocabulary Schemas
class SignVocabularyItem(BaseModel):
    sign_id: str
    label: str
    category: str
    level: int  # 1 to 5
    description: str
    two_handed: bool
    motion: str
    example_sentence: str
    tips: Optional[str] = None

# Practice Schemas
class PracticeSentence(BaseModel):
    id: str
    target_sentence: str
    target_signs: List[str]
    difficulty: str
    category: str
    hint: str

class PracticeEvaluateRequest(BaseModel):
    target_signs: List[str]
    detected_signs: List[str]
    confidences: Optional[List[float]] = None

class PracticeEvaluateResponse(BaseModel):
    target_signs: List[str]
    detected_signs: List[str]
    accuracy_percentage: float
    sign_order_correct: bool
    missing_signs: List[str]
    extra_signs: List[str]
    feedback: str
    passed: bool

# History Schemas
class TranslationHistoryCreate(BaseModel):
    detected_signs: List[str]
    translation: str
    confidence: float

class TranslationHistoryResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    detected_signs: List[str]
    translation: str
    confidence: float
    timestamp: str
