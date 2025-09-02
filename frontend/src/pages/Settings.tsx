import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Settings as SettingsType } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>({
    whatsapp: {
      apiKey: '',
      sid: '',
      phoneNumber: '',
    },

  });

  const [showWhatsAppKey, setShowWhatsAppKey] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      // Silently handle settings loading errors
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: keyof SettingsType, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const getSaveButtonText = () => {
    if (isSaving) return 'Saving...';
    if (saveStatus === 'success') return 'Saved!';
    if (saveStatus === 'error') return 'Error!';
    return 'Save Settings';
  };

  const getSaveButtonClass = () => {
    let baseClass = 'btn-primary flex items-center space-x-2 w-full sm:w-auto';
    if (saveStatus === 'success') baseClass += ' bg-green-600 hover:bg-green-700';
    if (saveStatus === 'error') baseClass += ' bg-red-600 hover:bg-red-700';
    return baseClass;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">⚙️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              API Configuration
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your API keys and credentials for WhatsApp Business integration.
            </p>
          </div>
        </div>

        {/* WhatsApp Configuration */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mr-3">
                📱
              </span>
              WhatsApp Business API
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showWhatsAppKey ? 'text' : 'password'}
                    value={settings.whatsapp.apiKey}
                    onChange={(e) => handleInputChange('whatsapp', 'apiKey', e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter your WhatsApp API key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppKey(!showWhatsAppKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showWhatsAppKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account SID
                </label>
                <input
                  type="text"
                  value={settings.whatsapp.sid}
                  onChange={(e) => handleInputChange('whatsapp', 'sid', e.target.value)}
                  className="input-field"
                  placeholder="Enter your Twilio Account SID"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.whatsapp.phoneNumber}
                  onChange={(e) => handleInputChange('whatsapp', 'phoneNumber', e.target.value)}
                  className="input-field"
                  placeholder="+1234567890"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
            </div>
          </div>


        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={getSaveButtonClass()}
          >
            {saveStatus === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : saveStatus === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{getSaveButtonText()}</span>
          </button>
        </div>

        {/* Status Messages */}
        {saveStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Settings saved successfully! Your API keys are now configured.
            </p>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ Failed to save settings. Please try again.
            </p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Need Help?
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>WhatsApp Business API:</strong> You'll need a Twilio account with WhatsApp Business API access. 
            Get your API key and SID from the Twilio Console.
          </p>

          <p>
            <strong>Security:</strong> All API keys are encrypted and stored securely on the backend. 
            They are never exposed in the frontend code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
