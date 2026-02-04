import { ReactNode } from 'react';
import { Zap, TrendingUp, BarChart3, History } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentView: 'predict' | 'compare' | 'metrics' | 'history';
  onViewChange: (view: 'predict' | 'compare' | 'metrics' | 'history') => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const navItems = [
    { id: 'predict', label: 'Predict', icon: Zap },
    { id: 'compare', label: 'Compare Models', icon: TrendingUp },
    { id: 'metrics', label: 'Performance', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ViralPredict AI</h1>
                <p className="text-xs text-slate-500">ML Model Performance Showcase</p>
              </div>
            </div>

            <div className="flex gap-2">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            AI Bootcamp Project - Demonstrating ML Model Performance in Real-World Applications
          </p>
        </div>
      </footer>
    </div>
  );
}
