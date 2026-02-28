import React, { useState, KeyboardEvent } from 'react';
import { Plus, Film, Tv, MonitorPlay } from 'lucide-react';

interface InputAreaProps {
  onAdd: (title: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onAdd, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          What have you watched recently?
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
             <Film className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 text-lg rounded-xl pl-12 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500 shadow-xl backdrop-blur-sm"
            placeholder="e.g. Inception, Breaking Bad, Attack on Titan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center">
          Add a mix of Movies, Series, and Anime for better results.
        </p>
      </div>
    </div>
  );
};

export default InputArea;