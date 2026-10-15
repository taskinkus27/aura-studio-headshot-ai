import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

interface NavbarProps {
  onNewSession: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewSession, activeSection, setActiveSection }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-4 bg-[#0c0e12]/90 backdrop-blur-md border-b border-zinc-800/80">
      {/* Zone 1: Single text element wordmark */}
      <button 
        onClick={() => setActiveSection('studio')}
        className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Camera className="w-4 h-4" />
        </span>
        <span className="font-serif-display text-xl tracking-normal">AuraStudio</span>
      </button>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
        <button
          onClick={() => setActiveSection('studio')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeSection === 'studio' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Studio Session
        </button>
        <button
          onClick={() => setActiveSection('styles')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeSection === 'styles' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Style Presets
        </button>
        <button
          onClick={() => setActiveSection('compare')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeSection === 'compare' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Before & After
        </button>
        <button
          onClick={() => setActiveSection('gallery')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${activeSection === 'gallery' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Portfolio Gallery
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onNewSession}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-amber-500/20 active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Headshot Session</span>
        </button>
      </div>
    </header>
  );
};
