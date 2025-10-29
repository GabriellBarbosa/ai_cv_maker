import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.generate import router as generate_router
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.logging import StructuredLoggingMiddleware

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

# Add middlewares (order matters - they are executed in reverse order)
# Structured logging middleware should be last to log the request_id
app.add_middleware(StructuredLoggingMiddleware)
app.add_middleware(RequestIdMiddleware)

# CORS middleware - restricted to web host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(generate_router, prefix="/v1", tags=["generate"])
