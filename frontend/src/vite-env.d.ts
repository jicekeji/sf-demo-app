/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_TOKEN?: string;
  readonly VITE_API_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
