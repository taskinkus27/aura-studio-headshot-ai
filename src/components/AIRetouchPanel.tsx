import React, { useState } from 'react';
import { Wand2, Sparkles, History, Undo2, ArrowRight } from 'lucide-react';
import { QUICK_EDIT_PROMPTS } from '../data/styles';
import { HeadshotItem } from '../types';

interface AIRetouchPanelProps {
  currentHeadshot: HeadshotItem;
  isEditing: boolean;
  onApplyEdit: (prompt: string) => Promise<void>;
  selectedEditIndex: number;
  onSelectEditIndex: (index: number) => void;
}

export const AIRetouchPanel: React.FC<AIRetouchPanelProps> = ({
  currentHeadshot,
  isEditing,
  onApplyEdit,
  selectedEditIndex,
  onSelectEditIndex,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isEditing) return;
    onApplyEdit(prompt.trim());
    setPrompt('');
  };

  const handleChipClick = (chipPrompt: string) => {
    setPrompt(chipPrompt);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Studio Retouch & Prompt Editor</h3>
            <p className="text-[11px] text-zinc-400">
              Refine your headshot with natural language prompts using gemini-nano-banana-2.1
            </p>
          </div>
        </div>
        <span className="text-[11px] text-zinc-400 hidden sm:inline-block">
          Preserves facial likeness
        </span>
      </div>

      {/* Version History Tabs */}
      {currentHeadshot.edits.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1 text-zinc-400 text-[11px] shrink-0 mr-1">
            <History className="w-3.5 h-3.5" />
            <span>Versions:</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectEditIndex(-1)}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              selectedEditIndex === -1
                ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Initial Shot
          </button>
          {currentHeadshot.edits.map((edit, idx) => (
            <button
              key={edit.id}
              type="button"
              onClick={() => onSelectEditIndex(idx)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedEditIndex === idx
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Edit {idx + 1}</span>
            </button>
          ))}
        </div>
      )}

      {/* Prompt Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isEditing}
            placeholder="Describe any revision (e.g., 'Change blazer to navy blue', 'Add wireframe glasses', 'Soften background')"
            className="w-full pl-4 pr-32 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isEditing}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            {isEditing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Retouching...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply Edit</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] text-zinc-400 block mb-1.5">
            Quick Retouch Ideas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_EDIT_PROMPTS.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={isEditing}
                onClick={() => handleChipClick(chip)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors flex items-center gap-1"
              >
                <span>{chip}</span>
                <ArrowRight className="w-2.5 h-2.5 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
