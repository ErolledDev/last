/*
  # Create initial schema for chat widget system

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `businessName` (text)
      - `createdAt` (timestamp)
    
    - `widget_settings`
      - `id` (uuid, primary key)
      - `userId` (uuid, foreign key to users.id)
      - `businessName` (text)
      - `primaryColor` (text)
      - `salesRepName` (text)
      - `welcomeMessage` (text)
      - `fallbackMessage` (text)
      - `createdAt` (timestamp)
      - `updatedAt` (timestamp)
    
    - `auto_replies`
      - `id` (uuid, primary key)
      - `userId` (uuid, foreign key to users.id)
      - `keywords` (text array)
      - `matchingType` (text)
      - `response` (text)
      - `createdAt` (timestamp)
      - `updatedAt` (timestamp)
    
    - `advanced_replies`
      - `id` (uuid, primary key)
      - `userId` (uuid, foreign key to users.id)
      - `keywords` (text array)
      - `matchingType` (text)
      - `responseType` (text)
      - `response` (text)
      - `buttonText` (text)
      - `createdAt` (timestamp)
      - `updatedAt` (timestamp)
    
    - `ai_settings`
      - `id` (uuid, primary key)
      - `userId` (uuid, foreign key to users.id)
      - `enabled` (boolean)
      - `apiKey` (text)
      - `model` (text)
      - `businessContext` (text)
      - `createdAt` (timestamp)
      - `updatedAt` (timestamp)
    
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `userId` (uuid, foreign key to users.id)
      - `visitorId` (text)
      - `status` (text)
      - `createdAt` (timestamp)
      - `updatedAt` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `sessionId` (uuid, foreign key to chat_sessions.id)
      - `userId` (uuid, foreign key to users.id)
      - `sender` (text)
      - `message` (text)
      - `timestamp` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  businessName text NOT NULL,
  createdAt timestamptz DEFAULT now()
);

-- Create widget_settings table
CREATE TABLE IF NOT EXISTS widget_settings (
  id uuid PRIMARY KEY,
  userId uuid REFERENCES users(id) NOT NULL,
  businessName text NOT NULL,
  primaryColor text NOT NULL DEFAULT '#3B82F6',
  salesRepName text,
  welcomeMessage text NOT NULL DEFAULT 'Hi there! How can I help you today?',
  fallbackMessage text NOT NULL DEFAULT 'Thanks for your message. We''ll get back to you as soon as possible.',
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- Create auto_replies table
CREATE TABLE IF NOT EXISTS auto_replies (
  id uuid PRIMARY KEY,
  userId uuid REFERENCES users(id) NOT NULL,
  keywords text[] NOT NULL,
  matchingType text NOT NULL DEFAULT 'word',
  response text NOT NULL,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- Create advanced_replies table
CREATE TABLE IF NOT EXISTS advanced_replies (
  id uuid PRIMARY KEY,
  userId uuid REFERENCES users(id) NOT NULL,
  keywords text[] NOT NULL,
  matchingType text NOT NULL DEFAULT 'word',
  responseType text NOT NULL DEFAULT 'text',
  response text NOT NULL,
  buttonText text NOT NULL DEFAULT 'Click here',
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- Create ai_settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY,
  userId uuid REFERENCES users(id) NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  apiKey text,
  model text NOT NULL DEFAULT 'gpt-3.5-turbo',
  businessContext text,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY,
  userId uuid REFERENCES users(id) NOT NULL,
  visitorId text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sessionId uuid REFERENCES chat_sessions(id) NOT NULL,
  userId uuid REFERENCES users(id) NOT NULL,
  sender text NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE advanced_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for widget_settings table
CREATE POLICY "Users can manage their own widget settings"
  ON widget_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = userId);

-- Create policies for auto_replies table
CREATE POLICY "Users can manage their own auto replies"
  ON auto_replies
  FOR ALL
  TO authenticated
  USING (auth.uid() = userId);

-- Create policies for advanced_replies table
CREATE POLICY "Users can manage their own advanced replies"
  ON advanced_replies
  FOR ALL
  TO authenticated
  USING (auth.uid() = userId);

-- Create policies for ai_settings table
CREATE POLICY "Users can manage their own AI settings"
  ON ai_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = userId);

-- Create policies for chat_sessions table
CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = userId);

-- Create policies for chat_messages table
CREATE POLICY "Users can manage their own chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = userId);