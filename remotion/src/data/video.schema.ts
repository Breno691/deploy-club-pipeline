// SmartOps IA — Video Schema (TypeScript types for JSON-driven video generation)

export type VideoFormat =
  | 'instagram_reel'
  | 'youtube_short'
  | 'tiktok'
  | 'linkedin_video'
  | 'meta_ad'
  | 'vsl'
  | 'story';

export type VideoObjective =
  | 'awareness'
  | 'authority'
  | 'lead_generation'
  | 'conversion'
  | 'retargeting'
  | 'case_study'
  | 'education';

export type SceneType =
  | 'hook'
  | 'problem'
  | 'pain'
  | 'data'
  | 'insight'
  | 'solution'
  | 'process'
  | 'before_after'
  | 'case_result'
  | 'testimonial'
  | 'cta'
  | 'outro';

export type AnimationType =
  | 'kinetic-impact'
  | 'slide-up'
  | 'slide-left'
  | 'fade-in'
  | 'counter'
  | 'process-flow'
  | 'cta-pulse'
  | 'scale-in'
  | 'stagger';

export type VisualStyle =
  | 'dark-gradient'
  | 'grid-overlay'
  | 'glow-accent'
  | 'clean-dark'
  | 'data-viz';

export interface VideoMetric {
  label:   string;
  value:   string | number;
  unit?:   string;
  change?: string;
}

export interface CTA {
  type:     'diagnostic' | 'whatsapp' | 'website' | 'follow' | 'save';
  text:     string;
  url?:     string;
  subtext?: string;
}

export interface BrandConfig {
  style?:           string;
  primaryColor?:    string;
  accentColor?:     string;
  backgroundColor?: string;
}

export interface VideoScene {
  id:            string;
  type:          SceneType;
  duration:      number;
  headline?:     string;
  subheadline?:  string;
  body?:         string;
  bullets?:      string[];
  metrics?:      VideoMetric[];
  before?:       string;
  after?:        string;
  result?:       string;
  quote?:        string;
  attribution?:  string;
  animation?:    AnimationType;
  visual?:       VisualStyle;
}

export interface VideoProject {
  videoId:     string;
  title:       string;
  format:      VideoFormat;
  aspectRatio: '9:16' | '1:1' | '16:9' | '4:5';
  duration:    number;
  fps:         number;
  objective:   VideoObjective;
  audience:    string;
  theme:       string;
  template?:   string;
  cta:         CTA;
  brand?:      BrandConfig;
  scenes:      VideoScene[];
}

// Status lifecycle
export type VideoStatus =
  | 'idea'
  | 'script_created'
  | 'json_created'
  | 'preview_rendering'
  | 'preview_ready'
  | 'approved'
  | 'final_rendering'
  | 'final_ready'
  | 'scheduled'
  | 'published'
  | 'metrics_collected'
  | 'analyzed'
  | 'archived';

export interface RenderConfig {
  outputDir:    string;
  filename:     string;
  quality?:     'preview' | 'final';
  thumbnail?:   boolean;
  timeoutSecs?: number;
}

export interface PublishingConfig {
  platform:   VideoFormat;
  caption?:   string;
  hashtags?:  string[];
  scheduledAt?: string;
}
