import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Zap } from 'lucide-react';
import { supabase, ModelMetrics } from '../lib/supabase';

export default function CompareView() {
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [sampleText, setSampleText] = useState('Check out this amazing new product! 🚀 #innovation #tech #future');
  const [predictions, setPredictions] = useState<Array<{
    model: string;
    score: number;
    class: string;
  }>>([]);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    const { data } = await supabase
      .from('model_metrics')
      .select('*')
      .order('accuracy', { ascending: false });

    if (data) {
      setModels(data);
    }
  };

  const simulateModelPrediction = (text: string, modelName: string, accuracy: number): { score: number; class: string } => {
    const baseScore = 50 + (text.length / 10) + (text.includes('🚀') ? 15 : 0);
    const modelVariance = accuracy * 50;
    const score = Math.min(95, Math.max(10, baseScore + modelVariance + Math.random() * 10 - 5));

    let predictedClass = 'Low';
    if (score >= 70) predictedClass = 'High';
    else if (score >= 40) predictedClass = 'Medium';

    return { score: Math.round(score), class: predictedClass };
  };

  const handleCompare = async () => {
    setIsComparing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results = models.map(model => {
      const prediction = simulateModelPrediction(sampleText, model.model_name, model.accuracy);
      return {
        model: model.model_name,
        score: prediction.score,
        class: prediction.class,
      };
    });

    setPredictions(results);
    setIsComparing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 40) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Compare Model Predictions
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Test Content
            </label>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Enter content to compare across all models..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleCompare}
            disabled={!sampleText.trim() || isComparing}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {isComparing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Target className="w-5 h-5" />
                Compare All Models
              </>
            )}
          </button>
        </div>
      </div>

      {predictions.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {predictions.map((pred, idx) => {
            const model = models.find(m => m.model_name === pred.model);
            const isTopPerformer = pred.score === Math.max(...predictions.map(p => p.score));

            return (
              <div
                key={pred.model}
                className={`bg-white rounded-xl shadow-md border-2 overflow-hidden transition-all hover:shadow-lg ${
                  isTopPerformer ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-slate-200'
                }`}
              >
                {isTopPerformer && (
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-400 px-3 py-2 flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">Highest Score</span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    {pred.model}
                  </h3>

                  <div className="mb-6">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient-{idx})"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${pred.score * 3.52} 351.86`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <defs>
                        <linearGradient id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" className={getScoreColor(pred.score)} />
                          <stop offset="100%" className={getScoreColor(pred.score)} />
                        </linearGradient>
                      </defs>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-3xl font-bold ${getScoreColor(pred.score)}`}>
                          {pred.score}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Class</span>
                      <span className={`font-bold ${getScoreColor(pred.score)}`}>
                        {pred.class}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Accuracy</span>
                      <span className="font-semibold text-slate-900">
                        {((model?.accuracy || 0) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">F1 Score</span>
                      <span className="font-semibold text-slate-900">
                        {((model?.f1_score || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="w-full bg-gradient-to-r ${getScoreBg(pred.score)} h-2 rounded-full" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {predictions.length === 0 && !isComparing && (
        <div className="bg-white rounded-xl shadow-md p-12 border border-slate-200 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-400">No comparison yet</p>
          <p className="text-sm text-slate-500 mt-2">Enter content above and click "Compare All Models"</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Model Rankings
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          {models.map((model, idx) => (
            <div key={model.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  idx === 0 ? 'bg-yellow-500' :
                  idx === 1 ? 'bg-slate-400' :
                  idx === 2 ? 'bg-amber-600' : 'bg-slate-300'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-sm font-semibold text-slate-900">{model.model_name}</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div>Accuracy: <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span></div>
                <div>F1: <span className="font-medium">{(model.f1_score * 100).toFixed(1)}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
