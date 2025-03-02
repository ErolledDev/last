import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AdvancedReply } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash, Upload, Download } from 'lucide-react';

const AdvancedReplyTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [advancedReplies, setAdvancedReplies] = useState<AdvancedReply[]>([]);
  const [newReply, setNewReply] = useState<AdvancedReply>({
    id: '',
    userId: user?.id || '',
    keywords: [],
    matchingType: 'word',
    responseType: 'text',
    response: '',
    buttonText: 'Click here',
    createdAt: '',
    updatedAt: ''
  });
  const [keywordsInput, setKeywordsInput] = useState('');

  useEffect(() => {
    const fetchAdvancedReplies = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('advanced_replies')
          .select('*')
          .eq('userId', user.id)
          .order('createdAt', { ascending: false });
        
        if (error) throw error;
        
        setAdvancedReplies(data as AdvancedReply[]);
      } catch (error) {
        console.error('Error fetching advanced replies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdvancedReplies();
  }, [user]);

  const handleAddReply = async () => {
    if (!user || !keywordsInput.trim() || !newReply.response.trim() || !newReply.buttonText.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);
      
      const replyToAdd: AdvancedReply = {
        id: uuidv4(),
        userId: user.id,
        keywords,
        matchingType: newReply.matchingType,
        responseType: newReply.responseType,
        response: newReply.response,
        buttonText: newReply.buttonText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('advanced_replies')
        .insert([replyToAdd]);
      
      if (error) throw error;
      
      setAdvancedReplies([replyToAdd, ...advancedReplies]);
      setNewReply({
        id: '',
        userId: user.id,
        keywords: [],
        matchingType: 'word',
        responseType: 'text',
        response: '',
        buttonText: 'Click here',
        createdAt: '',
        updatedAt: ''
      });
      setKeywordsInput('');
    } catch (error) {
      console.error('Error adding advanced reply:', error);
      alert('Failed to add advanced reply. Please try again.');
    }
  };

  const handleDeleteReply = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advanced reply?')) return;
    
    try {
      const { error } = await supabase
        .from('advanced_replies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAdvancedReplies(advancedReplies.filter(reply => reply.id !== id));
    } catch (error) {
      console.error('Error deleting advanced reply:', error);
      alert('Failed to delete advanced reply. Please try again.');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(advancedReplies, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'advanced-replies.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedReplies = JSON.parse(content) as AdvancedReply[];
        
        // Validate the imported data
        if (!Array.isArray(importedReplies)) {
          throw new Error('Invalid import format');
        }
        
        // Prepare replies for import
        const repliesToImport = importedReplies.map(reply => ({
          ...reply,
          id: uuidv4(),
          userId: user?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        // Insert into database
        const { error } = await supabase
          .from('advanced_replies')
          .insert(repliesToImport);
        
        if (error) throw error;
        
        // Refresh the list
        const { data, error: fetchError } = await supabase
          .from('advanced_replies')
          .select('*')
          .eq('userId', user?.id)
          .order('createdAt', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        setAdvancedReplies(data as AdvancedReply[]);
        alert('Advanced replies imported successfully!');
      } catch (error) {
        console.error('Error importing advanced replies:', error);
        alert('Failed to import advanced replies. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return <div>Loading advanced replies...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Advanced Reply</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
          >
            <Download size={16} className="mr-1" />
            Export
          </button>
          <label className="flex items-center bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 cursor-pointer">
            <Upload size={16} className="mr-1" />
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Advanced Reply</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keywords (comma separated)
          </label>
          <input
            type="text"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g. pricing, cost, price"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matching Type
          </label>
          <select
            value={newReply.matchingType}
            onChange={(e) => setNewReply({...newReply, matchingType: e.target.value as any})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="word">Word Match</option>
            <option value="fuzzy">Fuzzy Match</option>
            <option value="regex">Regular Expression</option>
            <option value="synonym">Synonym Match</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Response Type
          </label>
          <select
            value={newReply.responseType}
            onChange={(e) => setNewReply({...newReply, responseType: e.target.value as any})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="text">Text</option>
            <option value="url">URL</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {newReply.responseType === 'url' ? 'URL' : 'Response Text (HTML allowed)'}
          </label>
          <textarea
            value={newReply.response}
            onChange={(e) => setNewReply({...newReply, response: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={newReply.responseType === 'url' ? 'https://example.com' : 'Enter your response here...'}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={newReply.buttonText}
            onChange={(e) => setNewReply({...newReply, buttonText: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g. Learn More"
          />
        </div>
        
        <button
          onClick={handleAddReply}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={16} className="mr-1" />
          Add Reply
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Your Advanced Replies</h2>
        
        {advancedReplies.length === 0 ? (
          <p className="text-gray-500">No advanced replies yet. Add your first one above!</p>
        ) : (
          <div className="space-y-4">
            {advancedReplies.map((reply) => (
              <div key={reply.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-500">Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {reply.keywords.map((keyword, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-500">Matching Type:</span>
                      <span className="ml-2">{reply.matchingType}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-500">Response Type:</span>
                      <span className="ml-2">{reply.responseType}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-500">Response:</span>
                      <p className="mt-1 text-gray-800 whitespace-pre-wrap">{reply.response}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Button Text:</span>
                      <span className="ml-2">{reply.buttonText}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedReplyTab;