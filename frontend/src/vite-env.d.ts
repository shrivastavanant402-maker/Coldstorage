/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_ORS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'cesium' {
  export function createWorldTerrain(options?: {
    requestWaterMask?: boolean;
    requestVertexNormals?: boolean;
  }): any;
}

