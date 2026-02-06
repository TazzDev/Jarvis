/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHISPER_URL?: string
  readonly VITE_LMSTUDIO_URL?: string
  readonly VITE_LMSTUDIO_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
