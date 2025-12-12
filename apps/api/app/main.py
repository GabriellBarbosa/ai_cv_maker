import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.generate import router as generate_router
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.logging import StructuredLoggingMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)

app = FastAPI(
    title="AI CV Maker API",
    description="Generate CV and cover letters using AI",
    version="0.1.0"
)

limiter = Limiter(key_func=get_remote_address, default_limits=["2/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Add middlewares (order matters - they are executed in reverse order)
# Structured logging middleware should be last to log the request_id
app.add_middleware(StructuredLoggingMiddleware)
app.add_middleware(RequestIdMiddleware)

environment = os.getenv('APP_ENV', 'development')
origins = ["http://localhost:3000"] if environment == 'development' else ["https://ai-cv-maker-web.vercel.app"]

# CORS middleware - restricted to web host
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(generate_router, prefix="/v1", tags=["generate"])
