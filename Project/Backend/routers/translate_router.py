from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional, List
from backend.models.schemas import (
    TextTranslationRequest,
    TextTranslationResponse,
    ContinuousTranslationResponse
)
from backend.ai.language_translator import translator
from backend.ai.temporal_recognizer import recognizer
from backend.ai.video_processor import video_processor
from backend.auth import get_optional_current_user

router = APIRouter(prefix="/translate", tags=["Translation"])

@router.post("/text", response_model=TextTranslationResponse)
def translate_text(req: TextTranslationRequest):
    if not req.signs:
        return TextTranslationResponse(raw_sequence=[], english_sentence="", confidence=0.0)

    english = translator.translate_sequence(req.signs)
    return TextTranslationResponse(
        raw_sequence=req.signs,
        english_sentence=english,
        confidence=0.94
    )

@router.post("/video")
async def translate_video(file: UploadFile = File(...)):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty video file provided.")

    result = video_processor.process_video_file(contents, file.filename)
    return result

@router.post("/image")
async def translate_image(file: UploadFile = File(...)):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image file provided.")

    result = video_processor.process_image_file(contents)
    return result
