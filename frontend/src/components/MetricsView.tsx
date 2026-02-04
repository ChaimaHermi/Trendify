import { useState, useEffect } from 'react';
import { BarChart3, Target, TrendingUp, Database } from 'lucide-react';
import { supabase, ModelMetrics } from '../lib/supabase';

export default function MetricsView() {
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelMetrics | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    const { data } = await supabase
      .from('model_metrics')
      .select('*')
      .order('accuracy', { ascending: false });

    if (data && data.length > 0) {
      setModels(data);
      setSelectedModel(data[0]);
    }
  };

  const getColorForMetric = (value: number) => {
    if (value >= 0.85) return 'bg-green-500';
    if (value >= 0.75) return 'bg-blue-500';
    if (value >= 0.65) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMaxValue = (matrix: number[][]) => {
    return Math.max(...matrix.flat());
  };

  const getCellColor = (value: number, max: number) => {
    const ratio = value / max;
    if (ratio >= 0.8) return 'bg-green-100 text-green-900 border-green-300';
    if (ratio >= 0.5) return 'bg-blue-100 text-blue-900 border-blue-300';
    if (ratio >= 0.2) return 'bg-orange-100 text-orange-900 border-orange-300';
    return 'bg-red-100 text-red-900 border-red-300';
  };

  if (!selectedModel) {
    return <div>Loading...</div>;
  }

  const maxValue = getMaxValue(selectedModel.confusion_matrix.matrix);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Model Performance Metrics
        </h2>

        <div className="flex gap-2 flex-wrap">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedModel.id === model.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {model.model_name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Accuracy</p>
              <p className="text-2xl font-bold text-slate-900">
                {(selectedModel.accuracy * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`${getColorForMetric(selectedModel.accuracy)} h-2 rounded-full transition-all`}
              style={{ width: `${selectedModel.accuracy * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">F1 Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {(selectedModel.f1_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`${getColorForMetric(selectedModel.f1_score)} h-2 rounded-full transition-all`}
              style={{ width: `${selectedModel.f1_score * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Precision</p>
              <p className="text-2xl font-bold text-slate-900">
                {(selectedModel.precision_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`${getColorForMetric(selectedModel.precision_score)} h-2 rounded-full transition-all`}
              style={{ width: `${selectedModel.precision_score * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Recall</p>
              <p className="text-2xl font-bold text-slate-900">
                {(selectedModel.recall_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`${getColorForMetric(selectedModel.recall_score)} h-2 rounded-full transition-all`}
              style={{ width: `${selectedModel.recall_score * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Confusion Matrix</h3>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="mb-4 flex items-center gap-4">
              <div className="text-sm text-slate-600">
                <span className="font-semibold">Dataset Size:</span> {selectedModel.dataset_size.toLocaleString()} samples
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold">Training Date:</span>{' '}
                {new Date(selectedModel.training_date).toLocaleDateString()}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-24 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold text-slate-700">
                Actual Class
              </div>

              <div className="ml-4">
                <div className="text-center text-sm font-semibold text-slate-700 mb-2">
                  Predicted Class
                </div>

                <div className="inline-block">
                  <div className="flex gap-2 mb-2 ml-24">
                    {selectedModel.confusion_matrix.labels.map((label) => (
                      <div
                        key={label}
                        className="w-24 text-center text-sm font-semibold text-slate-700"
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  {selectedModel.confusion_matrix.matrix.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-2 mb-2 items-center">
                      <div className="w-20 text-right text-sm font-semibold text-slate-700 pr-4">
                        {selectedModel.confusion_matrix.labels[rowIdx]}
                      </div>
                      {row.map((value, colIdx) => {
                        const isCorrect = rowIdx === colIdx;
                        return (
                          <div
                            key={colIdx}
                            className={`w-24 h-20 flex flex-col items-center justify-center rounded-lg border-2 transition-all hover:scale-105 ${
                              isCorrect
                                ? 'bg-green-100 border-green-400 font-bold'
                                : getCellColor(value, maxValue)
                            }`}
                          >
                            <div className={`text-2xl font-bold ${isCorrect ? 'text-green-900' : ''}`}>
                              {value}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {((value / row.reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">How to Read This Matrix:</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Diagonal cells (green)</strong> show correct predictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong>Off-diagonal cells</strong> show misclassifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Each row shows how samples of one class were classified</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-bold text-slate-900 mb-4">Model Comparison</h3>
          <div className="space-y-3">
            {models.map((model) => (
              <div
                key={model.id}
                className={`bg-white rounded-lg p-4 border-2 transition-all ${
                  model.id === selectedModel.id ? 'border-blue-500' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-900">{model.model_name}</span>
                  <span className="text-sm font-bold text-blue-600">
                    {(model.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`${getColorForMetric(model.accuracy)} h-2 rounded-full transition-all`}
                    style={{ width: `${model.accuracy * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-bold text-slate-900 mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Best Performer</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {models[0]?.model_name} achieves {(models[0]?.accuracy * 100).toFixed(1)}% accuracy
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">High Precision</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {(selectedModel.precision_score * 100).toFixed(1)}% of positive predictions are correct
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Strong Recall</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {(selectedModel.recall_score * 100).toFixed(1)}% of actual positives are identified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
