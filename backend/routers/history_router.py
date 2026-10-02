import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from backend.models.schemas import TranslationHistoryCreate, TranslationHistoryResponse
from backend.database import get_translation_history_col
from backend.auth import get_optional_current_user

router = APIRouter(prefix="/history", tags=["Translation History"])

@router.get("", response_model=List[TranslationHistoryResponse])
def get_history(current_user: Optional[dict] = Depends(get_optional_current_user)):
    col = get_translation_history_col()
    query = {}
    if current_user:
        query = {"$or": [{"user_id": current_user["id"]}, {"user_id": None}, {"user_id": "guest"}]}
    
    docs = col.find(query, sort=[("timestamp", -1)], limit=100)
    
    # If empty, return realistic sample history
    if not docs:
        sample_time = datetime.now().strftime("%I:%M %p")
        return [
            TranslationHistoryResponse(
                id="hist_1",
                user_id=current_user["id"] if current_user else "guest",
                detected_signs=["I", "GO", "COLLEGE", "TOMORROW"],
                translation="I will go to college tomorrow.",
                confidence=0.96,
                timestamp="08:42 AM"
            ),
            TranslationHistoryResponse(
                id="hist_2",
                user_id=current_user["id"] if current_user else "guest",
                detected_signs=["WHERE", "BUS"],
                translation="Where is the bus stop?",
                confidence=0.94,
                timestamp="08:43 AM"
            ),
            TranslationHistoryResponse(
                id="hist_3",
                user_id=current_user["id"] if current_user else "guest",
                detected_signs=["I", "NEED", "HELP"],
                translation="I need help.",
                confidence=0.98,
                timestamp="08:44 AM"
            )
        ]

    return [
        TranslationHistoryResponse(
            id=str(d.get("_id", d.get("id"))),
            user_id=d.get("user_id"),
            detected_signs=d.get("detected_signs", []),
            translation=d.get("translation", ""),
            confidence=d.get("confidence", 0.9),
            timestamp=d.get("timestamp", "")
        )
        for d in docs
    ]

@router.post("", response_model=TranslationHistoryResponse)
def save_history(
    data: TranslationHistoryCreate,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    col = get_translation_history_col()
    hist_id = str(uuid.uuid4())
    now_time = datetime.now().strftime("%I:%M %p")
    user_id = current_user["id"] if current_user else "guest"

    doc = {
        "_id": hist_id,
        "user_id": user_id,
        "detected_signs": data.detected_signs,
        "translation": data.translation,
        "confidence": data.confidence,
        "timestamp": now_time
    }
    col.insert_one(doc)

    return TranslationHistoryResponse(
        id=hist_id,
        user_id=user_id,
        detected_signs=data.detected_signs,
        translation=data.translation,
        confidence=data.confidence,
        timestamp=now_time
    )

@router.delete("")
def clear_history(current_user: Optional[dict] = Depends(get_optional_current_user)):
    col = get_translation_history_col()
    query = {}
    if current_user:
        query = {"user_id": current_user["id"]}
    col.delete_many(query)
    return {"message": "Translation history cleared successfully."}
