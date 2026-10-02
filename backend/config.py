import os

class Settings:
    PROJECT_NAME: str = "Continuous ISL Translator"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # MongoDB
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "isl_translator")
    
    # Authentication & Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "isl_super_secret_jwt_key_2026_modern_ai")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Recognition parameters
    CONFIDENCE_THRESHOLD: float = 0.70
    TEMPORAL_WINDOW_SIZE: int = 30  # 30 frames rolling window (~1 sec at 30fps)
    SENTENCE_PAUSE_THRESHOLD_SEC: float = 1.3  # pause between signs to segment sentence

settings = Settings()
