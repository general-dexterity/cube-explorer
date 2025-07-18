// Re-export CubeJS types
export type {
  BinaryFilter,
  BinaryOperator,
  Filter,
  LoadResponse as CubeResponse,
  LogicalAndFilter,
  LogicalOrFilter,
  Meta as CubeMeta,
  Query as CubeQuery,
  UnaryFilter,
  UnaryOperator,
} from '@cubejs-client/core';

// Import types for internal use
import type { LoadResponse, Query } from '@cubejs-client/core';

// Extension-specific types
export interface Settings {
  domains: string[];
  endpoints: string[];
  jwtTokens: Record<string, string>;
  autoCapture: boolean;
}

export interface CubeRequest {
  id: string;
  url: string;
  query: Query;
  response: (LoadResponse<unknown> & { error?: undefined }) | { error: string };
  timestamp: number;
  duration?: number;
  status: number;
  domain: string;
}

export const SidebarPanel = {
  Requests: 'requests',
  Settings: 'settings',
} as const;

export type SidebarPanel = (typeof SidebarPanel)[keyof typeof SidebarPanel];
