export type ProviderId =
  | 'pollinations-free'
  | 'aihorde-free'
  | 'pollinations-pro'
  | 'gemini'
  | 'openai'
  | 'huggingface';

export interface ProviderModel {
  id: string;
  label: string;
  badge?: string;
  description: string;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  shortName: string;
  isFree: boolean;
  requiresKey: boolean;
  supportsImageEdit?: boolean;
  keyLabel?: string;
  keyPlaceholder?: string;
  keyUrl?: string;
  description: string;
  models: ProviderModel[];
}

export interface AspectRatioOption {
  id: string;
  label: string;
  tag: string;
  width: number;
  height: number;
  geminiRatio: string;
  openaiSize: '1024x1024' | '1536x1024' | '1024x1536';
  previewW: number;
  previewH: number;
}

export interface StylePreset {
  id: string;
  name: string;
  enName: string;
  gradient: string;
  accent: string;
  promptSuffix: string;
  negativeHint?: string;
}

export interface ApiKeys {
  pollinationsKey: string;
  geminiKey: string;
  openaiKey: string;
  huggingfaceKey: string;
  aihordeKey: string;
}

export interface AttachedImage {
  dataUrl: string;
  mimeType: string;
  name: string;
}

export interface GeneratedImage {
  id: string;
  threadId?: string;
  turnId?: string;
  url: string;
  prompt: string;
  finalPrompt: string;
  negativePrompt: string;
  providerId: ProviderId;
  providerName: string;
  modelId: string;
  modelLabel: string;
  styleId: string;
  styleName: string;
  aspectRatio: string;
  width: number;
  height: number;
  seed: number;
  createdAt: number;
  durationMs: number;
  favorite: boolean;
  logoCleaned?: boolean;
}

export interface ActiveJob {
  id: string;
  threadId: string;
  turnId: string;
  prompt: string;
  aspectRatio: string;
  width: number;
  height: number;
  providerName: string;
  modelLabel: string;
  statusText: string;
  progress?: number;
  startedAt: number;
  error?: string;
}

export interface ImagineTurn {
  id: string;
  prompt: string;
  contextNote?: string;
  attachedImage?: AttachedImage;
  styleName: string;
  aspectRatio: string;
  modelLabel: string;
  providerName: string;
  createdAt: number;
  imageIds: string[];
}

export interface ImagineThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  turns: ImagineTurn[];
}

export interface InspirationItem {
  id: string;
  title: string;
  category: string;
  prompt: string;
  styleId: string;
  aspectRatio: string;
  gradient: string;
  tag: string;
}

export type MainView = 'imagine' | 'discover' | 'library' | 'favorites';
export type ThemeMode = 'dark' | 'light';
