import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { WidgetSettings } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const WidgetSettingsTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WidgetSettings>({
    id: '',
    userId: user?.id || '',
    businessName: user?.businessName || '',
    primaryColor: '#3B82F6',
    salesRepName: '',
    welcomeMessage: 'Hi there! How can I help you today?',
    fallbackMessage: 'Thanks for your message. We\'ll get back to you as soon as possible.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('widget_settings')
          .select('*')
          .eq('userId', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setSettings(data as WidgetSettings);
        }
      } catch (error) {
        console.error('Error fetching widget settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
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
          .from('widget_settings')
          .insert([newSettings]);
        
        if (error) throw error;
        
        setSettings(newSettings);
      } else {
        // Update existing settings
        const { error } = await supabase
          .from('widget_settings')
          .update(updatedSettings)
          .eq('id', settings.id);
        
        if (error) throw error;
      }
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving widget settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getWidgetCode = () => {
    if (!user) return '';
    
    return `<script src="https://widget-chat-app.netlify.app/chat.js"></script>
<script>
  new BusinessChatPlugin({
    uid: '${user.id}'
  });
</script>`;
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Widget Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Installation Code</h2>
        <p className="mb-3">Add this code to your website before the closing body tag:</p>
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <pre className="whitespace-pre-wrap">{getWidgetCode()}</pre>
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => navigator.clipboard.writeText(getWidgetCode())}
        >
          Copy to Clipboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Customize Your Widget</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={settings.businessName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                className="h-10 w-10 mr-2"
              />
              <input
                type="text"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales Representative Name
            </label>
            <input
              type="text"
              name="salesRepName"
              value={settings.salesRepName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. John Smith"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Welcome Message
          </label>
          <textarea
            name="welcomeMessage"
            value={settings.welcomeMessage}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Hi there! How can I help you today?"
          />
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fallback Message (when no auto-reply matches and AI is off)
          </label>
          <textarea
            name="fallbackMessage"
            value={settings.fallbackMessage}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Thanks for your message. We'll get back to you as soon as possible."
          />
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSettingsTab;