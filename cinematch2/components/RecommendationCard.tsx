import React from 'react';
import { Star, Tv, Film, MonitorPlay, Calendar } from 'lucide-react';
import { Recommendation, ContentType } from '../types';

interface RecommendationCardProps {
  data: Recommendation;
  delay: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ data, delay }) => {
  
  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.Movie: return <Film className="w-4 h-4" />;
      case ContentType.Series: return <Tv className="w-4 h-4" />;
      case ContentType.Anime: return <MonitorPlay className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.Movie: return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
      case ContentType.Series: return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case ContentType.Anime: return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
      default: return 'text-slate-400';
    }
  };

  // Determine a gradient based on the match score to make it visually interesting
  const getScoreColor = (score: number) => {
    if (score >= 0.75) return 'text-emerald-400';
    if (score >= 0.45) return 'text-teal-400';
    return 'text-yellow-400';
  };

  const percentScore = Math.min(100, Math.round(data.score * 100));

  return (
    <div 
      className="flex flex-col h-full bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 ease-out transform hover:-translate-y-1"
      style={{ animation: `fadeInUp 0.6s ease-out ${delay}ms both` }}
    >
      {/* Decorative Header Gradient */}
      <div className={`h-2 w-full ${
        data.type === ContentType.Anime ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
        data.type === ContentType.Series ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
        'bg-gradient-to-r from-sky-500 to-blue-500'
      }`} />

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-semibold tracking-wide uppercase ${getTypeColor(data.type)}`}>
            {getTypeIcon(data.type)}
            {data.type}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/50 rounded-lg px-2 py-1">
            <Star className={`w-3.5 h-3.5 ${getScoreColor(data.score)} fill-current`} />
            <span className={`text-sm font-bold ${getScoreColor(data.score)}`}>{percentScore}% Match</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1 leading-tight">{data.title}</h3>
        {data.year && (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
            <Calendar className="w-3 h-3" />
            <span>{data.year}</span>
          </div>
        )}

        <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-grow">
          {data.description}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-700/50">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Why you'll like it</p>
          <p className="text-sm text-indigo-200/80 italic">
            "{data.reason}"
          </p>
        </div>
      </div>
      
      {/* Dynamic Keyframes styles injected once */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RecommendationCard;