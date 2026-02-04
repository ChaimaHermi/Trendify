from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict, metrics

app = FastAPI(
    title="Trendify – Viral Content Detection API",
    version="1.0"
)

# Allow frontend (Vite) to call the API
origins = [
    "http://localhost:5174",  # Vite dev server
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(metrics.router)

@app.get("/")
def root():
    return {"status": "API is running"}