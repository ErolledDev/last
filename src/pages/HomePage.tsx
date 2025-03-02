import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

const HomePage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/dashboard');
      } else {
        await signUp(email, password, businessName);
        // After signup, user will be automatically logged in
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to ' + (isLogin ? 'log in' : 'sign up'));
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Column - Marketing Content */}
      <div className="bg-blue-600 text-white p-8 flex flex-col justify-center md:w-1/2">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <MessageSquare size={32} />
            <h1 className="text-3xl font-bold ml-2">ChatWidget</h1>
          </div>
          <h2 className="text-2xl font-bold mb-4">Engage Your Visitors with Smart Chat</h2>
          <p className="mb-6">
            Boost conversions with our intelligent chat widget. Automate responses, 
            provide advanced interactions, and connect with visitors in real-time.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Auto Replies</h3>
                <p className="text-sm">Set up keyword-based responses to common questions</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-semibold">AI-Powered Conversations</h3>
                <p className="text-sm">Let AI handle complex inquiries based on your business context</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Live Agent Support</h3>
                <p className="text-sm">Take control when needed with live chat capabilities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="bg-white p-8 flex items-center justify-center md:w-1/2">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Log in to your account' : 'Create your account'}
          </h2>
          
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="businessName">
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;