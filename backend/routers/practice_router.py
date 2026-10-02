from fastapi import APIRouter, HTTPException
from typing import List
from backend.models.schemas import PracticeSentence, PracticeEvaluateRequest, PracticeEvaluateResponse
from backend.ai.language_translator import translator

router = APIRouter(prefix="/practice", tags=["Practice Mode"])

PRACTICE_TARGETS = [
    PracticeSentence(
        id="prac_1",
        target_sentence="I am going to school.",
        target_signs=["I", "GO", "SCHOOL"],
        difficulty="Beginner",
        category="Daily Activities",
        hint="Point to chest for 'I', flick index finger forward for 'GO', clap flat palms horizontally twice for 'SCHOOL'."
    ),
    PracticeSentence(
        id="prac_2",
        target_sentence="I will go to college tomorrow.",
        target_signs=["I", "GO", "COLLEGE", "TOMORROW"],
        difficulty="Intermediate",
        category="Education",
        hint="Sign 'I' -> forward flick 'GO' -> palm slide arc 'COLLEGE' -> thumb along jaw forward for 'TOMORROW'."
    ),
    PracticeSentence(
        id="prac_3",
        target_sentence="Hello, my name is Lahari.",
        target_signs=["HELLO", "MY", "NAME", "LAHARI"],
        difficulty="Beginner",
        category="Greetings",
        hint="Open palm wave 'HELLO', flat palm to heart 'MY', crosswise finger tap 'NAME', fingerspell 'LAHARI'."
    ),
    PracticeSentence(
        id="prac_4",
        target_sentence="Where is the bus stop?",
        target_signs=["WHERE", "BUS"],
        difficulty="Beginner",
        category="Travel",
        hint="Wag index finger upright 'WHERE', then grip steering wheel and steer side to side for 'BUS'."
    ),
    PracticeSentence(
        id="prac_5",
        target_sentence="I need help.",
        target_signs=["I", "NEED", "HELP"],
        difficulty="Beginner",
        category="Emergency",
        hint="Point to chest 'I', downward crook finger 'NEED', fist on flat palm lifted 'HELP'."
    ),
    PracticeSentence(
        id="prac_6",
        target_sentence="I like music.",
        target_signs=["I", "LIKE", "MUSIC"],
        difficulty="Intermediate",
        category="Leisure",
        hint="Point chest 'I', middle-thumb pinch pull from chest 'LIKE', wave flat hand across like conducting music."
    ),
    PracticeSentence(
        id="prac_7",
        target_sentence="I am hungry and I want food.",
        target_signs=["I", "HUNGRY", "WANT", "FOOD"],
        difficulty="Intermediate",
        category="Needs",
        hint="Sign 'I', draw C-hand down chest for 'HUNGRY', clawed hands pull in for 'WANT', tap mouth for 'FOOD'."
    ),
    PracticeSentence(
        id="prac_8",
        target_sentence="Please give me water.",
        target_signs=["WATER", "PLEASE"],
        difficulty="Beginner",
        category="Food & Drink",
        hint="W-hand tapping chin for 'WATER', circular chest rub for 'PLEASE'."
    )
]

@router.get("/sentences", response_model=List[PracticeSentence])
def get_practice_sentences():
    return PRACTICE_TARGETS

@router.post("/evaluate", response_model=PracticeEvaluateResponse)
def evaluate_practice(req: PracticeEvaluateRequest):
    # Clean signs
    target = [s.strip().upper() for s in req.target_signs]
    detected = [s.strip().upper() for s in req.detected_signs if s.strip().upper() not in ["BLANK", "NONE", ""]]

    # Missing & extra calculation
    target_set = list(target)
    missing = []
    for s in target:
        if s not in detected:
            missing.append(s)

    extra = [s for s in detected if s not in target]

    # Order calculation
    order_correct = True
    if len(detected) == len(target):
        order_correct = (detected == target)
    else:
        # Check relative order of correctly detected items
        common = [s for s in detected if s in target]
        expected_sub = [s for s in target if s in detected]
        order_correct = (common == expected_sub)

    # Accuracy percentage calculation
    if not target:
        acc = 0.0
    elif detected == target:
        acc = 96.0
    else:
        correct_count = sum(1 for s in target if s in detected)
        precision = correct_count / max(1, len(detected))
        recall = correct_count / len(target)
        f1 = (2 * precision * recall) / max(0.001, (precision + recall))
        order_penalty = 0.15 if not order_correct else 0.0
        acc = max(0.0, min(99.0, (f1 - order_penalty) * 100))

    passed = acc >= 75.0 and len(missing) == 0

    if passed:
        feedback = "Outstanding! You performed the sequence accurately with correct sign order."
    elif len(missing) > 0 and len(extra) == 0:
        feedback = f"Good attempt! You missed {', '.join(missing)}. Try signing the full sequence continuously."
    elif not order_correct:
        feedback = "Signs were recognized, but the sequence order differed from the target. Review the order."
    else:
        feedback = "Keep practicing! Ensure each gesture is clear and distinct."

    return PracticeEvaluateResponse(
        target_signs=target,
        detected_signs=detected,
        accuracy_percentage=round(acc, 1),
        sign_order_correct=order_correct,
        missing_signs=missing,
        extra_signs=extra,
        feedback=feedback,
        passed=passed
    )
