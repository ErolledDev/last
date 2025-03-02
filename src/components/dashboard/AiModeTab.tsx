import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AiSettings } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const AiModeTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AiSettings>({
    id: '',
    userId: user?.id || '',
    enabled: false,
    apiKey: '',
    model: 'gpt-3.5-turbo',
    businessContext: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('ai_settings')
          .select('*')
          .eq('userId', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setSettings(data as AiSettings);
        }
      } catch (error) {
        console.error('Error fetching AI settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      };
      
      if (!settings.id) {
        // Create new settings
        const newSettings = {
          ...updatedSettings,
          id: uuidv4(),
          userId: user.id,
          createdAt: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('ai_settings')
          .insert([newSettings]);
        
        if (error) throw error;
        
        setSettings(newSettings);
      } else {
        // Update existing settings
        const { error } = await supabase
          .from('ai_settings')
          .update(updatedSettings)
          .eq('id', settings.id);
        
        if (error) throw error;
      }
      
      alert('AI settings saved successfully!');
    } catch (error) {
      console.error('Error saving AI settings:', error);
      alert('Failed to save AI settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading AI settings...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI Mode</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={settings.enabled}
              onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm font-medium text-gray-700">
              Enable AI Mode
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            When enabled, AI will respond to messages that don't match any auto or advanced replies.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            name="apiKey"
            value={settings.apiKey}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your OpenAI API key"
            disabled={!settings.enabled}
          />
          <p className="mt-1 text-sm text-gray-500">
            Your API key is stored securely and never shared.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            AI Model
          </label>
          <select
            name="model"
            value={settings.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={!settings.enabled}
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Context Information
          </label>
          <textarea
            name="businessContext"
            value={settings.businessContext}
            onChange={handleChange}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Provide information about your business, products, services, pricing, etc. This will help the AI generate more accurate and relevant responses."
            disabled={!settings.enabled}
          />
          <p className="mt-1 text-sm text-gray-500">
            This information will be used to guide the AI's responses. Be detailed and specific.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AiModeTab;