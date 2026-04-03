import React, { useState } from 'react';
import { Sparkles, Loader2, PlayCircle, CheckCircle2, CircleDashed } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import InputArea from './components/InputArea';
import WatchedList from './components/WatchedList';
import RecommendationCard from './components/RecommendationCard';
import { AlgorithmResults, ClassificationResult, WatchedItem } from './types';
import { getRecommendations } from './services/api';

type ProgressStatus = 'pending' | 'running' | 'done';

interface ProgressStep {
  key: string;
  label: string;
  status: ProgressStatus;
}

const PROGRESS_TEMPLATE: ProgressStep[] = [
  { key: 'classification', label: 'Classifying watched titles', status: 'pending' },
  { key: 'content', label: 'Running Content-Based (TF-IDF/Cosine/KNN)', status: 'pending' },
  { key: 'collab', label: 'Running Collaborative (KNN/Pearson/SVD)', status: 'pending' },
  { key: 'hybrid', label: 'Building Hybrid ensemble scores', status: 'pending' },
  { key: 'sequential', label: 'Running Sequential next-watch prediction', status: 'pending' },
  { key: 'retrieval', label: 'Fetching retrieval context', status: 'pending' },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const App: React.FC = () => {
  const [watchedItems, setWatchedItems] = useState<WatchedItem[]>([]);
  const [algorithmResults, setAlgorithmResults] = useState<AlgorithmResults | null>(null);
  const [classification, setClassification] = useState<ClassificationResult[]>([]);
  const [retrievalContext, setRetrievalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(PROGRESS_TEMPLATE);

  const animateProgress = async () => {
    const steps = PROGRESS_TEMPLATE.map(s => ({ ...s }));
    setProgressSteps(steps);
    for (let i = 0; i < steps.length; i++) {
      setProgressSteps(prev => prev.map((s, j) => ({
        ...s,
        status: j < i ? 'done' : j === i ? 'running' : 'pending',
      })));
      await sleep(450);
      setProgressSteps(prev => prev.map((s, j) => j === i ? { ...s, status: 'done' } : s));
      await sleep(120);
    }
  };

  const handleAddItem = (title: string) => {
    if (watchedItems.some(i => i.title.toLowerCase() === title.toLowerCase())) return;
    setWatchedItems(prev => [{ id: uuidv4(), title }, ...prev]);
    if (algorithmResults) {
      setAlgorithmResults(null);
      setClassification([]);
      setRetrievalContext('');
    }
  };

  const handleRemoveItem = (id: string) => setWatchedItems(prev => prev.filter(i => i.id !== id));

  const handleClearAll = () => {
    setWatchedItems([]);
    setAlgorithmResults(null);
    setClassification([]);
    setRetrievalContext('');
    setError(null);
  };

  const fetchRecommendations = async () => {
    if (!watchedItems.length) return;
    setLoading(true);
    setError(null);
    setAlgorithmResults(null);
    setClassification([]);
    setRetrievalContext('');

    try {
      const titles = watchedItems.map(i => i.title);
      const [data] = await Promise.all([getRecommendations(titles), animateProgress()]);
      setAlgorithmResults(data.algorithms);
      setClassification(data.classification);
      setRetrievalContext(data.retrieval_context.map(i => i.text).join(' | '));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-purple-200 mb-4">
            CineMatch AI
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover your next obsession. Tell us what movies, series, or anime you love,
            and our AI will curate a personalized watchlist just for you.
          </p>
        </header>

        <InputArea onAdd={handleAddItem} isLoading={loading} />
        <WatchedList items={watchedItems} onRemove={handleRemoveItem} onClear={handleClearAll} />

        {watchedItems.length > 0 && (
          <div className="mb-16">
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-lg font-bold rounded-xl shadow-xl shadow-indigo-900/20 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Analyzing Taste Profile...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-6 h-6 fill-white/20" />
                  <span>Generate Recommendations</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-center mb-12">
            {error}
          </div>
        )}

        {(loading || algorithmResults) && (
          <div className="w-full mb-8 p-4 rounded-xl border border-slate-700 bg-slate-900/40">
            <h3 className="text-lg font-semibold text-white mb-3">Algorithm Runtime</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {progressSteps.map((step) => (
                <div key={step.key} className="flex items-center gap-3 text-sm rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
                  {step.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <CircleDashed className={`w-4 h-4 ${step.status === 'running' ? 'text-indigo-300 animate-spin' : 'text-slate-500'}`} />
                  )}
                  <span className={step.status === 'running' ? 'text-indigo-200' : 'text-slate-300'}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {algorithmResults && (
          <div className="w-full">
            <div className="mb-8 p-4 rounded-xl border border-slate-700 bg-slate-900/40">
              <h3 className="text-lg font-semibold text-white mb-3">Input Classification</h3>
              <div className="space-y-1 text-sm text-slate-300">
                {classification.map((item, i) => (
                  <p key={`${item.input}-${i}`}>
                    {item.input} → {item.matched_title ?? 'Not Found'} ({item.type})
                  </p>
                ))}
              </div>
              {retrievalContext && (
                <p className="text-xs text-slate-400 mt-3">Context: {retrievalContext}</p>
              )}
            </div>

            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-white">All Algorithm Results</h2>
              <div className="h-px bg-slate-800 flex-grow" />
            </div>

            <div className="space-y-10">
              {(Object.entries(algorithmResults) as Array<[keyof AlgorithmResults, AlgorithmResults[keyof AlgorithmResults]]>).map(([algo, recs]) => (
                <div key={algo}>
                  <h3 className="text-xl font-semibold text-indigo-200 mb-4 capitalize">{algo.replace('_', ' ')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recs.map((rec, i) => (
                      <RecommendationCard key={`${algo}-${rec.title}-${i}`} data={rec} delay={i * 80} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
