import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
METRICS_PATH = BASE_DIR / "models" / "metadata" / "metrics.json"

@router.get("/metrics")
def get_metrics():
    with open(METRICS_PATH, "r") as f:
        return json.load(f)
