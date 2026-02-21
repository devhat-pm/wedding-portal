from app.routers.auth import router as auth_router
from app.routers.admin_wedding import router as admin_wedding_router
from app.routers.admin_guests import router as admin_guests_router
from app.routers.admin_hotels import router as admin_hotels_router
from app.routers.admin_dress_code import router as admin_dress_code_router
from app.routers.admin_food import router as admin_food_router
from app.routers.admin_activities import router as admin_activities_router
from app.routers.admin_media import router as admin_media_router
from app.routers.guest import router as guest_router
from app.routers.chat import router as chat_router
from app.routers.events import router as events_router
from app.routers.invitations import router as invitations_router
from app.routers.chatbot import router as chatbot_router

__all__ = [
    "auth_router",
    "admin_wedding_router",
    "admin_guests_router",
    "admin_hotels_router",
    "admin_dress_code_router",
    "admin_food_router",
    "admin_activities_router",
    "admin_media_router",
    "guest_router",
    "chat_router",
    "events_router",
    "invitations_router",
    "chatbot_router",
]
