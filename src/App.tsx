/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SelfieUploader } from './components/SelfieUploader';
import { StyleSelector } from './components/StyleSelector';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { AIRetouchPanel } from './components/AIRetouchPanel';
import { HeadshotGallery } from './components/HeadshotGallery';
import { HEADSHOT_STYLES, SAMPLE_CASUAL_SELFIE } from './data/styles';
import { HeadshotStyle, HeadshotItem, AspectRatio, SelfieAnalysis } from './types';
import {
  Sparkles,
  Download,
  SlidersHorizontal,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Camera,
  Layers,
  ArrowRight,
  Maximize2
} from 'lucide-react';

const STORAGE_KEY = 'aurastudio_headshots_v1';

export default function App() {
  const [activeSection, setActiveSection] = useState<'studio' | 'styles' | 'compare' | 'gallery'>('studio');
  
  // Studio Inputs
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle>(HEADSHOT_STYLES[0]);
  const [attire, setAttire] = useState(HEADSHOT_STYLES[0].defaultAttire);
  const [lighting, setLighting] = useState(HEADSHOT_STYLES[0].defaultLighting);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [customNotes, setCustomNotes] = useState('');

  // Analysis & Processing State
  const [analysis, setAnalysis] = useState<SelfieAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active Headshot Result & Gallery
  const [headshots, setHeadshots] = useState<HeadshotItem[]>([]);
  const [activeHeadshotId, setActiveHeadshotId] = useState<string | null>(null);
  const [selectedEditIndex, setSelectedEditIndex] = useState<number>(-1);

  // Retouching State
  const [isEditing, setIsEditing] = useState(false);

  // Comparison Tab Active Item
  const [compareItem, setCompareItem] = useState<HeadshotItem | null>(null);

  const studioWorkspaceRef = useRef<HTMLDivElement>(null);

  // Generation progress steps
  const GENERATION_STEPS = [
    'Preserving authentic facial geometry and eye resemblance...',
    'Tailoring executive wardrobe and fabric textures...',
    'Simulating 3-point commercial studio softbox lighting...',
    'Rendering 85mm optical depth of field and color grade...',
  ];

  // Load from localStorage or seed initial sample
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHeadshots(parsed);
          setActiveHeadshotId(parsed[0].id);
          setCompareItem(parsed[0]);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse local headshots:', e);
    }

    // Default seed item for instant showcase
    const initialSample: HeadshotItem = {
      id: 'demo-sample-1',
      timestamp: Date.now() - 3600000,
      originalSelfieUrl: SAMPLE_CASUAL_SELFIE,
      generatedImageUrl: '/src/assets/images/sample_corporate_grey_1792077167672.jpg',
      styleId: 'corporate-grey',
      styleName: 'Corporate Grey Backdrop',
      attire: 'Charcoal tailored executive blazer with crisp collar',
      lighting: 'Soft diffuse studio softbox lighting with gentle eye catchlights',
      aspectRatio: '3:4',
      modelUsed: 'gemini-nano-banana-2.1',
      edits: [],
    };
    setHeadshots([initialSample]);
    setActiveHeadshotId(initialSample.id);
    setCompareItem(initialSample);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (headshots.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(headshots));
      } catch (e) {
        console.warn('LocalStorage quota exceeded or unavailable:', e);
      }
    }
  }, [headshots]);

  const activeHeadshot = headshots.find((h) => h.id === activeHeadshotId) || headshots[0] || null;

  const currentDisplayImageUrl = activeHeadshot
    ? selectedEditIndex >= 0 && activeHeadshot.edits[selectedEditIndex]
      ? activeHeadshot.edits[selectedEditIndex].imageUrl
      : activeHeadshot.generatedImageUrl
    : null;

  // Analyze Selfie via Gemini 3.8 Flash
  const handleAnalyzeSelfie = async () => {
    if (!selfieUrl) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-selfie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfieBase64: selfieUrl }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Selfie analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate Professional Headshot
  const handleGenerateHeadshot = async () => {
    if (!selfieUrl) {
      setGenerationError('Please upload a selfie photo first.');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    setGenerationStep(0);

    // Progress step interval
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const response = await fetch('/api/generate-headshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfieBase64: selfieUrl,
          styleId: selectedStyle.id,
          styleName: selectedStyle.name,
          stylePrompt: selectedStyle.backgroundPrompt,
          attire,
          lighting,
          aspectRatio,
          customNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate headshot');
      }

      const newItem: HeadshotItem = {
        id: `headshot-${Date.now()}`,
        timestamp: Date.now(),
        originalSelfieUrl: selfieUrl,
        generatedImageUrl: data.imageUrl,
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        attire,
        lighting,
        aspectRatio,
        modelUsed: data.modelUsed || 'gemini-nano-banana-2.1',
        edits: [],
      };

      setHeadshots((prev) => [newItem, ...prev]);
      setActiveHeadshotId(newItem.id);
      setSelectedEditIndex(-1);
      setCompareItem(newItem);

      // Scroll smoothly to result
      setTimeout(() => {
        document.getElementById('studio-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      console.error('Generation error:', err);
      setGenerationError(err?.message || 'Failed to generate headshot. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  // Apply Prompt Retouch using gemini-nano-banana-2.1
  const handleApplyRetouch = async (prompt: string) => {
    if (!activeHeadshot || !currentDisplayImageUrl) return;

    setIsEditing(true);
    try {
      const response = await fetch('/api/edit-headshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentDisplayImageUrl,
          editPrompt: prompt,
          aspectRatio: activeHeadshot.aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to apply retouch');
      }

      const newEdit = {
        id: `edit-${Date.now()}`,
        timestamp: Date.now(),
        prompt,
        imageUrl: data.imageUrl,
        modelUsed: data.modelUsed || 'gemini-nano-banana-2.1',
      };

      setHeadshots((prev) =>
        prev.map((item) => {
          if (item.id === activeHeadshot.id) {
            return {
              ...item,
              edits: [...item.edits, newEdit],
            };
          }
          return item;
        })
      );

      // Set active edit index to the new edit
      setSelectedEditIndex(activeHeadshot.edits.length);
    } catch (err: any) {
      alert(`Retouch failed: ${err.message || 'Please try again'}`);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNewSession = () => {
    setSelfieUrl(null);
    setAnalysis(null);
    setGenerationError(null);
    setActiveSection('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Strict 3-Zone Top Navigation */}
      <Navbar
        onNewSession={handleNewSession}
        activeSection={activeSection}
        setActiveSection={(sec) => setActiveSection(sec as any)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Section 1: Editorial Hero Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-zinc-800/80 pb-12">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Camera className="w-4 h-4" />
              <span>Studio Grade Portrait Engine</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400 font-normal normal-case">Powered by Gemini Nano Banana 2.1</span>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] text-balance">
              Transform Casual Selfies into Executive Headshots
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Upload any casual front-camera photo. Select from timeless styles—such as
              <strong className="text-amber-300 font-medium"> Corporate Grey Backdrop</strong>,
              <strong className="text-amber-300 font-medium"> Modern Tech Office</strong>, or
              <strong className="text-amber-300 font-medium"> Outdoor Natural Light</strong>.
              AuraStudio preserves your facial likeness while reconstructing bespoke wardrobe tailoring and studio softbox illumination.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('studio');
                  studioWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 text-xs sm:text-sm font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Your Headshot</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('compare')}
                className="px-4 py-3 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Interactive Before & After</span>
              </button>
            </div>

            {/* Unboxed editorial proof strip */}
            <div className="pt-4 flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
              <span>Authentic Facial Likeness</span>
              <span aria-hidden="true" className="text-zinc-700">·</span>
              <span>85mm Optical Bokeh</span>
              <span aria-hidden="true" className="text-zinc-700">·</span>
              <span>Prompt-Based Retouching</span>
              <span aria-hidden="true" className="text-zinc-700">·</span>
              <span>Commercial Studio Illumination</span>
            </div>
          </div>

          {/* Hero Visual Card: Sample Before & After */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
              <div className="text-xs font-medium text-zinc-400 mb-2 px-1 flex items-center justify-between">
                <span>Interactive Live Comparison</span>
                <span className="text-amber-400 text-[11px]">Corporate Grey Style</span>
              </div>
              <BeforeAfterSlider
                beforeImage={SAMPLE_CASUAL_SELFIE}
                afterImage="/src/assets/images/sample_corporate_grey_1792077167672.jpg"
                beforeLabel="Everyday Selfie"
                afterLabel="Executive Studio Headshot"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Main Studio Workspace */}
        {activeSection === 'studio' && (
          <div ref={studioWorkspaceRef} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Upload & Configure */}
              <div className="lg:col-span-7 space-y-6">
                {/* Step 1: Selfie Uploader */}
                <SelfieUploader
                  selfieUrl={selfieUrl}
                  onSelfieSelected={(url) => {
                    setSelfieUrl(url);
                    setAnalysis(null);
                    setGenerationError(null);
                  }}
                  analysis={analysis}
                  isAnalyzing={isAnalyzing}
                  onAnalyze={handleAnalyzeSelfie}
                  onSelectRecommendedStyle={(styleKey) => {
                    const match = HEADSHOT_STYLES.find((s) => s.id === styleKey);
                    if (match) {
                      setSelectedStyle(match);
                      setAttire(match.defaultAttire);
                      setLighting(match.defaultLighting);
                    }
                  }}
                />

                {/* Step 2: Style Selector */}
                <StyleSelector
                  selectedStyle={selectedStyle}
                  onSelectStyle={(s) => setSelectedStyle(s)}
                  attire={attire}
                  setAttire={setAttire}
                  lighting={lighting}
                  setLighting={setLighting}
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                  customNotes={customNotes}
                  setCustomNotes={setCustomNotes}
                />

                {/* Step 3: Trigger Generation Action */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Ready to Generate Headshot
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Target Style: <span className="text-amber-400 font-medium">{selectedStyle.name}</span> · {aspectRatio}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateHeadshot}
                    disabled={isGenerating || !selfieUrl}
                    className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Rendering Studio Portrait...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Professional Headshot</span>
                      </>
                    )}
                  </button>
                </div>

                {generationError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{generationError}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Generation Studio Monitor & Result */}
              <div id="studio-result" className="lg:col-span-5 space-y-6">
                {/* Generation Loading State */}
                {isGenerating && (
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 aspect-[3/4] flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                        <Camera className="w-7 h-7 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-2 max-w-xs">
                      <h3 className="text-base font-semibold text-white">
                        AI Photographer in Studio
                      </h3>
                      <p className="text-xs text-amber-300/90 font-medium min-h-[32px] transition-all">
                        {GENERATION_STEPS[generationStep]}
                      </p>
                    </div>

                    <div className="w-full max-w-xs bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full transition-all duration-700 ease-out"
                        style={{ width: `${((generationStep + 1) / GENERATION_STEPS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Active Headshot Display */}
                {!isGenerating && activeHeadshot && currentDisplayImageUrl && (
                  <div className="space-y-6">
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {activeHeadshot.styleName}
                            </span>
                            {activeHeadshot.edits.length > 0 && selectedEditIndex >= 0 && (
                              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded">
                                Edit {selectedEditIndex + 1}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate max-w-xs">
                            {activeHeadshot.attire}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleDownload(
                                currentDisplayImageUrl,
                                `AuraStudio_${activeHeadshot.styleId}_${Date.now()}.png`
                              );
                            }}
                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download HD</span>
                          </button>
                        </div>
                      </div>

                      {/* Display Image with Comparison Toggle */}
                      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[3/4]">
                        <img
                          src={currentDisplayImageUrl}
                          alt="Professional Headshot"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Headshot Actions */}
                      <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
                        <span>Aspect: {activeHeadshot.aspectRatio}</span>
                        <span>Model: {activeHeadshot.modelUsed}</span>
                      </div>
                    </div>

                    {/* AI Prompt Retouch Panel */}
                    <AIRetouchPanel
                      currentHeadshot={activeHeadshot}
                      isEditing={isEditing}
                      onApplyEdit={handleApplyRetouch}
                      selectedEditIndex={selectedEditIndex}
                      onSelectEditIndex={(idx) => setSelectedEditIndex(idx)}
                    />
                  </div>
                )}

                {/* Empty State when no Headshot has been generated yet */}
                {!isGenerating && !activeHeadshot && (
                  <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 aspect-[3/4] flex flex-col items-center justify-center space-y-3">
                    <Camera className="w-10 h-10 text-zinc-600" />
                    <h3 className="text-sm font-semibold text-zinc-300">
                      Studio Viewfinder
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                      Upload your selfie on the left and select your style. Your high-resolution portrait will render right here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Style Presets Showcase */}
        {activeSection === 'styles' && (
          <section className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="font-serif-display text-2xl font-bold text-white">
                Studio Style Portfolio & Aesthetics
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Explore each lighting setup, backdrop geometry, and wardrobe pairing tailored for diverse industries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {HEADSHOT_STYLES.map((style) => (
                <div
                  key={style.id}
                  className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/80 flex flex-col justify-between"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                    <img
                      src={style.sampleImage}
                      alt={style.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                        {style.tagline}
                      </span>
                      <h3 className="text-lg font-semibold text-white leading-tight mt-0.5">
                        {style.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {style.description}
                    </p>

                    <div className="space-y-1.5 text-xs border-t border-zinc-800 pt-3">
                      <div>
                        <span className="text-zinc-500">Recommended for: </span>
                        <span className="text-zinc-200">{style.recommendedFor}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Wardrobe: </span>
                        <span className="text-zinc-200">{style.defaultAttire}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Lighting: </span>
                        <span className="text-zinc-200">{style.defaultLighting}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStyle(style);
                        setAttire(style.defaultAttire);
                        setLighting(style.defaultLighting);
                        setActiveSection('studio');
                        studioWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Select This Style</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Before & After Interactive Showcase */}
        {activeSection === 'compare' && (
          <section className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="font-serif-display text-2xl font-bold text-white">
                Before & After Studio Comparisons
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Drag the interactive slider to inspect facial likeness preservation, executive wardrobe tailoring, and commercial studio lighting.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Slider Viewport */}
              <div className="lg:col-span-8">
                {compareItem ? (
                  <div className="space-y-4">
                    <BeforeAfterSlider
                      beforeImage={compareItem.originalSelfieUrl}
                      afterImage={
                        compareItem.edits.length > 0
                          ? compareItem.edits[compareItem.edits.length - 1].imageUrl
                          : compareItem.generatedImageUrl
                      }
                      beforeLabel="Original Casual Photo"
                      afterLabel={`${compareItem.styleName} Headshot`}
                    />

                    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-300">
                      <div>
                        <span className="font-semibold text-white">{compareItem.styleName}</span>
                        <span className="text-zinc-500 mx-2">·</span>
                        <span className="text-zinc-400">{compareItem.attire}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveHeadshotId(compareItem.id);
                          setActiveSection('studio');
                        }}
                        className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                      >
                        <span>Open in Retouch Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-2xl">
                    <p>Select a generated session below to compare.</p>
                  </div>
                )}
              </div>

              {/* Side Sessions Selector */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Select Session to Compare
                </h3>
                <div className="space-y-3">
                  {headshots.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setCompareItem(item)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        compareItem?.id === item.id
                          ? 'border-amber-400 bg-zinc-800/90'
                          : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="w-14 h-18 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-700">
                        <img
                          src={item.generatedImageUrl}
                          alt={item.styleName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {item.styleName}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {item.attire}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">
                          {new Date(item.timestamp).toLocaleDateString()} · {item.aspectRatio}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 5: Gallery */}
        {activeSection === 'gallery' && (
          <HeadshotGallery
            items={headshots}
            onSelectForEdit={(item) => {
              setActiveHeadshotId(item.id);
              setSelectedEditIndex(-1);
              setActiveSection('studio');
            }}
            onSelectForCompare={(item) => {
              setCompareItem(item);
              setActiveSection('compare');
            }}
            onDeleteItem={(id) => {
              setHeadshots((prev) => prev.filter((item) => item.id !== id));
              if (activeHeadshotId === id) {
                const remaining = headshots.filter((item) => item.id !== id);
                setActiveHeadshotId(remaining.length > 0 ? remaining[0].id : null);
              }
            }}
          />
        )}
      </main>

      {/* Quiet, Human Editorial Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 mt-16 py-8 px-6 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-semibold text-zinc-300">AuraStudio</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>AI Headshot Photography Studio</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Corporate Grey</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>Modern Tech Office</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>Outdoor Natural Light</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
