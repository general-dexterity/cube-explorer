import { useEffect, useState } from 'react';
import type { Settings } from '../../../types';

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    domains: ['localhost:4000'],
    endpoints: ['/cubejs-api/v1/load'],
    jwtTokens: {},
    autoCapture: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing settings
    chrome.storage.sync.get(['cubeExplorerSettings'], (result) => {
      if (result.cubeExplorerSettings) {
        setSettings(result.cubeExplorerSettings);
      }
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ cubeExplorerSettings: settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const addDomain = () => {
    setSettings((prev) => ({
      ...prev,
      domains: [...prev.domains, ''],
    }));
  };

  const updateDomain = (index: number, value: string) => {
    setSettings((prev) => ({
      ...prev,
      domains: prev.domains.map((d, i) => (i === index ? value : d)),
    }));
  };

  const removeDomain = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      domains: prev.domains.filter((_, i) => i !== index),
    }));
  };

  const addEndpoint = () => {
    setSettings((prev) => ({
      ...prev,
      endpoints: [...prev.endpoints, ''],
    }));
  };

  const updateEndpoint = (index: number, value: string) => {
    setSettings((prev) => ({
      ...prev,
      endpoints: prev.endpoints.map((e, i) => (i === index ? value : e)),
    }));
  };

  const removeEndpoint = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      endpoints: prev.endpoints.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex-1 overflow-auto bg-white p-4 dark:bg-gray-800">
      <div className="space-y-4">
        {/* Domains Section */}
        <div>
          <span className="mb-2 block font-medium text-gray-700 text-xs dark:text-gray-300">
            Domains to Monitor
          </span>
          <div className="space-y-1">
            {settings.domains.map((domain, index) => (
              <div className="flex gap-1" key={domain || `new-domain-${index}`}>
                <input
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  onChange={(e) => updateDomain(index, e.target.value)}
                  placeholder="localhost:4000"
                  type="text"
                  value={domain}
                />
                <button
                  className="px-2 py-1 text-red-600 text-xs hover:text-red-800"
                  onClick={() => removeDomain(index)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="text-blue-600 text-xs hover:text-blue-800"
              onClick={addDomain}
              type="button"
            >
              + Add Domain
            </button>
          </div>
        </div>

        {/* Endpoints Section */}
        <div>
          <span className="mb-2 block font-medium text-gray-700 text-xs dark:text-gray-300">
            API Endpoints
          </span>
          <div className="space-y-1">
            {settings.endpoints.map((endpoint, index) => (
              <div
                className="flex gap-1"
                key={endpoint || `new-endpoint-${index}`}
              >
                <input
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  onChange={(e) => updateEndpoint(index, e.target.value)}
                  placeholder="/cubejs-api/v1/load"
                  type="text"
                  value={endpoint}
                />
                <button
                  className="px-2 py-1 text-red-600 text-xs hover:text-red-800"
                  onClick={() => removeEndpoint(index)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="text-blue-600 text-xs hover:text-blue-800"
              onClick={addEndpoint}
              type="button"
            >
              + Add Endpoint
            </button>
          </div>
        </div>

        {/* JWT Tokens Section */}
        <div>
          <span className="mb-2 block font-medium text-gray-700 text-xs dark:text-gray-300">
            JWT Tokens (per domain)
          </span>
          {settings.domains.map((domain) => (
            <div className="mb-2" key={domain}>
              <span className="mb-1 block text-gray-500 text-xs dark:text-gray-400">
                {domain}
              </span>
              <input
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    jwtTokens: {
                      ...prev.jwtTokens,
                      [domain]: e.target.value,
                    },
                  }))
                }
                placeholder="JWT token for this domain"
                type="password"
                value={settings.jwtTokens[domain] || ''}
              />
            </div>
          ))}
        </div>

        {/* Auto Capture Toggle */}
        <div>
          <label className="flex items-center">
            <input
              checked={settings.autoCapture}
              className="mr-2 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  autoCapture: e.target.checked,
                }))
              }
              type="checkbox"
            />
            <span className="text-gray-700 text-xs dark:text-gray-300">
              Auto-capture requests
            </span>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            className="rounded bg-blue-600 px-3 py-1 font-medium text-white text-xs transition-colors hover:bg-blue-700 data-saved:bg-green-600"
            data-saved={saved || undefined}
            onClick={saveSettings}
            type="button"
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
