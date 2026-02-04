from pathlib import Path
import joblib

# Go from app/service/model_loader.py → app → Backend → Trendify (project root)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODELS_DIR = BASE_DIR / "models" / "trained"

def load_model(model_name: str):
    model_path = MODELS_DIR / f"{model_name}.pkl"

    if not model_path.exists():
        raise FileNotFoundError(f"Model {model_name} not found")

    # joblib.load works with models saved via joblib.dump or pickle.dump
    return joblib.load(model_path)
