from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from backend.models.schemas import SignVocabularyItem
from backend.ai.sign_dictionary import SIGN_DEFINITIONS, SIGN_LOOKUP

router = APIRouter(prefix="/vocabulary", tags=["Vocabulary"])

@router.get("", response_model=List[SignVocabularyItem])
def get_vocabulary(
    level: Optional[int] = Query(None, description="Filter by Level 1-5"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search label or description")
):
    results = []
    q = search.lower().strip() if search else None

    for item in SIGN_DEFINITIONS:
        if level is not None and item.get("level") != level:
            continue
        if category and item.get("category", "").lower() != category.lower():
            continue
        if q:
            label_match = q in item.get("label", "").lower()
            desc_match = q in item.get("description", "").lower()
            cat_match = q in item.get("category", "").lower()
            if not (label_match or desc_match or cat_match):
                continue

        results.append(SignVocabularyItem(
            sign_id=item["sign_id"],
            label=item["label"],
            category=item["category"],
            level=item["level"],
            description=item["description"],
            two_handed=item.get("two_handed", False),
            motion=item["motion"],
            example_sentence=item["example_sentence"],
            tips=item.get("tips", None)
        ))

    return results

@router.get("/categories")
def get_categories():
    cats = sorted(list(set(item["category"] for item in SIGN_DEFINITIONS)))
    return {"categories": cats}

@router.get("/{category}", response_model=List[SignVocabularyItem])
def get_vocabulary_by_category(category: str):
    items = [
        SignVocabularyItem(
            sign_id=item["sign_id"],
            label=item["label"],
            category=item["category"],
            level=item["level"],
            description=item["description"],
            two_handed=item.get("two_handed", False),
            motion=item["motion"],
            example_sentence=item["example_sentence"],
            tips=item.get("tips", None)
        )
        for item in SIGN_DEFINITIONS
        if item.get("category", "").lower() == category.lower()
    ]
    return items
