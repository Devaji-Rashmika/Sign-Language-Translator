import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import db_manager, get_vocabulary_col, get_model_metadata_col
from backend.ai.sign_dictionary import SIGN_DEFINITIONS
from backend.routers import (
    auth_router,
    translate_router,
    vocabulary_router,
    history_router,
    practice_router,
    websocket_router
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("isl_backend")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Continuous Indian Sign Language (ISL) Recognition and English Translation Engine"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(translate_router, prefix=settings.API_PREFIX)
app.include_router(vocabulary_router, prefix=settings.API_PREFIX)
app.include_router(history_router, prefix=settings.API_PREFIX)
app.include_router(practice_router, prefix=settings.API_PREFIX)
app.include_router(websocket_router)

@app.on_event("startup")
def startup_event():
    # Initialize DB connection (MongoDB or In-Memory MongoDB simulator)
    db_manager.connect()
    
    # Seed vocabulary collection if empty
    vocab_col = get_vocabulary_col()
    if vocab_col.count_documents({}) == 0:
        logger.info(f"Seeding {len(SIGN_DEFINITIONS)} ISL signs into MongoDB vocabulary collection...")
        vocab_col.insert_many(SIGN_DEFINITIONS)
        logger.info("Vocabulary seeded successfully.")

    # Record model metadata
    model_col = get_model_metadata_col()
    if model_col.count_documents({}) == 0:
        model_col.insert_one({
            "model_name": "ISL-TemporalNet-v2",
            "architecture": "Temporal Sequence Buffer + Spatial Geometry + ISL Transformer Rules",
            "supported_levels": [1, 2, 3, 4, 5],
            "vocabulary_size": len(SIGN_DEFINITIONS),
            "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
            "status": "ACTIVE"
        })

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "api_docs": "/docs",
        "supported_vocabulary_count": len(SIGN_DEFINITIONS)
    }

@app.get("/api/health")
def healthcheck():
    return {
        "status": "HEALTHY",
        "database": "MONGODB_CONNECTED" if db_manager.is_connected else "MEMORY_SIMULATOR_ACTIVE",
        "temporal_ai": "READY"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
