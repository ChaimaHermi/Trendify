from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd

from app.service.model_loader import load_model

router = APIRouter()

class PredictionInput(BaseModel):
    model_name: str
    data: dict   # features envoyées par le front

@router.post("/predict")
def predict(payload: PredictionInput):
    try:
        model = load_model(payload.model_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Convertir en DataFrame (1 ligne)
    X = pd.DataFrame([payload.data])

    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0][1]

    return {
        "model": payload.model_name,
        "prediction": "Viral" if prediction == 1 else "Not Viral",
        "confidence": round(float(probability), 3)
    }
