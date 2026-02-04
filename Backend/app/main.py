from fastapi import FastAPI
from app.routers import predict, metrics

app = FastAPI(
    title="Trendify – Viral Content Detection API",
    version="1.0"
)

app.include_router(predict.router)
app.include_router(metrics.router)

@app.get("/")
def root():
    return {"status": "API is running"}
