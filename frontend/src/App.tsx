import { useState } from 'react';
import Layout from './components/Layout';
import PredictView from './components/PredictView';
import CompareView from './components/CompareView';
import MetricsView from './components/MetricsView';
import HistoryView from './components/HistoryView';

type View = 'predict' | 'compare' | 'metrics' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<View>('predict');

  const renderView = () => {
    switch (currentView) {
      case 'predict':
        return <PredictView />;
      case 'compare':
        return <CompareView />;
      case 'metrics':
        return <MetricsView />;
      case 'history':
        return <HistoryView />;
      default:
        return <PredictView />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;
