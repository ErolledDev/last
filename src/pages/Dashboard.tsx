import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, MessageSquare, MessageSquareText, 
  BrainCircuit, Users, LogOut 
} from 'lucide-react';

import WidgetSettingsTab from '../components/dashboard/WidgetSettingsTab';
import AutoReplyTab from '../components/dashboard/AutoReplyTab';
import AdvancedReplyTab from '../components/dashboard/AdvancedReplyTab';
import AiModeTab from '../components/dashboard/AiModeTab';
import LiveChatTab from '../components/dashboard/LiveChatTab';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="bg-gray-800 text-white md:w-64 md:flex-shrink-0">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-2" size={24} />
            <span className="font-bold text-xl">ChatWidget</span>
          </div>
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className={`md:block ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-4 py-2 text-gray-400 text-sm">
            {user?.businessName}
          </div>
          
          <nav className="mt-4">
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-3 ${isActive('/dashboard') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="mr-3" size={20} />
              <span>Widget Settings</span>
            </Link>
            
            <Link
              to="/dashboard/auto-reply"
              className={`flex items-center px-4 py-3 ${isActive('/dashboard/auto-reply') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquare className="mr-3" size={20} />
              <span>Auto Reply</span>
            </Link>
            
            <Link
              to="/dashboard/advanced-reply"
              className={`flex items-center px-4 py-3 ${isActive('/dashboard/advanced-reply') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquareText className="mr-3" size={20} />
              <span>Advanced Reply</span>
            </Link>
            
            <Link
              to="/dashboard/ai-mode"
              className={`flex items-center px-4 py-3 ${isActive('/dashboard/ai-mode') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BrainCircuit className="mr-3" size={20} />
              <span>AI Mode</span>
            </Link>
            
            <Link
              to="/dashboard/live-chat"
              className={`flex items-center px-4 py-3 ${isActive('/dashboard/live-chat') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="mr-3" size={20} />
              <span>Live Chat</span>
            </Link>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-gray-700 px-4 py-2">
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <LogOut className="mr-3" size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Routes>
            <Route path="/" element={<WidgetSettingsTab />} />
            <Route path="/auto-reply" element={<AutoReplyTab />} />
            <Route path="/advanced-reply" element={<AdvancedReplyTab />} />
            <Route path="/ai-mode" element={<AiModeTab />} />
            <Route path="/live-chat" element={<LiveChatTab />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;