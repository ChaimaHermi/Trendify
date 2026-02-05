import { useState } from "react";
import { Upload, FileSpreadsheet, Sparkles, TrendingUp, Eye, BarChart3, PieChart } from "lucide-react";
import { predictFromCsv, type CsvPredictionResponse } from "../lib/api";

export default function PredictView() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CsvPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
    setResult(null);

    // Parse CSV for preview
    if (selected) {
      try {
        const text = await selected.text();
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',');
        const data = rows.slice(1, 6).map(row => {
          const values = row.split(',');
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim() || '-';
          });
          return obj;
        });
        setCsvPreview(data);
      } catch (err) {
        console.error('Preview error:', err);
      }
    } else {
      setCsvPreview([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await predictFromCsv("mlp", file);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite lors de l'analyse.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate statistics from results
  const getStatistics = () => {
    if (!result) return null;

    const viralCount = result.results.filter(r => r.prediction === "Viral").length;
    const totalCount = result.results.length;
    const viralPercentage = (viralCount / totalCount) * 100;

    const avgConfidence = result.results.reduce((acc, r) => acc + r.confidence, 0) / totalCount;

    const platformCounts: Record<string, { viral: number; total: number }> = {};
    result.results.forEach(row => {
      const platform = (row.data as any).platform || 'unknown';
      if (!platformCounts[platform]) {
        platformCounts[platform] = { viral: 0, total: 0 };
      }
      platformCounts[platform].total++;
      if (row.prediction === "Viral") {
        platformCounts[platform].viral++;
      }
    });

    return {
      viralCount,
      totalCount,
      viralPercentage,
      avgConfidence,
      platformCounts,
    };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Analyse Virale avec MLP
          </h1>
          <p className="text-slate-600">
            Multi-layer Perceptron pour prédire le potentiel viral de vos posts
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Importer vos données</h2>
              <p className="text-sm text-slate-500">Classification avec MLP Neural Network</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex-1 group relative block">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/50 group-hover:scale-[1.01]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-slate-700">
                        {file ? file.name : "Choisissez un fichier CSV"}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        ou glissez-déposez ici
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg shadow-lg hover:scale-[1.02]"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Analyser avec MLP
                </>
              )}
            </button>
          </div>
        </div>

        {/* CSV Preview */}
        {csvPreview.length > 0 && !result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Aperçu des données ({csvPreview.length} premières lignes)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-200">
                    {Object.keys(csvPreview[0] || {}).slice(0, 8).map((key) => (
                      <th key={key} className="px-4 py-3 text-left font-semibold text-slate-700 capitalize">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                      {Object.values(row).slice(0, 8).map((val: any, i) => (
                        <td key={i} className="px-4 py-3 text-slate-600">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Section with Charts */}
        {result && stats && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.viralCount}</span>
                </div>
                <p className="text-green-100 font-medium">Posts Viraux</p>
                <p className="text-green-50 text-sm mt-1">
                  {stats.viralPercentage.toFixed(1)}% du total
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.totalCount}</span>
                </div>
                <p className="text-blue-100 font-medium">Total Analysés</p>
                <p className="text-blue-50 text-sm mt-1">
                  Modèle: MLP Neural Network
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">
                    {(stats.avgConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-purple-100 font-medium">Confiance Moyenne</p>
                <p className="text-purple-50 text-sm mt-1">
                  Précision du modèle
                </p>
              </div>
            </div>

            {/* Viral Distribution Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-slate-900">
                  Distribution des Prédictions
                </h3>
              </div>

              <div className="flex items-center justify-center gap-8 py-8">
                {/* Circular Progress */}
                <div className="relative w-64 h-64">
                  <svg className="transform -rotate-90 w-64 h-64">
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      stroke="#e2e8f0"
                      strokeWidth="24"
                      fill="none"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      stroke="url(#gradient)"
                      strokeWidth="24"
                      fill="none"
                      strokeDasharray={`${stats.viralPercentage * 6.28} 628`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {stats.viralPercentage.toFixed(1)}%
                    </span>
                    <span className="text-slate-600 font-medium mt-2">Viraux</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Viral</p>
                      <p className="text-sm text-slate-600">{stats.viralCount} posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-slate-200"></div>
                    <div>
                      <p className="font-semibold text-slate-900">Non-Viral</p>
                      <p className="text-sm text-slate-600">
                        {stats.totalCount - stats.viralCount} posts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Performance */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-slate-900">
                  Performance par Plateforme
                </h3>
              </div>

              <div className="space-y-4">
                {Object.entries(stats.platformCounts).map(([platform, counts]) => {
                  const percentage = (counts.viral / counts.total) * 100;
                  return (
                    <div key={platform} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900 capitalize">
                          {platform}
                        </span>
                        <span className="text-sm text-slate-600">
                          {counts.viral}/{counts.total} viraux ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Predictions */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Top Prédictions (Confiance la plus élevée)
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {result.results
                  .sort((a, b) => b.confidence - a.confidence)
                  .slice(0, 6)
                  .map((row, idx) => {
                    const data = row.data as any;
                    const isViral = row.prediction === "Viral";
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                          isViral
                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">
                              {data.platform}
                            </span>
                            <p className="font-bold text-slate-900 capitalize">
                              {data.topic}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              isViral
                                ? "bg-green-600 text-white"
                                : "bg-slate-300 text-slate-700"
                            }`}
                          >
                            {row.prediction}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div>
                            <p className="text-slate-500">Vues</p>
                            <p className="font-semibold text-slate-900">
                              {Number(data.views).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Likes</p>
                            <p className="font-semibold text-slate-900">
                              {Number(data.likes).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Partages</p>
                            <p className="font-semibold text-slate-900">
                              {Number(data.shares).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs text-slate-600">
                            Confiance: <span className="font-bold text-slate-900">
                              {(row.confidence * 100).toFixed(1)}%
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !csvPreview.length && (
          <div className="bg-white rounded-2xl shadow-xl p-16 border border-slate-200 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Prêt à analyser vos posts ?
              </h3>
              <p className="text-slate-600">
                Importez un fichier CSV pour découvrir quels posts ont le plus de
                potentiel viral avec notre modèle MLP.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}