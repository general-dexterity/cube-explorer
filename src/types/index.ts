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

// Custom type for query annotations
export interface QueryAnnotations {
  segments?: Record<string, unknown>;
  dimensions?: Record<
    string,
    {
      title: string;
      shortTitle: string;
      type: string;
    }
  >;
  measures?: Record<
    string,
    {
      title: string;
      shortTitle: string;
      type: string;
      drillMembers?: string[];
      drillMembersGrouped?: {
        measures: string[];
        dimensions: string[];
      };
    }
  >;
  timeDimensions?: Record<string, unknown>;
}

// Import types for internal use
import type { LoadResponse, Query } from '@cubejs-client/core';

// Extension-specific types
export interface Settings {
  urls: string[];
  autoCapture: boolean;
  version: string;
  pinnedRequests: CubeRequest[];
}

export interface CubeRequest {
  id: string;
  url: string;
  query: Query;
  response:
    | (LoadResponse<unknown> & { error?: undefined })
    | { error: string; requestId?: string };
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
