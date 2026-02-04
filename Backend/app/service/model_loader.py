import pickle
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models" / "trained"

def load_model(model_name: str):
    model_path = MODELS_DIR / f"{model_name}.pkl"
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model {model_name} not found")
    
    with open(model_path, "rb") as f:
        return pickle.load(f)
