import { useEffect, useState } from 'react';
import type { Settings } from '../types';

export default function App() {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="mb-6 font-bold text-2xl text-gray-900">
            Cube Explorer Settings
          </h1>

          {/* Domains Section */}
          <div className="mb-6">
            <span className="mb-2 block font-medium text-gray-700 text-sm">
              Domains to Monitor
            </span>
            <div className="space-y-2">
              {settings.domains.map((domain, index) => (
                <div className="flex gap-2" key={domain}>
                  <input
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => updateDomain(index, e.target.value)}
                    placeholder="localhost:4000"
                    type="text"
                    value={domain}
                  />
                  <button
                    className="px-3 py-2 text-red-600 text-sm hover:text-red-800"
                    onClick={() => removeDomain(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="text-blue-600 text-sm hover:text-blue-800"
                onClick={addDomain}
                type="button"
              >
                + Add Domain
              </button>
            </div>
          </div>

          {/* Endpoints Section */}
          <div className="mb-6">
            <span className="mb-2 block font-medium text-gray-700 text-sm">
              API Endpoints
            </span>
            <div className="space-y-2">
              {settings.endpoints.map((endpoint, index) => (
                <div className="flex gap-2" key={endpoint}>
                  <input
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => updateEndpoint(index, e.target.value)}
                    placeholder="/cubejs-api/v1/load"
                    type="text"
                    value={endpoint}
                  />
                  <button
                    className="px-3 py-2 text-red-600 text-sm hover:text-red-800"
                    onClick={() => removeEndpoint(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="text-blue-600 text-sm hover:text-blue-800"
                onClick={addEndpoint}
                type="button"
              >
                + Add Endpoint
              </button>
            </div>
          </div>

          {/* JWT Tokens Section */}
          <div className="mb-6">
            <span className="mb-2 block font-medium text-gray-700 text-sm">
              JWT Tokens (per domain)
            </span>
            {settings.domains.map((domain) => (
              <div className="mb-2" key={domain}>
                <span className="mb-1 block text-gray-500 text-xs">
                  {domain}
                </span>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mb-6">
            <label className="flex items-center">
              <input
                checked={settings.autoCapture}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoCapture: e.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span className="text-gray-700 text-sm">
                Auto-capture requests
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              className={`rounded-md px-4 py-2 font-medium text-sm transition-colors ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={saveSettings}
              type="button"
            >
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
