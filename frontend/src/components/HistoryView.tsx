import { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, Minus, Clock, Hash } from 'lucide-react';
import { supabase, Prediction } from '../lib/supabase';

export default function HistoryView() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>('all');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setPredictions(data);
    }
    setIsLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-100 border-green-300';
    if (score >= 40) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getClassIcon = (className: string) => {
    if (className === 'High') return <TrendingUp className="w-4 h-4" />;
    if (className === 'Medium') return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const filteredPredictions = filterClass === 'all'
    ? predictions
    : predictions.filter(p => p.predicted_class.toLowerCase() === filterClass.toLowerCase());

  const stats = {
    total: predictions.length,
    high: predictions.filter(p => p.predicted_class === 'High').length,
    medium: predictions.filter(p => p.predicted_class === 'Medium').length,
    low: predictions.filter(p => p.predicted_class === 'Low').length,
    avgScore: predictions.length > 0
      ? Math.round(predictions.reduce((sum, p) => sum + p.virality_score, 0) / predictions.length)
      : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          Prediction History
        </h2>

        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-slate-600 mb-1">Total Predictions</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-slate-600 mb-1">High Potential</p>
            <p className="text-3xl font-bold text-green-600">{stats.high}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-slate-600 mb-1">Medium Potential</p>
            <p className="text-3xl font-bold text-orange-600">{stats.medium}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-slate-600 mb-1">Low Potential</p>
            <p className="text-3xl font-bold text-red-600">{stats.low}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-300">
            <p className="text-sm text-slate-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-slate-900">{stats.avgScore}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setFilterClass('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterClass === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterClass('high')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterClass === 'high'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            High
          </button>
          <button
            onClick={() => setFilterClass('medium')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterClass === 'medium'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setFilterClass('low')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterClass === 'low'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Low
          </button>
        </div>
      </div>

      {filteredPredictions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 border border-slate-200 text-center">
          <History className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-400">No predictions yet</p>
          <p className="text-sm text-slate-500 mt-2">Start analyzing content to see your history here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPredictions.map((prediction) => (
            <div
              key={prediction.id}
              className={`bg-white rounded-xl shadow-md border-2 overflow-hidden hover:shadow-lg transition-all ${
                getScoreBg(prediction.virality_score)
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex items-center gap-2 ${getScoreColor(prediction.virality_score)}`}>
                        {getClassIcon(prediction.predicted_class)}
                        <span className="font-bold text-lg">{prediction.predicted_class}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(prediction.virality_score)} ${getScoreBg(prediction.virality_score)}`}>
                        Score: {prediction.virality_score}
                      </div>
                    </div>

                    <p className="text-slate-900 mb-3 leading-relaxed">
                      {prediction.content_text}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {prediction.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                          <Hash className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(prediction.created_at).toLocaleString()}
                      </div>
                      <div className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                        {prediction.model_used}
                      </div>
                      <div className="px-2 py-1 bg-slate-100 rounded text-xs font-medium capitalize">
                        {prediction.platform}
                      </div>
                      <div className="px-2 py-1 bg-slate-100 rounded text-xs font-medium capitalize">
                        {prediction.content_type}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-20">
                      <svg className="transform -rotate-90 w-20 h-20">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${prediction.virality_score * 2.01} 201.06`}
                          strokeLinecap="round"
                          className={getScoreColor(prediction.virality_score)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-xl font-bold ${getScoreColor(prediction.virality_score)}`}>
                          {prediction.virality_score}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
