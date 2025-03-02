export interface User {
  id: string;
  email: string;
  businessName: string;
  createdAt: string;
}

export interface WidgetSettings {
  id: string;
  userId: string;
  businessName: string;
  primaryColor: string;
  salesRepName: string;
  welcomeMessage: string;
  fallbackMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoReply {
  id: string;
  userId: string;
  keywords: string[];
  matchingType: 'word' | 'fuzzy' | 'regex' | 'synonym';
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvancedReply {
  id: string;
  userId: string;
  keywords: string[];
  matchingType: 'word' | 'fuzzy' | 'regex' | 'synonym';
  responseType: 'text' | 'url';
  response: string;
  buttonText: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiSettings {
  id: string;
  userId: string;
  enabled: boolean;
  apiKey: string;
  model: string;
  businessContext: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  sender: 'user' | 'bot' | 'agent';
  message: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  visitorId: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}