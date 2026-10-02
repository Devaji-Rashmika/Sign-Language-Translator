import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from backend.models.schemas import UserRegister, UserLogin, Token, UserOut
from backend.database import get_users_col
from backend.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_data: UserRegister):
    users_col = get_users_col()
    existing = users_col.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    user_id = str(uuid.uuid4())
    now_str = datetime.utcnow().isoformat()
    doc = {
        "_id": user_id,
        "name": user_data.name.strip(),
        "email": user_data.email.lower().strip(),
        "password_hash": hash_password(user_data.password),
        "created_at": now_str
    }
    users_col.insert_one(doc)

    user_out = UserOut(
        id=user_id,
        name=doc["name"],
        email=doc["email"],
        created_at=now_str
    )
    token = create_access_token(data={"sub": user_id, "email": doc["email"]})
    return Token(access_token=token, token_type="bearer", user=user_out)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin):
    users_col = get_users_col()
    user = users_col.find_one({"email": login_data.email.lower().strip()})
    if not user or not verify_password(login_data.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user["_id"])
    user_out = UserOut(
        id=user_id,
        name=user.get("name", "User"),
        email=user.get("email"),
        created_at=user.get("created_at", "")
    )
    token = create_access_token(data={"sub": user_id, "email": user["email"]})
    return Token(access_token=token, token_type="bearer", user=user_out)

@router.get("/me", response_model=UserOut)
def get_profile(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )
