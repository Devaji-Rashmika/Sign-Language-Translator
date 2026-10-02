import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.ai.temporal_recognizer import recognizer
from backend.ai.language_translator import translator
from backend.config import settings

logger = logging.getLogger("isl_ws")
router = APIRouter(tags=["WebSocket Stream"])

@router.websocket("/ws/stream")
async def websocket_stream_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected for continuous ISL stream")
    
    # State per active continuous session
    recognized_sequence = []
    last_sign = None
    sign_repetition_count = 0
    last_sign_timestamp = 0.0
    completed_sentences = []

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                payload = json.loads(data_text)
            except Exception:
                continue

            landmarks = payload.get("landmarks", {})
            timestamp = payload.get("timestamp", 0.0)

            # Process frame through temporal sequence buffer
            result = recognizer.process_frame({
                "left_hand": landmarks.get("left_hand"),
                "right_hand": landmarks.get("right_hand"),
                "pose": landmarks.get("pose"),
                "face": landmarks.get("face"),
                "timestamp": timestamp
            })

            status = result.get("status", "WAITING")
            pred_sign = result.get("sign")
            confidence = result.get("confidence", 0.0)
            message = result.get("message")
            is_sentence_completed = False
            just_completed_text = None

            # Continuous sequence accumulation & temporal debouncing
            if pred_sign and pred_sign not in ["BLANK", "UNCERTAIN"]:
                if pred_sign == last_sign:
                    sign_repetition_count += 1
                else:
                    last_sign = pred_sign
                    sign_repetition_count = 1

                # If sign is held for at least 3-4 consecutive frames (0.1s), commit to sequence
                if sign_repetition_count == 3:
                    if not recognized_sequence or recognized_sequence[-1] != pred_sign:
                        recognized_sequence.append(pred_sign)
                        last_sign_timestamp = timestamp

            elif pred_sign == "BLANK" or status == "WAITING":
                # Check if user rested hands long enough to trigger sentence boundary
                if recognized_sequence and (timestamp - last_sign_timestamp > settings.SENTENCE_PAUSE_THRESHOLD_SEC):
                    completed_eng = translator.translate_sequence(recognized_sequence)
                    if completed_eng:
                        completed_sentences.append({
                            "signs": list(recognized_sequence),
                            "english": completed_eng,
                            "timestamp": timestamp
                        })
                        is_sentence_completed = True
                        just_completed_text = completed_eng
                    recognized_sequence = []
                    last_sign = None
                    sign_repetition_count = 0

            # Translate current sequence into natural English
            current_english = translator.translate_sequence(recognized_sequence) if recognized_sequence else ""

            response_payload = {
                "recognized_signs": recognized_sequence,
                "current_sign": pred_sign if pred_sign not in ["BLANK", None] else None,
                "english_translation": current_english,
                "current_confidence": confidence,
                "status": status,
                "message": message,
                "is_sentence_completed": is_sentence_completed,
                "completed_sentence": just_completed_text
            }

            await websocket.send_text(json.dumps(response_payload))

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
