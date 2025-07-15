export interface Settings {
  domains: string[];
  endpoints: string[];
  jwtTokens: Record<string, string>;
  autoCapture: boolean;
}

export interface CubeQuery {
  measures?: string[];
  dimensions?: string[];
  filters?: unknown[];
  timeDimensions?: unknown[];
}

export interface CubeResponse {
  data?: unknown;
  annotation?: unknown;
}

export interface CubeRequest {
  id: string;
  url: string;
  query: CubeQuery;
  response: CubeResponse;
  timestamp: number;
  duration?: number;
  status: number;
  domain: string;
}

export interface CubeMeta {
  cubes: Array<{
    name: string;
    title?: string;
    measures: Array<{ name: string; title?: string; type: string }>;
    dimensions: Array<{ name: string; title?: string; type: string }>;
  }>;
}
