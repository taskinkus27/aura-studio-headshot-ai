import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, RefreshCw, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { SAMPLE_CASUAL_SELFIE } from '../data/styles';
import { SelfieAnalysis } from '../types';

interface SelfieUploaderProps {
  selfieUrl: string | null;
  onSelfieSelected: (url: string) => void;
  analysis: SelfieAnalysis | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onSelectRecommendedStyle: (styleId: string) => void;
}

export const SelfieUploader: React.FC<SelfieUploaderProps> = ({
  selfieUrl,
  onSelfieSelected,
  analysis,
  isAnalyzing,
  onAnalyze,
  onSelectRecommendedStyle,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onSelfieSelected(result);
      }
    };
    reader.readAsDataURL(file);
  }, [onSelfieSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const startWebcam = async () => {
    try {
      setWebcamError(null);
      setIsWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setWebcamError('Unable to access webcam. Please check browser permissions.');
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onSelfieSelected(dataUrl);
      stopWebcam();
    }
  };

  const loadSampleSelfie = async () => {
    try {
      const response = await fetch(SAMPLE_CASUAL_SELFIE);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelfieSelected(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      onSelfieSelected(SAMPLE_CASUAL_SELFIE);
    }
  };

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">01. Upload Casual Selfie</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Clear front-facing smartphone selfies or everyday photos work best.
          </p>
        </div>
        {selfieUrl && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change Photo</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      {/* Webcam Mode */}
      {isWebcamActive && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-w-sm mx-auto border border-zinc-700">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 px-4 z-20">
            <button
              onClick={captureWebcamPhoto}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs rounded-full flex items-center gap-2 shadow-lg"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Selfie</span>
            </button>
            <button
              onClick={stopWebcam}
              className="p-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* No Selfie Selected & Not Webcam */}
      {!selfieUrl && !isWebcamActive && (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-amber-400 bg-amber-500/5'
                : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/40'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 mb-3">
              <Upload className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1">
              Drag & drop your selfie here, or <span className="text-amber-400 underline decoration-amber-400/40">browse</span>
            </p>
            <p className="text-xs text-zinc-400 max-w-xs">
              Supports JPEG, PNG, WebP up to 15MB. Casual lighting and everyday attire are perfectly fine.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              type="button"
              onClick={startWebcam}
              className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Take Live Selfie</span>
            </button>
            <button
              type="button"
              onClick={loadSampleSelfie}
              className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Demo Selfie</span>
            </button>
          </div>

          {webcamError && (
            <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{webcamError}</span>
            </p>
          )}
        </div>
      )}

      {/* Selfie Preview + Photographer AI Analysis */}
      {selfieUrl && !isWebcamActive && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative group w-36 h-48 shrink-0 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950">
              <img
                src={selfieUrl}
                alt="Uploaded selfie"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-medium text-zinc-300">
                Input Selfie
              </div>
            </div>

            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Selfie Loaded Successfully</span>
                </span>
                {!analysis && (
                  <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'AI Photo Analysis'}</span>
                  </button>
                )}
              </div>

              {/* Analysis Drawer */}
              {analysis ? (
                <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">AI Photographer Analysis</span>
                    <span className="text-[11px] text-zinc-400">Gemini 3.8 Flash</span>
                  </div>
                  <p className="text-zinc-300 italic">
                    "{analysis.photographerAdvice}"
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-700/40 text-[11px]">
                    <div>
                      <span className="text-zinc-400">Angle: </span>
                      <span className="text-zinc-200">{analysis.headAngle}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Lighting: </span>
                      <span className="text-zinc-200">{analysis.lightingQuality}</span>
                    </div>
                  </div>
                  {analysis.bestSuitedStyles?.length > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-zinc-400">Recommended Styles:</span>
                      {analysis.bestSuitedStyles.map((styleKey) => (
                        <button
                          key={styleKey}
                          onClick={() => onSelectRecommendedStyle(styleKey)}
                          className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded transition-colors"
                        >
                          {styleKey.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">
                  Ready for conversion! You can click "AI Photo Analysis" to let Gemini 3.8 Flash review the lighting and angle, or proceed to pick your studio style below.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
