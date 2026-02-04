import { useState } from 'react';
import { Send, Hash, Globe, Type, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PredictionResult {
  predicted_class: string;
  virality_score: number;
  model_used: string;
  features: Record<string, number>;
}

export default function PredictView() {
  const [contentText, setContentText] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('text');
  const [selectedModel, setSelectedModel] = useState('Neural Network');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const models = ['Logistic Regression', 'Random Forest', 'XGBoost', 'Neural Network'];
  const platforms = ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'];

  const simulatePrediction = (text: string, model: string): PredictionResult => {
    const textLength = text.length;
    const hashtagCount = hashtags.split('#').filter(h => h.trim()).length;
    const hasEmoji = /[\u{1F600}-\u{1F64F}]/u.test(text);

    let baseScore = 50;
    if (textLength > 100 && textLength < 280) baseScore += 15;
    if (hashtagCount >= 3 && hashtagCount <= 5) baseScore += 10;
    if (hasEmoji) baseScore += 5;
    if (text.includes('?') || text.includes('!')) baseScore += 5;

    const modelBonus = {
      'Logistic Regression': 0,
      'Random Forest': 5,
      'XGBoost': 8,
      'Neural Network': 12,
    }[model] || 0;

    const finalScore = Math.min(95, Math.max(10, baseScore + modelBonus + Math.random() * 10 - 5));

    let predictedClass = 'Low';
    if (finalScore >= 70) predictedClass = 'High';
    else if (finalScore >= 40) predictedClass = 'Medium';

    return {
      predicted_class: predictedClass,
      virality_score: Math.round(finalScore),
      model_used: model,
      features: {
        'Text Length': textLength,
        'Hashtag Count': hashtagCount,
        'Emoji Presence': hasEmoji ? 1 : 0,
        'Call to Action': (text.includes('?') || text.includes('!')) ? 1 : 0,
        'Platform Score': Math.random() * 0.3 + 0.5,
      },
    };
  };

  const handleAnalyze = async () => {
    if (!contentText.trim()) return;

    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = simulatePrediction(contentText, selectedModel);
    setPrediction(result);

    await supabase.from('predictions').insert({
      content_text: contentText,
      content_type: contentType,
      hashtags: hashtags.split('#').filter(h => h.trim()),
      platform,
      predicted_class: result.predicted_class,
      virality_score: result.virality_score,
      model_used: result.model_used,
      features: result.features,
    });

    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getClassIcon = (className: string) => {
    if (className === 'High') return <TrendingUp className="w-6 h-6" />;
    if (className === 'Medium') return <Minus className="w-6 h-6" />;
    return <TrendingDown className="w-6 h-6" />;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Content Analysis
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Social Media Content
              </label>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Enter your social media post here..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={6}
              />
              <p className="text-xs text-slate-500 mt-1">{contentText.length} characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#viral #trending #amazing"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {platforms.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ML Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!contentText.trim() || isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isAnalyzing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Analyze Virality
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {prediction ? (
          <>
            <div className={`rounded-xl shadow-md p-8 border-2 ${getScoreBg(prediction.virality_score)}`}>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center gap-2 mb-4 ${getScoreColor(prediction.virality_score)}`}>
                  {getClassIcon(prediction.predicted_class)}
                  <h3 className="text-2xl font-bold">{prediction.predicted_class} Virality Potential</h3>
                </div>

                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${prediction.virality_score * 5.03} 502.65`}
                      strokeLinecap="round"
                      className={getScoreColor(prediction.virality_score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(prediction.virality_score)}`}>
                        {prediction.virality_score}
                      </div>
                      <div className="text-sm text-slate-600">Virality Score</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-4 inline-block">
                  <p className="text-sm text-slate-600">Analyzed by</p>
                  <p className="font-semibold text-slate-900">{prediction.model_used}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Feature Importance</h3>
              <div className="space-y-3">
                {Object.entries(prediction.features).map(([feature, value]) => {
                  const percentage = typeof value === 'number' && value <= 1
                    ? value * 100
                    : Math.min(value / Math.max(...Object.values(prediction.features)) * 100, 100);

                  return (
                    <div key={feature}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{feature}</span>
                        <span className="font-medium text-slate-900">
                          {typeof value === 'number' && value <= 1
                            ? `${(value * 100).toFixed(0)}%`
                            : value}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 border border-slate-200 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Enter content to analyze</p>
              <p className="text-sm mt-2">Your prediction results will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
