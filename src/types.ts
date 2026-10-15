export type AspectRatio = '3:4' | '1:1' | '4:3';

export interface HeadshotStyle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  sampleImage: string;
  recommendedFor: string;
  defaultAttire: string;
  defaultLighting: string;
  backgroundPrompt: string;
}

export interface HeadshotEdit {
  id: string;
  timestamp: number;
  prompt: string;
  imageUrl: string;
  modelUsed: string;
}

export interface HeadshotItem {
  id: string;
  timestamp: number;
  originalSelfieUrl: string;
  generatedImageUrl: string;
  styleId: string;
  styleName: string;
  attire: string;
  lighting: string;
  aspectRatio: AspectRatio;
  modelUsed: string;
  edits: HeadshotEdit[];
}

export interface SelfieAnalysis {
  lightingQuality: string;
  headAngle: string;
  expressionTone: string;
  bestSuitedStyles: string[];
  photographerAdvice: string;
}
