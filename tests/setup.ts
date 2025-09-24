import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { createMock } from './utils/mock';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Chrome APIs using createMock
(global as { chrome: typeof chrome }).chrome = createMock<typeof chrome>(
  {},
  { name: 'chrome' },
);

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Setup ResizeObserver mock
// Uncomment if needed - jsdom doesn't implement ResizeObserver
// global.ResizeObserver = vi.fn().mockImplementation(() => ({
//   observe: vi.fn(),
//   unobserve: vi.fn(),
//   disconnect: vi.fn(),
// }));

// Setup IntersectionObserver mock
// Uncomment if needed - jsdom doesn't implement IntersectionObserver
// global.IntersectionObserver = vi.fn().mockImplementation(() => ({
//   observe: vi.fn(),
//   unobserve: vi.fn(),
//   disconnect: vi.fn(),
// }));
