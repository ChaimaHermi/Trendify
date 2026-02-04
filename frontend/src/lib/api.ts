const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface CsvPredictionRow {
  row_index: number;
  prediction: string; // "Viral" | "Not Viral"
  confidence: number; // 0–1
  data: Record<string, unknown>;
}

export interface CsvPredictionResponse {
  model: string;
  results: CsvPredictionRow[];
}

export async function predictFromCsv(
  modelName: string,
  file: File,
): Promise<CsvPredictionResponse> {
  const formData = new FormData();
  formData.append("model_name", modelName);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict/csv`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend error (${response.status}): ${text}`);
  }

  return response.json();
}
