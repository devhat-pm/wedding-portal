from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from datetime import datetime
import os
import sys
import logging
import traceback

# Fix for Windows asyncio + asyncpg
if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from app.config import settings
from app.database import init_db, close_db
from app.utils.exceptions import (
    AppException,
    create_error_response,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
    ValidationException,
    TokenExpiredException,
    InvalidTokenException
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
# Import all models to register them with Base.metadata
from app.models import (
    Wedding, Guest, TravelInfo, HotelInfo, SuggestedHotel,
    DressCode, GuestDressPreference, FoodMenu, GuestFoodPreference,
    Activity, GuestActivity, MediaUpload, Event, Invitation,
    ChatbotSettings, ChatbotLog
)
from app.routers import (
    auth_router,
    admin_wedding_router,
    admin_guests_router,
    admin_hotels_router,
    admin_dress_code_router,
    admin_food_router,
    admin_activities_router,
    admin_media_router,
    guest_router,
    chat_router,
    events_router,
    invitations_router,
    chatbot_router,
)
from app.schemas.common import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    if settings.ENVIRONMENT == "production" and settings.SECRET_KEY == "your-super-secret-key-change-this-in-production":
        logger.warning("SECRET_KEY is using the default value! Set a secure SECRET_KEY in .env for production.")
    await init_db()
    logger.info("Database initialized")

    # Create upload directories if they don't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "weddings"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "dress-codes"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "media"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "hotels"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "activities"), exist_ok=True)
    logger.info(f"Upload directory ready: {settings.UPLOAD_DIR}")

    yield

    # Shutdown
    await close_db()
    logger.info("Database connections closed")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A wedding guest management system with Arabic theme",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount(
        "/uploads",
        StaticFiles(directory=settings.UPLOAD_DIR),
        name="uploads"
    )


# =============================================================================
# Exception Handlers
# =============================================================================

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions."""
    logger.warning(
        f"AppException: {exc.error_code} - {exc.detail} - Path: {request.url.path}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(
            detail=exc.detail,
            error_code=exc.error_code
        ),
        headers=exc.headers
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle standard HTTP exceptions."""
    error_codes = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        429: "RATE_LIMIT_EXCEEDED",
        500: "INTERNAL_SERVER_ERROR",
        503: "SERVICE_UNAVAILABLE"
    }

    logger.warning(
        f"HTTPException: {exc.status_code} - {exc.detail} - Path: {request.url.path}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(
            detail=str(exc.detail),
            error_code=error_codes.get(exc.status_code, "ERROR")
        )
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    errors = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors[field] = error["msg"]

    logger.warning(
        f"ValidationError: {errors} - Path: {request.url.path}"
    )

    return JSONResponse(
        status_code=422,
        content=create_error_response(
            detail="Validation error",
            error_code="VALIDATION_ERROR",
            errors=errors
        )
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    # Log the full traceback for debugging
    logger.error(
        f"Unhandled exception: {str(exc)} - Path: {request.url.path}\n"
        f"Traceback: {traceback.format_exc()}"
    )

    # In production, don't expose internal error details
    if settings.ENVIRONMENT == "production":
        detail = "An unexpected error occurred. Please try again later."
    else:
        detail = str(exc)

    return JSONResponse(
        status_code=500,
        content=create_error_response(
            detail=detail,
            error_code="INTERNAL_SERVER_ERROR"
        )
    )


# =============================================================================
# Routers
# =============================================================================

# Include routers (prefixes already defined in routers)
app.include_router(auth_router)
app.include_router(admin_wedding_router)
app.include_router(admin_guests_router)
app.include_router(admin_hotels_router)
app.include_router(admin_dress_code_router)
app.include_router(admin_food_router)
app.include_router(admin_activities_router)
app.include_router(admin_media_router)
app.include_router(guest_router)
app.include_router(chat_router)
app.include_router(events_router)
app.include_router(invitations_router)
app.include_router(chatbot_router)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "Welcome to the Wedding Guest Management System API"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
