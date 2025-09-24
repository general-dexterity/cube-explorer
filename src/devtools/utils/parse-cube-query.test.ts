import { describe, expect, it } from 'vitest';
import { parseCubeQueryFromRequest } from './parse-cube-query';
import { createMock } from '../../../tests/utils/mock';

describe('parseCubeQueryFromRequest', () => {
  const baseUrl = 'http://localhost:4000/cubejs-api/v1/load';

  it('parses POST JSON envelope and unwraps query', () => {
    const body = {
      query: {
        dimensions: [
          'tenant_organizations_view.id',
          'tenant_organizations_view.name',
        ],
      },
    };

    const req = createMock<chrome.devtools.network.Request>({
      request: {
        method: 'POST',
        url: baseUrl,
        postData: { text: JSON.stringify(body) },
      },
    });

    const q = parseCubeQueryFromRequest(req);
    expect(q.dimensions).toEqual(body.query.dimensions);
  });

  it('parses POST raw JSON CubeQuery', () => {
    const body = { measures: ['Users.count'], dimensions: ['Users.id'] };

    const req = createMock<chrome.devtools.network.Request>({
      request: {
        method: 'POST',
        url: baseUrl,
        postData: { text: JSON.stringify(body) },
      },
    });

    const q = parseCubeQueryFromRequest(req);
    expect(q.measures).toEqual(body.measures);
    expect(q.dimensions).toEqual(body.dimensions);
  });

  it('parses GET query param as CubeQuery', () => {
    const body = { measures: ['Users.count'] };
    const url = `${baseUrl}?query=${encodeURIComponent(JSON.stringify(body))}`;

    const req = createMock<chrome.devtools.network.Request>({
      request: {
        method: 'GET',
        url,
      },
    });

    const q = parseCubeQueryFromRequest(req);
    expect(q.measures).toEqual(body.measures);
  });

  it('prefers POST body over URL params for POST requests', () => {
    const bodyInUrl = { measures: ['Users.count'] };
    const bodyInPost = { dimensions: ['Users.id'] };
    const url = `${baseUrl}?query=${encodeURIComponent(JSON.stringify(bodyInUrl))}`;

    const req = createMock<chrome.devtools.network.Request>({
      request: {
        method: 'POST',
        url,
        postData: { text: JSON.stringify({ query: bodyInPost }) },
      },
    });

    const q = parseCubeQueryFromRequest(req);
    expect(q.dimensions).toEqual(bodyInPost.dimensions);
    expect(q.measures).toBeUndefined();
  });
});

