import React from 'react';
import { X, Film } from 'lucide-react';
import { WatchedItem } from '../types';

interface WatchedListProps {
  items: WatchedItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const WatchedList: React.FC<WatchedListProps> = ({ items, onRemove, onClear }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300">Your Watchlist ({items.length})</h3>
        <button 
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div 
            key={item.id}
            className="group flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full pl-4 pr-2 py-1.5 transition-all hover:border-indigo-500/50 hover:bg-slate-750"
          >
            <span className="text-sm font-medium text-slate-200">{item.title}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 rounded-full text-slate-500 group-hover:text-red-400 group-hover:bg-red-400/10 transition-colors"
              aria-label={`Remove ${item.title}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchedList;