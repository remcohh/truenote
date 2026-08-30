/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Scoring sampler rate, in samples per second. Defaults to 10 if unset. */
  readonly VITE_SAMPLE_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
