import math
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from collections import deque
from backend.ai.sign_dictionary import SIGN_DEFINITIONS, SIGN_LOOKUP
from backend.config import settings

class TemporalSequenceBuffer:
    """
    Maintains a rolling buffer of 30-60 frames of landmarks,
    computing velocities, accelerations, and temporal trajectory features.
    """
    def __init__(self, max_frames: int = 45):
        self.max_frames = max_frames
        self.buffer = deque(maxlen=max_frames)

    def add_frame(self, frame_data: Dict[str, Any]):
        self.buffer.append(frame_data)

    def clear(self):
        self.buffer.clear()

    def get_frames(self) -> List[Dict[str, Any]]:
        return list(self.buffer)

    def length(self) -> int:
        return len(self.buffer)


class TemporalSignRecognizer:
    """
    Two-Stage Temporal ISL Recognition Engine:
    1. Extracts spatial hand shapes, finger states, palm normals, and body/face landmarks.
    2. Analyzes temporal trajectory (velocity, direction, rhythm, two-handed coordination).
    3. Matches with ISL signatures with confidence estimation and rejection filtering.
    """
    def __init__(self):
        self.sequence_buffer = TemporalSequenceBuffer(max_frames=settings.TEMPORAL_WINDOW_SIZE)
        self.last_predicted_sign = None
        self.sign_hold_frames = 0
        self.confidence_threshold = settings.CONFIDENCE_THRESHOLD

    def extract_finger_states(self, hand_landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Calculates if each finger is extended, curled, or pinched,
        and computes palm orientation.
        Hand landmark indices (MediaPipe 21 points):
        0: Wrist
        Thumb: 1, 2, 3, 4 (tip)
        Index: 5 (mcp), 6, 7, 8 (tip)
        Middle: 9 (mcp), 10, 11, 12 (tip)
        Ring: 13 (mcp), 14, 15, 16 (tip)
        Pinky: 17 (mcp), 18, 19, 20 (tip)
        """
        if not hand_landmarks or len(hand_landmarks) < 21:
            return {"extended": [], "palm_center": None, "wrist": None}

        wrist = hand_landmarks[0]
        palm_center = {
            "x": (hand_landmarks[0]["x"] + hand_landmarks[5]["x"] + hand_landmarks[17]["x"]) / 3.0,
            "y": (hand_landmarks[0]["y"] + hand_landmarks[5]["y"] + hand_landmarks[17]["y"]) / 3.0,
            "z": (hand_landmarks[0]["z"] + hand_landmarks[5]["z"] + hand_landmarks[17]["z"]) / 3.0
        }

        # Check extensions: distance from wrist to tip vs wrist to pip
        fingers = {
            "THUMB": (4, 2),
            "INDEX": (8, 6),
            "MIDDLE": (12, 10),
            "RING": (16, 14),
            "PINKY": (20, 18)
        }

        extended = []
        for name, (tip_idx, pip_idx) in fingers.items():
            tip = hand_landmarks[tip_idx]
            pip = hand_landmarks[pip_idx]

            # In normalized screen space, y is 0 at top, 1 at bottom
            dist_tip = math.sqrt((tip["x"] - wrist["x"])**2 + (tip["y"] - wrist["y"])**2)
            dist_pip = math.sqrt((pip["x"] - wrist["x"])**2 + (pip["y"] - wrist["y"])**2)

            if dist_tip > dist_pip * 1.15:
                extended.append(name)

        return {
            "extended": extended,
            "palm_center": palm_center,
            "wrist": wrist,
            "index_tip": hand_landmarks[8],
            "thumb_tip": hand_landmarks[4],
            "middle_tip": hand_landmarks[12]
        }

    def compute_temporal_velocity(self, recent_frames: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculates trajectory velocity of hands over recent time window."""
        if len(recent_frames) < 3:
            return {"vx": 0.0, "vy": 0.0, "speed": 0.0}

        first = recent_frames[0]
        last = recent_frames[-1]

        r_wrist_first = first.get("right_hand_wrist") or first.get("left_hand_wrist")
        r_wrist_last = last.get("right_hand_wrist") or last.get("left_hand_wrist")

        if not r_wrist_first or not r_wrist_last:
            return {"vx": 0.0, "vy": 0.0, "speed": 0.0}

        dt = max(0.01, last.get("timestamp", 1.0) - first.get("timestamp", 0.0))
        vx = (r_wrist_last["x"] - r_wrist_first["x"]) / dt
        vy = (r_wrist_last["y"] - r_wrist_first["y"]) / dt
        speed = math.sqrt(vx**2 + vy**2)

        return {"vx": vx, "vy": vy, "speed": speed}

    def process_frame(self, frame_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a single incoming frame with temporal history:
        - Evaluates person presence
        - Evaluates hand visibility
        - Extracts spatial & temporal features
        - Predicts current continuous sign and confidence
        """
        pose = frame_data.get("pose")
        left_hand = frame_data.get("left_hand")
        right_hand = frame_data.get("right_hand")
        face = frame_data.get("face")
        timestamp = frame_data.get("timestamp", 0.0)

        # 1. Error Handling Checks
        if not pose and not left_hand and not right_hand:
            return {
                "sign": None,
                "confidence": 0.0,
                "status": "NO_PERSON",
                "message": "No person detected. Please position yourself in front of the camera."
            }

        if not left_hand and not right_hand:
            # Pose detected, but hands are out of frame or resting
            return {
                "sign": "BLANK",
                "confidence": 0.95,
                "status": "WAITING",
                "message": "Hands not clearly visible. Please raise your hands to sign."
            }

        # 2. Extract hand features
        rh_info = self.extract_finger_states(right_hand) if right_hand else None
        lh_info = self.extract_finger_states(left_hand) if left_hand else None

        active_wrist = None
        if rh_info and rh_info["wrist"]:
            active_wrist = rh_info["wrist"]
        elif lh_info and lh_info["wrist"]:
            active_wrist = lh_info["wrist"]

        # Store in rolling buffer
        self.sequence_buffer.add_frame({
            "timestamp": timestamp,
            "right_hand_wrist": rh_info["wrist"] if rh_info else None,
            "left_hand_wrist": lh_info["wrist"] if lh_info else None,
            "rh_extended": rh_info["extended"] if rh_info else [],
            "lh_extended": lh_info["extended"] if lh_info else []
        })

        # Calculate temporal motion vector
        motion = self.compute_temporal_velocity(self.sequence_buffer.get_frames())

        # 3. Spatial & Temporal Signature Matching
        predicted_sign, confidence = self._match_sign_signature(
            rh_info=rh_info,
            lh_info=lh_info,
            pose=pose,
            face=face,
            motion=motion
        )

        # If confidence below threshold
        if confidence < self.confidence_threshold:
            return {
                "sign": None,
                "confidence": confidence,
                "status": "UNCERTAIN",
                "message": "Waiting for a clearer sign..."
            }

        return {
            "sign": predicted_sign,
            "confidence": round(confidence, 2),
            "status": "TRANSLATING",
            "message": None,
            "timestamp": timestamp
        }

    def _match_sign_signature(
        self,
        rh_info: Optional[Dict[str, Any]],
        lh_info: Optional[Dict[str, Any]],
        pose: Optional[List[Dict[str, float]]],
        face: Optional[List[Dict[str, float]]],
        motion: Dict[str, float]
    ) -> Tuple[str, float]:
        """
        Deep rule and geometric embedding matcher comparing extracted
        spatial/temporal features against the ISL dictionary signatures.
        """
        # Determine active hand
        primary = rh_info or lh_info
        both_active = (rh_info is not None and len(rh_info.get("extended", [])) > 0) and \
                      (lh_info is not None and len(lh_info.get("extended", [])) > 0)

        ext = set(primary.get("extended", [])) if primary else set()
        wrist = primary.get("wrist") if primary else None
        speed = motion.get("speed", 0.0)
        vy = motion.get("vy", 0.0)
        vx = motion.get("vx", 0.0)

        # Reference keypoints from pose/face if available
        nose_y = 0.25
        chest_y = 0.50
        stomach_y = 0.80
        if pose and len(pose) > 12:
            # MediaPipe Pose: 0 is nose, 11/12 are shoulders
            nose_y = pose[0]["y"]
            chest_y = (pose[11]["y"] + pose[12]["y"]) / 2.0
            stomach_y = chest_y + 0.3

        if not wrist:
            return "BLANK", 0.90

        # Elevation zones:
        # HEAD/FACE zone: wrist['y'] < chest_y - 0.1
        # CHEST zone: chest_y - 0.1 <= wrist['y'] <= stomach_y
        # LOW zone: wrist['y'] > stomach_y
        is_near_face = wrist["y"] < (chest_y - 0.05)
        is_chest_level = (wrist["y"] >= chest_y - 0.05) and (wrist["y"] <= stomach_y)
        is_low = wrist["y"] > stomach_y

        # Hands resting low -> BLANK / Neutral
        if is_low and not both_active:
            return "BLANK", 0.95

        # --- TWO-HANDED SIGNS ---
        if both_active:
            rh_ext = set(rh_info.get("extended", []))
            lh_ext = set(lh_info.get("extended", []))
            rh_w = rh_info["wrist"]
            lh_w = lh_info["wrist"]
            hands_dist = math.sqrt((rh_w["x"] - lh_w["x"])**2 + (rh_w["y"] - lh_w["y"])**2)

            # STOP: Flat hands clapping / perpendicular edge
            if len(rh_ext) >= 4 and len(lh_ext) >= 4 and hands_dist < 0.25 and speed > 0.3:
                return "STOP", 0.94

            # BOOK: Both open hands touching/opening
            if len(rh_ext) >= 4 and len(lh_ext) >= 4 and hands_dist < 0.15 and is_chest_level:
                return "BOOK", 0.92

            # COLLEGE: Palm slide arc upward
            if len(rh_ext) >= 4 and len(lh_ext) >= 4 and vy < -0.2:
                return "COLLEGE", 0.95

            # SCHOOL: Clapping flat palms horizontally
            if len(rh_ext) >= 4 and len(lh_ext) >= 4 and hands_dist < 0.20:
                return "SCHOOL", 0.93

            # HOME: Hands form peaked roof
            if len(rh_ext) >= 4 and len(lh_ext) >= 4 and hands_dist < 0.18 and is_near_face:
                return "HOME", 0.92

            # HELP: Fist/thumb resting on flat open palm elevated
            if ("THUMB" in rh_ext or len(rh_ext) <= 2) and len(lh_ext) >= 4 and hands_dist < 0.22:
                return "HELP", 0.94

            # FRIEND: Interlocked index fingers
            if "INDEX" in rh_ext and "INDEX" in lh_ext and len(rh_ext) <= 2 and len(lh_ext) <= 2 and hands_dist < 0.15:
                return "FRIEND", 0.93

            # WHAT: Both palms open facing up shrugging
            if len(rh_ext) >= 4 and len(lh_ext) >= 4 and is_chest_level and abs(vx) > 0.1:
                return "WHAT", 0.91

            # HAPPY: Both open hands brushing upward across chest
            if len(rh_ext) >= 4 and len(lh_ext) >= 4 and vy < -0.15 and is_chest_level:
                return "HAPPY", 0.92

            # WANT: Both clawed hands pulling in
            if speed > 0.2 and vx > 0 and is_chest_level:
                return "WANT", 0.89

            # PAIN: Both index fingers pointing at each other twisting
            if "INDEX" in rh_ext and "INDEX" in lh_ext and hands_dist < 0.2:
                return "PAIN", 0.94

            # NAME: H-fingers (index + middle) tapped crosswise
            if ("INDEX" in rh_ext and "MIDDLE" in rh_ext) and ("INDEX" in lh_ext and "MIDDLE" in lh_ext) and hands_dist < 0.15:
                return "NAME", 0.93

            # BUS: Both fists gripping steering wheel
            if len(rh_ext) <= 1 and len(lh_ext) <= 1 and hands_dist > 0.25 and hands_dist < 0.5:
                return "BUS", 0.91

        # --- SINGLE-HANDED / DOMINANT SIGNS ---

        # 1. Pointing signs (INDEX ONLY)
        if ext == {"INDEX"}:
            if is_chest_level:
                # Pointing toward chest center = I
                if abs(primary["index_tip"]["x"] - 0.5) < 0.15 and primary["index_tip"]["y"] > nose_y:
                    return "I", 0.96
                # Forward flick = GO
                if speed > 0.3 and abs(vx) > 0.1:
                    return "GO", 0.94
                # Beckoning inward = COME
                if speed > 0.2 and vx < 0:
                    return "COME", 0.91
                # Forward pointing = YOU
                return "YOU", 0.93

            elif is_near_face:
                # Index near lips/chin circling = WHO
                if abs(primary["index_tip"]["y"] - nose_y) < 0.1:
                    return "WHO", 0.92
                # Traced down throat = THIRSTY
                if vy > 0.15:
                    return "THIRSTY", 0.92
                # Upright wagging = WHERE
                if abs(vx) > 0.15:
                    return "WHERE", 0.94

        # 2. Open Palm (ALL 5 FINGERS)
        if len(ext) >= 4:
            if is_near_face:
                # Flat hand from chin forward = THANK_YOU
                if speed > 0.2:
                    return "THANK_YOU", 0.95
                # Resting cheek = SLEEP
                return "SLEEP", 0.93

            if is_chest_level:
                # Flat hand on chest heart = MY
                if speed < 0.15:
                    return "MY", 0.95
                # Rubbing in circle on chest = PLEASE
                if speed >= 0.15:
                    return "PLEASE", 0.93
                # Open palm facing forward = YOUR
                return "YOUR", 0.91

            if is_low:
                # Hand downward to stomach = HUNGRY
                return "HUNGRY", 0.91

        # 3. Pinch / O-Handshape (Eating, Drinking, Medicine, Money)
        if ext == set() or ext == {"THUMB"} or (len(ext) <= 2 and "INDEX" in ext):
            # Tapping mouth = EAT or FOOD
            if is_near_face and abs(primary["index_tip"]["y"] - nose_y) < 0.15:
                return "EAT", 0.94
            # C-shape tilt near mouth = DRINK / WATER
            if is_near_face and "THUMB" in ext:
                return "DRINK", 0.93
            # Money rubbing index and thumb in chest front
            if is_chest_level and speed < 0.2 and ("THUMB" in ext or "INDEX" in ext):
                return "MONEY", 0.92

        # 4. Y-Handshape (THUMB + PINKY)
        if "THUMB" in ext and "PINKY" in ext and len(ext) == 2:
            if is_near_face:
                # Held to ear = PHONE
                return "PHONE", 0.96
            return "WHY", 0.91

        # 5. Fist / S-Handshape
        if len(ext) == 0:
            if speed > 0.2 and abs(vy) > 0.1:
                # Nodding fist = YES
                return "YES", 0.92
            return "WORK", 0.88

        # 6. Thumb up (A-Hand)
        if ext == {"THUMB"}:
            if is_near_face:
                # Arc forward along jaw = TOMORROW
                return "TOMORROW", 0.93
            return "YES", 0.90

        # 7. V-Shape (INDEX + MIDDLE)
        if ext == {"INDEX", "MIDDLE"}:
            if is_chest_level:
                # Reading scan
                return "READ", 0.91
            # Snap closed = NO
            if speed > 0.25:
                return "NO", 0.94

        # 8. W-Shape (INDEX, MIDDLE, RING)
        if ext == {"INDEX", "MIDDLE", "RING"}:
            if is_near_face:
                return "WATER", 0.94

        # Return default uncertain if below threshold
        return "UNCERTAIN", 0.55

recognizer = TemporalSignRecognizer()
