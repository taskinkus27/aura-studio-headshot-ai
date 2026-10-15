import React, { useState } from 'react';
import { Check, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { HEADSHOT_STYLES, ATTIRE_PRESETS, LIGHTING_PRESETS } from '../data/styles';
import { HeadshotStyle, AspectRatio } from '../types';

interface StyleSelectorProps {
  selectedStyle: HeadshotStyle;
  onSelectStyle: (style: HeadshotStyle) => void;
  attire: string;
  setAttire: (val: string) => void;
  lighting: string;
  setLighting: (val: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (val: AspectRatio) => void;
  customNotes: string;
  setCustomNotes: (val: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle,
  attire,
  setAttire,
  lighting,
  setLighting,
  aspectRatio,
  setAspectRatio,
  customNotes,
  setCustomNotes,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">02. Select Studio Style</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Choose your desired atmosphere, background environment, and photographic tone.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/80"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Customize Wardrobe & Lighting</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Grid of Styles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HEADSHOT_STYLES.map((style) => {
          const isSelected = selectedStyle.id === style.id;
          return (
            <div
              key={style.id}
              onClick={() => {
                onSelectStyle(style);
                setAttire(style.defaultAttire);
                setLighting(style.defaultLighting);
              }}
              className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 text-left flex flex-col ${
                isSelected
                  ? 'border-amber-400/90 ring-2 ring-amber-400/20 bg-zinc-800/90 shadow-lg shadow-amber-500/10'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800/50'
              }`}
            >
              {/* Visual Thumbnail */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
                <img
                  src={style.sampleImage}
                  alt={style.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight leading-snug">
                    {style.name}
                  </h3>
                  <p className="text-[11px] text-zinc-300 line-clamp-1">
                    {style.tagline}
                  </p>
                </div>
              </div>

              {/* Card Meta & Clean Unboxed Tag */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {style.description}
                </p>
                <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                  <span className="text-zinc-500">Best for: </span>
                  <span className="text-zinc-300">{style.recommendedFor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Customizer Drawer */}
      {showAdvanced && (
        <div className="mt-5 p-5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <h4 className="text-xs font-semibold text-zinc-200">
              Studio Customizer · Fine-Tune Details
            </h4>
            <span className="text-[11px] text-zinc-400">
              Personalize wardrobe, illumination, and framing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attire Selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Wardrobe & Attire
              </label>
              <input
                type="text"
                value={attire}
                onChange={(e) => setAttire(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 mb-2"
                placeholder="e.g. Charcoal tailored blazer with crisp white collar"
              />
              <div className="flex flex-wrap gap-1.5">
                {ATTIRE_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAttire(preset)}
                    className={`text-[10px] px-2 py-1 rounded transition-colors text-left truncate max-w-full ${
                      attire === preset
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
                    }`}
                  >
                    {preset.split(' ')[0]} {preset.split(' ')[1]} {preset.split(' ')[2]}...
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting Selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Lighting Atmosphere
              </label>
              <input
                type="text"
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 mb-2"
                placeholder="e.g. Soft diffuse studio softbox lighting"
              />
              <div className="flex flex-wrap gap-1.5">
                {LIGHTING_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLighting(preset)}
                    className={`text-[10px] px-2 py-1 rounded transition-colors text-left truncate max-w-full ${
                      lighting === preset
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
                    }`}
                  >
                    {preset.split(' ')[0]} {preset.split(' ')[1]} {preset.split(' ')[2]}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Framing & Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '3:4', label: 'Portrait (3:4)', sub: 'Standard Headshot' },
                  { id: '1:1', label: 'Square (1:1)', sub: 'Avatar & Profile' },
                  { id: '4:3', label: 'Landscape (4:3)', sub: 'Executive Card' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id as AspectRatio)}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      aspectRatio === ratio.id
                        ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{ratio.id}</div>
                    <div className="text-[10px] text-zinc-400">{ratio.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Specific Direction (Optional)
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                placeholder="e.g. Subtle smile, gold watch, tie clip, soften hairline"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Any specific requests will be passed directly into the generation prompt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
