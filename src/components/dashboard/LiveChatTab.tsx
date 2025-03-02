import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ChatSession, ChatMessage } from '../../types';
import { Send } from 'lucide-react';

const LiveChatTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('userId', user.id)
          .eq('status', 'active')
          .order('createdAt', { ascending: false });
        
        if (error) throw error;
        
        setSessions(data as ChatSession[]);
        
        // Select the first session by default if available
        if (data.length > 0 && !selectedSession) {
          setSelectedSession(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
    
    // Set up real-time subscription for new sessions
    const sessionsSubscription = supabase
      .channel('public:chat_sessions')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_sessions',
        filter: `userId=eq.${user?.id}`
      }, (payload) => {
        setSessions(prev => [payload.new as ChatSession, ...prev]);
      })
      .subscribe();
    
    return () => {
      sessionsSubscription.unsubscribe();
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user]);
  
  useEffect(() => {
    if (!selectedSession) return;
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('sessionId', selectedSession)
          .order('timestamp', { ascending: true });
        
        if (error) throw error;
        
        setMessages(data as ChatMessage[]);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages in this session
    if (subscription) {
      subscription.unsubscribe();
    }
    
    const messagesSubscription = supabase
      .channel(`public:chat_messages:${selectedSession}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `sessionId=eq.${selectedSession}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();
    
    setSubscription(messagesSubscription);
    
    return () => {
      if (messagesSubscription) {
        messagesSubscription.unsubscribe();
      }
    };
  }, [selectedSession]);
  
  const handleSendMessage = async () => {
    if (!user || !selectedSession || !newMessage.trim()) return;
    
    try {
      const message: Partial<ChatMessage> = {
        sessionId: selectedSession,
        userId: user.id,
        sender: 'agent',
        message: newMessage,
        timestamp: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('chat_messages')
        .insert([message]);
      
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };
  
  const toggleLiveMode = async () => {
    setIsLive(!isLive);
    
    // Here you would typically update a status in your database
    // to indicate that the agent is available/unavailable
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return <div>Loading chat sessions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Chat</h1>
        <div>
          <button
            onClick={toggleLiveMode}
            className={`px-4 py-2 rounded ${
              isLive 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {isLive ? 'Live Agent Mode: ON' : 'Live Agent Mode: OFF'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 h-[600px]">
          {/* Sessions List */}
          <div className="md:col-span-1 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">Active Conversations</h2>
            </div>
            
            {sessions.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                No active conversations
              </div>
            ) : (
              <div>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedSession === session.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <div className="font-medium">Visitor {session.visitorId.substring(0, 8)}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(session.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Chat Area */}
          <div className="md:col-span-3 flex flex-col">
            {selectedSession ? (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      No messages in this conversation yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                              msg.sender === 'agent'
                                ? 'bg-blue-600 text-white'
                                : msg.sender === 'bot'
                                ? 'bg-gray-300 text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="text-sm mb-1">
                              {msg.sender === 'agent' ? 'You' : msg.sender === 'bot' ? 'Bot' : 'Visitor'}
                            </div>
                            <div>{msg.message}</div>
                            <div className="text-xs text-right mt-1 opacity-70">
                              {formatTimestamp(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={!isLive}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
                      disabled={!isLive || !newMessage.trim()}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {!isLive && (
                    <div className="mt-2 text-sm text-red-500">
                      Enable Live Agent Mode to respond to this conversation
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">
                  Select a conversation to view messages
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatTab;