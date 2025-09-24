import type { CubeQuery } from '../../types';

// Minimal parsing for Cube.js devtools requests.
// - POST: assume JSON body; if it has a top-level `query`, unwrap it.
// - GET: read the `query` param from the URL.
export function parseCubeQueryFromRequest(
  req: chrome.devtools.network.Request,
): CubeQuery {
  try {
    const hasBody = Boolean(
      req.request.postData?.text && req.request.postData.text.length > 0,
    );
    if (req.request.method === 'POST' || hasBody) {
      const text = req.request.postData?.text ?? '{}';
      const parsed: unknown = JSON.parse(text);
      return pickCubeQuery(parsed);
    }

    const url = new URL(req.request.url);
    const qs = url.searchParams.get('query');
    const parsed: unknown = qs ? JSON.parse(qs) : {};
    return pickCubeQuery(parsed);
  } catch (e) {
    console.error('Failed to parse Cube query from request:', e);
    return {};
  }
}

function isCubeQueryEnvelope(value: unknown): value is { query: CubeQuery } {
  return typeof value === 'object' && value !== null && 'query' in value;
}

function isCubeQuery(value: unknown): value is CubeQuery {
  return typeof value === 'object' && value !== null;
}

function pickCubeQuery(source: unknown): CubeQuery {
  if (isCubeQueryEnvelope(source)) return source.query;
  if (isCubeQuery(source)) return source;

  return {};
}
