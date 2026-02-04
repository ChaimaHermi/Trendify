import { useState } from "react";
import { Upload, FileSpreadsheet, Sparkles } from "lucide-react";
import { predictFromCsv, type CsvPredictionResponse } from "../lib/api";

export default function PredictView() {
  const [selectedModel, setSelectedModel] = useState("logistic");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CsvPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const models = [
    { label: "Logistic Regression", value: "logistic" },
    { label: "Support Vector Machine (SVM)", value: "svm" },
    { label: "K-Nearest Neighbors (KNN)", value: "knn" },
    { label: "Decision Tree", value: "decision_tree" },
    { label: "Multi-layer Perceptron (MLP)", value: "mlp" },
    { label: "Naive Bayes", value: "naive_bayes" },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await predictFromCsv(selectedModel, file);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while analyzing the file.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRowColor = (prediction: string) => {
    if (prediction === "Viral") return "text-green-600";
    return "text-slate-800";
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Bulk CSV Analysis
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ML Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload CSV file
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 inline-flex items-center justify-between px-4 py-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/40 transition">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <span>
                      {file
                        ? file.name
                        : "Choose a CSV file with posts data..."}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">.csv</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                The file should contain columns like platform, content_type,
                topic, language, region, views, likes, comments, shares,
                engagement_rate, sentiment_score, hour, dayofweek, month,
                is_weekend, num_hashtags, hashtags_len, has_trending.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isAnalyzing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Analyze CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {result ? (
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Predictions
                </h3>
                <p className="text-sm text-slate-500">
                  Model: <span className="font-semibold">{result.model}</span> ·{" "}
                  {result.results.length} posts analyzed
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      #
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Platform
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Topic
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Prediction
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Confidence
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Views
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Likes
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Shares
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row) => {
                    const data = row.data as Record<
                      string,
                      string | number | null | undefined
                    >;
                    return (
                      <tr
                        key={row.row_index}
                        className="border-b border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-3 py-2 text-slate-600">
                          {row.row_index + 1}
                        </td>
                        <td className="px-3 py-2 text-slate-700 capitalize">
                          {(data.platform as string) ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-700 capitalize">
                          {(data.topic as string) ?? "-"}
                        </td>
                        <td
                          className={`px-3 py-2 font-semibold ${getRowColor(row.prediction)}`}
                        >
                          {row.prediction}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {(row.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {data.views ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {data.likes ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {data.shares ?? "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 border border-slate-200 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                Upload a CSV file to analyze
              </p>
              <p className="text-sm mt-2">
                Select your posts CSV on the left and click "Analyze CSV" to see
                predictions here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
