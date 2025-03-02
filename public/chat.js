// Chat Widget Implementation
(function() {
  class BusinessChatPlugin {
    constructor(config) {
      this.config = config;
      this.userId = config.uid;
      this.chatOpen = false;
      this.messages = [];
      this.sessionId = null;
      this.visitorId = this.generateVisitorId();
      
      // Initialize the widget
      this.init();
    }

    // Generate a unique visitor ID
    generateVisitorId() {
      return 'visitor_' + Math.random().toString(36).substring(2, 15);
    }

    // Initialize the widget
    async init() {
      // Create widget styles
      this.createStyles();
      
      // Create widget HTML
      this.createWidgetHTML();
      
      // Add event listeners
      this.addEventListeners();
      
      // Fetch widget settings
      await this.fetchWidgetSettings();
      
      // Create a new chat session
      await this.createChatSession();
    }

    // Create widget styles
    createStyles() {
      const styleEl = document.createElement('style');
      styleEl.innerHTML = `
        .chat-widget-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .chat-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .chat-widget-button:hover {
          transform: scale(1.05);
        }
        
        .chat-widget-icon {
          width: 30px;
          height: 30px;
          fill: white;
        }
        
        .chat-widget-popup {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 450px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
        }
        
        .chat-widget-popup.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        
        .chat-widget-header {
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
        }
        
        .chat-widget-title {
          font-weight: 600;
          font-size: 16px;
        }
        
        .chat-widget-close {
          cursor: pointer;
          font-size: 20px;
        }
        
        .chat-widget-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .chat-widget-message {
          max-width: 80%;
          padding: 10px 15px;
          border-radius: 18px;
          margin-bottom: 10px;
          word-break: break-word;
        }
        
        .chat-widget-message.user {
          align-self: flex-end;
          background-color: #e6f7ff;
          border-bottom-right-radius: 4px;
        }
        
        .chat-widget-message.bot, .chat-widget-message.agent {
          align-self: flex-start;
          background-color: #f1f1f1;
          border-bottom-left-radius: 4px;
        }
        
        .chat-widget-input-container {
          padding: 15px;
          border-top: 1px solid #eee;
          display: flex;
        }
        
        .chat-widget-input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        }
        
        .chat-widget-send {
          background: none;
          border: none;
          margin-left: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chat-widget-send-icon {
          width: 20px;
          height: 20px;
        }
        
        .chat-widget-button-container {
          margin-top: 10px;
          display: flex;
          justify-content: center;
        }
        
        .chat-widget-action-button {
          padding: 8px 16px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          margin: 0 5px;
          transition: all 0.2s ease;
        }
        
        .chat-widget-action-button:hover {
          opacity: 0.9;
        }
        
        .chat-widget-typing {
          align-self: flex-start;
          background-color: #f1f1f1;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          padding: 10px 15px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        
        .chat-widget-typing-dot {
          width: 8px;
          height: 8px;
          background-color: #888;
          border-radius: 50%;
          margin: 0 2px;
          animation: typing-dot 1.4s infinite ease-in-out;
        }
        
        .chat-widget-typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .chat-widget-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .chat-widget-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing-dot {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-5px);
          }
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Create widget HTML
    createWidgetHTML() {
      const container = document.createElement('div');
      container.className = 'chat-widget-container';
      
      // Chat button
      const button = document.createElement('div');
      button.className = 'chat-widget-button';
      button.innerHTML = `
        <svg class="chat-widget-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"/>
        </svg>
      `;
      
      // Chat popup
      const popup = document.createElement('div');
      popup.className = 'chat-widget-popup';
      
      // Chat header
      const header = document.createElement('div');
      header.className = 'chat-widget-header';
      
      const title = document.createElement('div');
      title.className = 'chat-widget-title';
      title.textContent = 'Chat Support';
      
      const close = document.createElement('div');
      close.className = 'chat-widget-close';
      close.innerHTML = '&times;';
      
      header.appendChild(title);
      header.appendChild(close);
      
      // Chat messages
      const messages = document.createElement('div');
      messages.className = 'chat-widget-messages';
      
      // Chat input
      const inputContainer = document.createElement('div');
      inputContainer.className = 'chat-widget-input-container';
      
      const input = document.createElement('input');
      input.className = 'chat-widget-input';
      input.type = 'text';
      input.placeholder = 'Type a message...';
      
      const send = document.createElement('button');
      send.className = 'chat-widget-send';
      send.innerHTML = `
        <svg class="chat-widget-send-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      `;
      
      inputContainer.appendChild(input);
      inputContainer.appendChild(send);
      
      // Assemble popup
      popup.appendChild(header);
      popup.appendChild(messages);
      popup.appendChild(inputContainer);
      
      // Assemble container
      container.appendChild(popup);
      container.appendChild(button);
      
      // Add to document
      document.body.appendChild(container);
      
      // Store references
      this.container = container;
      this.button = button;
      this.popup = popup;
      this.header = header;
      this.messagesContainer = messages;
      this.input = input;
      this.sendButton = send;
      this.title = title;
    }

    // Add event listeners
    addEventListeners() {
      // Toggle chat on button click
      this.button.addEventListener('click', () => {
        this.toggleChat();
      });
      
      // Close chat on close button click
      this.popup.querySelector('.chat-widget-close').addEventListener('click', () => {
        this.toggleChat(false);
      });
      
      // Send message on send button click
      this.sendButton.addEventListener('click', () => {
        this.sendMessage();
      });
      
      // Send message on enter key
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }

    // Toggle chat open/closed
    toggleChat(open = !this.chatOpen) {
      this.chatOpen = open;
      
      if (open) {
        this.popup.classList.add('open');
        this.input.focus();
        
        // Show welcome message if no messages yet
        if (this.messages.length === 0 && this.widgetSettings) {
          this.addMessage(this.widgetSettings.welcomeMessage || 'Hi there! How can I help you today?', 'bot');
        }
      } else {
        this.popup.classList.remove('open');
      }
    }

    // Add a message to the chat
    addMessage(text, sender, options = {}) {
      // Create message element
      const messageEl = document.createElement('div');
      messageEl.className = `chat-widget-message ${sender}`;
      messageEl.innerHTML = text;
      
      // Add to messages container
      this.messagesContainer.appendChild(messageEl);
      
      // Store message
      this.messages.push({
        text,
        sender,
        timestamp: new Date().toISOString()
      });
      
      // Scroll to bottom
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      
      // If it's an advanced reply with a button
      if (options.buttonText && options.buttonAction) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'chat-widget-button-container';
        
        const button = document.createElement('button');
        button.className = 'chat-widget-action-button';
        button.textContent = options.buttonText;
        button.style.backgroundColor = this.widgetSettings?.primaryColor || '#3B82F6';
        button.style.color = 'white';
        
        button.addEventListener('click', () => {
          if (options.responseType === 'url') {
            window.open(options.buttonAction, '_blank');
          } else {
            this.addMessage(options.buttonAction, 'bot');
          }
        });
        
        buttonContainer.appendChild(button);
        this.messagesContainer.appendChild(buttonContainer);
      }
    }

    // Show typing indicator
    showTypingIndicator() {
      const typingEl = document.createElement('div');
      typingEl.className = 'chat-widget-typing';
      typingEl.innerHTML = `
        <div class="chat-widget-typing-dot"></div>
        <div class="chat-widget-typing-dot"></div>
        <div class="chat-widget-typing-dot"></div>
      `;
      
      this.messagesContainer.appendChild(typingEl);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      
      return typingEl;
    }

    // Hide typing indicator
    hideTypingIndicator(typingEl) {
      if (typingEl && typingEl.parentNode) {
        typingEl.parentNode.removeChild(typingEl);
      }
    }

    // Send a message
    async sendMessage() {
      const text = this.input.value.trim();
      
      if (!text) return;
      
      // Clear input
      this.input.value = '';
      
      // Add user message to chat
      this.addMessage(text, 'user');
      
      // Save message to database
      await this.saveMessage(text, 'user');
      
      // Show typing indicator
      const typingIndicator = this.showTypingIndicator();
      
      // Process the message
      setTimeout(async () => {
        this.hideTypingIndicator(typingIndicator);
        await this.processMessage(text);
      }, 1000);
    }

    // Process incoming message
    async processMessage(text) {
      try {
        // Check for auto replies
        const autoReply = await this.checkAutoReplies(text);
        if (autoReply) {
          this.addMessage(autoReply, 'bot');
          await this.saveMessage(autoReply, 'bot');
          return;
        }
        
        // Check for advanced replies
        const advancedReply = await this.checkAdvancedReplies(text);
        if (advancedReply) {
          this.addMessage(advancedReply.response, 'bot', {
            buttonText: advancedReply.buttonText,
            buttonAction: advancedReply.responseType === 'url' ? advancedReply.response : advancedReply.response,
            responseType: advancedReply.responseType
          });
          await this.saveMessage(advancedReply.response, 'bot');
          return;
        }
        
        // Check for AI mode
        const aiReply = await this.checkAiMode(text);
        if (aiReply) {
          this.addMessage(aiReply, 'bot');
          await this.saveMessage(aiReply, 'bot');
          return;
        }
        
        // Fallback message
        const fallbackMessage = this.widgetSettings?.fallbackMessage || "Thanks for your message. We'll get back to you as soon as possible.";
        this.addMessage(fallbackMessage, 'bot');
        await this.saveMessage(fallbackMessage, 'bot');
      } catch (error) {
        console.error('Error processing message:', error);
        this.addMessage("Sorry, there was an error processing your message.", 'bot');
      }
    }

    // Fetch widget settings
    async fetchWidgetSettings() {
      try {
        const response = await fetch(`${this.getSupabaseUrl()}/rest/v1/widget_settings?userId=eq.${this.userId}&select=*`, {
          headers: {
            'apikey': this.getSupabaseAnonKey(),
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch widget settings');
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          this.widgetSettings = data[0];
          
          // Update widget appearance
          this.updateWidgetAppearance();
        }
      } catch (error) {
        console.error('Error fetching widget settings:', error);
      }
    }

    // Update widget appearance based on settings
    updateWidgetAppearance() {
      if (!this.widgetSettings) return;
      
      // Update button color
      this.button.style.backgroundColor = this.widgetSettings.primaryColor;
      
      // Update header color
      this.header.style.backgroundColor = this.widgetSettings.primaryColor;
      
      // Update title
      this.title.textContent = this.widgetSettings.businessName || 'Chat Support';
    }

    // Create a new chat session
    async createChatSession() {
      try {
        const response = await fetch(`${this.getSupabaseUrl()}/rest/v1/chat_sessions`, {
          method: 'POST',
          headers: {
            'apikey': this.getSupabaseAnonKey(),
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            userId: this.userId,
            visitorId: this.visitorId,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        });
        
        if (!response.ok) throw new Error('Failed to create chat session');
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          this.sessionId = data[0].id;
        }
      } catch (error) {
        console.error('Error creating chat session:', error);
      }
    }

    // Save message to database
    async saveMessage(message, sender) {
      if (!this.sessionId) return;
      
      try {
        await fetch(`${this.getSupabaseUrl()}/rest/v1/chat_messages`, {
          method: 'POST',
          headers: {
            'apikey': this.getSupabaseAnonKey(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            userId: this.userId,
            sender: sender,
            message: message,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }

    // Check for auto replies
    async checkAutoReplies(text) {
      try {
        const response = await fetch(`${this.getSupabaseUrl()}/rest/v1/auto_replies?userId=eq.${this.userId}&select=*`, {
          headers: {
            'apikey': this.getSupabaseAnonKey(),
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch auto replies');
        
        const autoReplies = await response.json();
        
        for (const reply of autoReplies) {
          if (this.matchesKeywords(text, reply.keywords, reply.matchingType)) {
            return reply.response;
          }
        }
        
        return null;
      } catch (error) {
        console.error('Error checking auto replies:', error);
        return null;
      }
    }

    // Check for advanced replies
    async checkAdvancedReplies(text) {
      try {
        const response = await fetch(`${this.getSupabaseUrl()}/rest/v1/advanced_replies?userId=eq.${this.userId}&select=*`, {
          headers: {
            'apikey': this.getSupabaseAnonKey(),
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch advanced replies');
        
        const advancedReplies = await response.json();
        
        for (const reply of advancedReplies) {
          if (this.matchesKeywords(text, reply.keywords, reply.matchingType)) {
            return reply;
          }
        }
        
        return null;
      } catch (error) {
        console.error('Error checking advanced replies:', error);
        return null;
      }
    }

    // Check for AI mode
    async checkAiMode(text) {
      try {
        const response = await fetch(`${this.getSupabaseUrl()}/rest/v1/ai_settings?userId=eq.${this.userId}&select=*`, {
          headers: {
            'apikey': this.getSupabaseAnonKey(),
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch AI settings');
        
        const aiSettings = await response.json();
        
        if (aiSettings && aiSettings.length > 0 && aiSettings[0].enabled && aiSettings[0].apiKey) {
          // Make request to OpenAI API
          const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${aiSettings[0].apiKey}`
            },
            body: JSON.stringify({
              model: aiSettings[0].model || 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: `You are a helpful assistant for ${this.widgetSettings?.businessName || 'a business'}. 
                  ${aiSettings[0].businessContext || ''}`
                },
                {
                  role: 'user',
                  content: text
                }
              ],
              max_tokens: 150
            })
          });
          
          if (!aiResponse.ok) return null;
          
          const aiData = await aiResponse.json();
          
          if (aiData && aiData.choices && aiData.choices.length > 0) {
            return aiData.choices[0].message.content;
          }
        }
        
        return null;
      } catch (error) {
        console.error('Error checking AI mode:', error);
        return null;
      }
    }

    // Check if text matches keywords based on matching type
    matchesKeywords(text, keywords, matchingType) {
      const normalizedText = text.toLowerCase();
      
      switch (matchingType) {
        case 'word':
          return keywords.some(keyword => 
            normalizedText.includes(keyword.toLowerCase())
          );
          
        case 'fuzzy':
          return keywords.some(keyword => {
            const distance = this.levenshteinDistance(normalizedText, keyword.toLowerCase());
            return distance <= 2; // Allow up to 2 character differences
          });
          
        case 'regex':
          return keywords.some(keyword => {
            try {
              const regex = new RegExp(keyword, 'i');
              return regex.test(normalizedText);
            } catch (e) {
              return false;
            }
          });
          
        case 'synonym':
          // Simple synonym matching (would need a proper synonym API in production)
          const synonymMap = {
            'price': ['cost', 'fee', 'charge', 'payment'],
            'help': ['assist', 'support', 'aid'],
            'buy': ['purchase', 'order', 'get']
          };
          
          return keywords.some(keyword => {
            const keywordLower = keyword.toLowerCase();
            if (normalizedText.includes(keywordLower)) return true;
            
            // Check synonyms
            for (const [word, synonyms] of Object.entries(synonymMap)) {
              if (keywordLower === word && synonyms.some(s => normalizedText.includes(s))) {
                return true;
              }
            }
            
            return false;
          });
          
        default:
          return keywords.some(keyword => 
            normalizedText.includes(keyword.toLowerCase())
          );
      }
    }

    // Levenshtein distance for fuzzy matching
    levenshteinDistance(a, b) {
      const matrix = [];
      
      // Increment along the first column of each row
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      
      // Increment each column in the first row
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }
      
      // Fill in the rest of the matrix
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              matrix[i][j - 1] + 1,     // insertion
              matrix[i - 1][j] + 1      // deletion
            );
          }
        }
      }
      
      return matrix[b.length][a.length];
    }

    // Get Supabase URL
    getSupabaseUrl() {
      return 'https://geyxmmemlewbztzbsudj.supabase.co';
    }

    // Get Supabase Anon Key
    getSupabaseAnonKey() {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleXhtbWVtbGV3Ynp0emJzdWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MzI5MTUsImV4cCI6MjA1NjUwODkxNX0.1E9_ZVrSpn0RgzQjU6dwahm__uxLn5KM5jdQSTbJwxo';
    }
  }

  // Make BusinessChatPlugin available globally
  window.BusinessChatPlugin = BusinessChatPlugin;
})();