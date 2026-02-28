import React, { useState } from 'react';
import { Sparkles, Loader2, PlayCircle, CheckCircle2, CircleDashed } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import InputArea from './components/InputArea';
import WatchedList from './components/WatchedList';
import RecommendationCard from './components/RecommendationCard';
import { AlgorithmResults, ClassificationResult, WatchedItem } from './types';
import { getRecommendations } from './services/gemini';

type ProgressStatus = 'pending' | 'running' | 'done';

interface AlgorithmProgressStep {
  key: string;
  label: string;
  status: ProgressStatus;
}

interface AlgorithmKnowledgeRow {
  mainTopic: string;
  subTopic: string;
  algorithms: string;
  explanation: string;
  strengthsWeaknesses: string;
}

const PROGRESS_TEMPLATE: AlgorithmProgressStep[] = [
  { key: 'classification', label: 'Classifying watched titles', status: 'pending' },
  { key: 'content', label: 'Running Content-Based (TF-IDF/Cosine/KNN)', status: 'pending' },
  { key: 'collab', label: 'Running Collaborative (KNN/Pearson/SVD)', status: 'pending' },
  { key: 'hybrid', label: 'Building Hybrid ensemble scores', status: 'pending' },
  { key: 'sequential', label: 'Running Sequential next-watch prediction', status: 'pending' },
  { key: 'retrieval', label: 'Fetching retrieval context (LlamaIndex/ChromaDB)', status: 'pending' },
];

const KNOWLEDGE_ROWS: AlgorithmKnowledgeRow[] = [
  {
    mainTopic: '1. Content-Based Filtering',
    subTopic: 'Feature Extraction',
    algorithms: 'TF-IDF, Word2Vec',
    explanation: 'Converts movie descriptions, genres, and cast lists into vectors.',
    strengthsWeaknesses: 'Strength: Good for new movies. Weakness: Needs rich metadata and may overfit user taste bubble.',
  },
  {
    mainTopic: '1. Content-Based Filtering',
    subTopic: 'Similarity Measurement',
    algorithms: 'Cosine Similarity, Jaccard Index',
    explanation: 'Measures angle/overlap between user profile and movie features.',
    strengthsWeaknesses: 'Strength: Interpretable similarity. Weakness: Can miss latent taste patterns.',
  },
  {
    mainTopic: '2. Collaborative Filtering',
    subTopic: 'Memory-Based (Neighborhood)',
    algorithms: 'KNN, Pearson Correlation',
    explanation: 'User-User and Item-Item neighbors from watch/rating overlap.',
    strengthsWeaknesses: 'Strength: Easy to explain. Weakness: Scalability bottlenecks at large scale.',
  },
  {
    mainTopic: '2. Collaborative Filtering',
    subTopic: 'Model-Based (Latent Factor)',
    algorithms: 'Matrix Factorization, SVD, ALS',
    explanation: 'Factorizes sparse user-item matrix into latent preference dimensions.',
    strengthsWeaknesses: 'Strength: High accuracy on sparse data. Weakness: Lower explainability.',
  },
  {
    mainTopic: '3. Advanced / Deep Learning',
    subTopic: 'Sequential Recommendations',
    algorithms: 'RNNs, Transformers (BERT4Rec)',
    explanation: 'Learns order of consumed titles to predict immediate next choices.',
    strengthsWeaknesses: 'Strength: Captures short-term interest shifts. Weakness: Requires large temporal datasets.',
  },
  {
    mainTopic: '3. Advanced / Deep Learning',
    subTopic: 'Graph-Based Recommendations',
    algorithms: 'Graph Neural Networks (GNNs)',
    explanation: 'Models users, movies, cast, directors as graph relationships.',
    strengthsWeaknesses: 'Strength: Captures complex indirect links. Weakness: High implementation complexity.',
  },
  {
    mainTopic: '4. Hybrid Systems',
    subTopic: 'Ensemble Methods',
    algorithms: 'Weighted, Cascade, Feature Augmentation',
    explanation: 'Combines content and collaborative signals in one robust pipeline.',
    strengthsWeaknesses: 'Strength: Mitigates cold-start issues. Weakness: More complex architecture.',
  },
  {
    mainTopic: '5. Data Collection (Inputs)',
    subTopic: 'Explicit Feedback',
    algorithms: 'Star Ratings, Thumbs Up/Down',
    explanation: 'Direct user preference signals.',
    strengthsWeaknesses: 'Strength: High confidence labels. Weakness: Sparse participation.',
  },
  {
    mainTopic: '5. Data Collection (Inputs)',
    subTopic: 'Implicit Feedback',
    algorithms: 'Watch time, Clicks, Search history',
    explanation: 'Behavior-derived signals without explicit rating input.',
    strengthsWeaknesses: 'Strength: Abundant data. Weakness: Noisy interpretation.',
  },
  {
    mainTopic: '6. Evaluation (Metrics)',
    subTopic: 'Predictive Accuracy',
    algorithms: 'RMSE, MAE',
    explanation: 'Compares predicted and actual preference values.',
    strengthsWeaknesses: 'Strength: Standardized benchmarking. Weakness: Doesn\'t fully capture ranking quality.',
  },
  {
    mainTopic: '6. Evaluation (Metrics)',
    subTopic: 'Ranking Quality',
    algorithms: 'Precision@K, Recall@K, NDCG',
    explanation: 'Evaluates usefulness of top-N recommendation order.',
    strengthsWeaknesses: 'Strength: Mirrors top-list user experience. Weakness: Needs strong relevance labeling.',
  },
];

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
  const [watchedItems, setWatchedItems] = useState<WatchedItem[]>([]);
  const [algorithmResults, setAlgorithmResults] = useState<AlgorithmResults | null>(null);
  const [classification, setClassification] = useState<ClassificationResult[]>([]);
  const [retrievalContext, setRetrievalContext] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressSteps, setProgressSteps] = useState<AlgorithmProgressStep[]>(PROGRESS_TEMPLATE);

  const animateProgress = async () => {
    const steps = PROGRESS_TEMPLATE.map(step => ({ ...step }));
    setProgressSteps(steps);

    for (let index = 0; index < steps.length; index += 1) {
      setProgressSteps(prev =>
        prev.map((step, currentIndex) => {
          if (currentIndex < index) {
            return { ...step, status: 'done' };
          }
          if (currentIndex === index) {
            return { ...step, status: 'running' };
          }
          return { ...step, status: 'pending' };
        }),
      );
      await sleep(450);
      setProgressSteps(prev =>
        prev.map((step, currentIndex) =>
          currentIndex === index ? { ...step, status: 'done' } : step,
        ),
      );
      await sleep(120);
    }
  };

  const handleAddItem = (title: string) => {
    // Prevent duplicates
    if (watchedItems.some(item => item.title.toLowerCase() === title.toLowerCase())) {
      return;
    }
    const newItem: WatchedItem = { id: uuidv4(), title };
    setWatchedItems(prev => [newItem, ...prev]);
    if (algorithmResults) {
      setAlgorithmResults(null);
      setClassification([]);
      setRetrievalContext('');
    }
  };

  const handleRemoveItem = (id: string) => {
    setWatchedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setWatchedItems([]);
    setAlgorithmResults(null);
    setClassification([]);
    setRetrievalContext('');
    setError(null);
  };

  const fetchRecommendations = async () => {
    if (watchedItems.length === 0) return;

    setLoading(true);
    setError(null);
    setAlgorithmResults(null);
    setClassification([]);
    setRetrievalContext('');
    setProgressSteps(PROGRESS_TEMPLATE.map(step => ({ ...step, status: 'pending' })));

    try {
      const titles = watchedItems.map(item => item.title);
      const [data] = await Promise.all([getRecommendations(titles), animateProgress()]);
      setAlgorithmResults(data.algorithms);
      setClassification(data.classification);
      setRetrievalContext(data.retrieval_context.map(item => item.text).join(' | '));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate recommendations.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[5000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[7000ms]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        
        {/* Header */}
        <header className="text-center mb-12 animate-[fadeIn_1s_ease-out]">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-purple-200">
            CineMatch AI
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover your next obsession. Tell us what movies, series, or anime you love, 
            and our AI will curate a personalized watchlist just for you.
          </p>
        </header>

        <InputArea onAdd={handleAddItem} isLoading={loading} />
        
        <WatchedList 
          items={watchedItems} 
          onRemove={handleRemoveItem} 
          onClear={handleClearAll}
        />

        {/* Action Button */}
        {watchedItems.length > 0 && (
          <div className="mb-16">
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className={`
                group relative inline-flex items-center gap-3 px-8 py-4 
                bg-gradient-to-r from-indigo-600 to-violet-600 
                hover:from-indigo-500 hover:to-violet-500 
                text-white text-lg font-bold rounded-xl 
                shadow-xl shadow-indigo-900/20 transition-all duration-300 
                hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                ${loading ? 'cursor-wait' : ''}
              `}
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

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-center mb-12 animate-[fadeIn_0.5s]">
            {error}
          </div>
        )}

        {(loading || algorithmResults) && (
          <div className="w-full mb-8 p-4 rounded-xl border border-slate-700 bg-slate-900/40 animate-[fadeIn_0.5s]">
            <h3 className="text-lg font-semibold text-white mb-3">Algorithm Runtime Animation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {progressSteps.map((step) => (
                <div
                  key={step.key}
                  className="flex items-center gap-3 text-sm rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2"
                >
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

        {/* Results Grid */}
        {algorithmResults && (
          <div className="w-full animate-[fadeIn_1s_ease-out]">
            <div className="mb-8 p-4 rounded-xl border border-slate-700 bg-slate-900/40">
              <h3 className="text-lg font-semibold text-white mb-3">Input Classification</h3>
              <div className="space-y-1 text-sm text-slate-300">
                {classification.map((item, index) => (
                  <p key={`${item.input}-${index}`}>
                    {item.input} → {item.matched_title ?? 'Not Found'} ({item.type})
                  </p>
                ))}
              </div>
              {retrievalContext && (
                <p className="text-xs text-slate-400 mt-3">LlamaIndex/ChromaDB context: {retrievalContext}</p>
              )}
            </div>

            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-white">All Algorithm Results</h2>
              <div className="h-px bg-slate-800 flex-grow"></div>
            </div>

            <div className="space-y-10">
              {(Object.entries(algorithmResults) as Array<[keyof AlgorithmResults, AlgorithmResults[keyof AlgorithmResults]]>).map(([algorithm, recs]) => (
                <div key={algorithm}>
                  <h3 className="text-xl font-semibold text-indigo-200 mb-4 capitalize">{algorithm.replace('_', ' ')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recs.map((rec, index) => (
                      <RecommendationCard
                        key={`${algorithm}-${rec.title}-${index}`}
                        data={rec}
                        delay={index * 80}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold text-white">Dummy Data: Algorithm Knowledge Output</h2>
                <div className="h-px bg-slate-800 flex-grow"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {KNOWLEDGE_ROWS.map((row, index) => (
                  <article
                    key={`${row.mainTopic}-${row.subTopic}-${index}`}
                    className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"
                    style={{ animation: `fadeInUp 0.55s ease-out ${index * 70}ms both` }}
                  >
                    <p className="text-indigo-200 font-semibold text-sm mb-1">{row.mainTopic}</p>
                    <p className="text-slate-200 text-sm mb-1"><span className="font-semibold">Sub-Topic:</span> {row.subTopic}</p>
                    <p className="text-slate-300 text-sm mb-1"><span className="font-semibold">Algorithms / Methods:</span> {row.algorithms}</p>
                    <p className="text-slate-400 text-sm mb-1"><span className="font-semibold">Detailed Explanation:</span> {row.explanation}</p>
                    <p className="text-slate-400 text-sm"><span className="font-semibold">Strengths & Weaknesses:</span> {row.strengthsWeaknesses}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;