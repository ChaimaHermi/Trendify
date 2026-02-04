from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import pandas as pd
from io import StringIO

from app.service.model_loader import load_model

router = APIRouter()


class PredictionInput(BaseModel):
    model_name: str
    data: dict   # features envoyées par le front (JSON mode)


@router.post("/predict")
def predict(payload: PredictionInput):
    """JSON prediction endpoint (kept for compatibility)."""
    try:
        model = load_model(payload.model_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    X = pd.DataFrame([payload.data])

    prediction = model.predict(X)[0]
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[0]
        probability = float(proba[1]) if len(proba) > 1 else float(proba[0])
    else:
        probability = 0.5

    return {
        "model": payload.model_name,
        "prediction": "Viral" if prediction == 1 else "Not Viral",
        "confidence": round(float(probability), 3),
    }


@router.post("/predict/csv")
async def predict_from_csv(
    model_name: str = Form(...),
    file: UploadFile = File(...),
):
    """Accept a CSV file of posts and return predictions for each row.

    The CSV must contain the same feature columns used during training
    (e.g. platform, content_type, topic, language, region, views, likes,
    comments, shares, engagement_rate, sentiment_score, hour, dayofweek,
    month, is_weekend, num_hashtags, hashtags_len, has_trending).
    """

    try:
        model = load_model(model_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    try:
        raw_bytes = await file.read()
        text = raw_bytes.decode("utf-8")
        df = pd.read_csv(StringIO(text))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {e}")

    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    try:
        preds = model.predict(df)
        if hasattr(model, "predict_proba"):
            probas = model.predict_proba(df)
            pos_idx = 1 if probas.shape[1] > 1 else 0
            confidences = probas[:, pos_idx]
        else:
            confidences = [0.5] * len(df)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Model prediction failed: {e}")

    results = []
    for i, (pred, conf) in enumerate(zip(preds, confidences)):
        row_data = df.iloc[i].to_dict()
        results.append(
            {
                "row_index": int(i),
                "data": row_data,
                "prediction": "Viral" if int(pred) == 1 else "Not Viral",
                "confidence": float(conf),
            }
        )

    return {"model": model_name, "results": results}
