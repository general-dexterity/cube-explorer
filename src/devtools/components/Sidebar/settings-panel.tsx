import { Field } from '@ark-ui/react';
import { useEffect, useState } from 'react';
import { version } from '../../../../package.json';
import { SETTINGS_STORAGE_KEY, SETTINGS_VERSION } from '../../../constants';
import type { Settings } from '../../../types';

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    urls: ['http://localhost:4000/cubejs-api/v1'],
    autoCapture: true,
    version: SETTINGS_VERSION,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing settings
    chrome.storage.sync.get([SETTINGS_STORAGE_KEY], (result) => {
      if (result[SETTINGS_STORAGE_KEY]) {
        setSettings(result[SETTINGS_STORAGE_KEY]);
      }
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ [SETTINGS_STORAGE_KEY]: settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const addUrl = () => {
    setSettings((prev) => ({
      ...prev,
      urls: [...prev.urls, ''],
    }));
  };

  const updateUrl = (index: number, value: string) => {
    setSettings((prev) => ({
      ...prev,
      urls: prev.urls.map((u, i) => (i === index ? value : u)),
    }));
  };

  const removeUrl = (index: number) => {
    // Don't allow removing the default URL
    if (settings.urls[index] === 'http://localhost:4000/cubejs-api/v1') {
      return;
    }
    setSettings((prev) => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex-1 overflow-auto bg-white p-4 dark:bg-gray-800">
      <div className="space-y-4">
        {/* URLs Section */}
        <div>
          <span className="mb-2 block font-medium text-gray-700 text-xs dark:text-gray-300">
            URLs to Monitor
          </span>
          <div className="space-y-1">
            {settings.urls.map((url, index) => {
              const isDefaultUrl =
                url === 'http://localhost:4000/cubejs-api/v1' && index === 0;
              return (
                <div className="flex gap-1" key={index}>
                  <Field.Root className="flex-1 flex">
                    <Field.Input
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      defaultValue={url}
                      disabled={isDefaultUrl}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      placeholder="http://localhost:4000/cubejs-api/v1"
                    />
                    <Field.ErrorText>Error Info</Field.ErrorText>
                  </Field.Root>
                  {!isDefaultUrl && (
                    <button
                      className="px-2 py-1 text-red-600 text-xs hover:text-red-800"
                      onClick={() => removeUrl(index)}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
            <button
              className="text-blue-600 text-xs hover:text-blue-800"
              onClick={addUrl}
              type="button"
            >
              + Add URL
            </button>
          </div>
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

        {/* Version Display */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <span className="text-gray-500 text-xs dark:text-gray-400">
              Cube Explorer - v{version}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
