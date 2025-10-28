// components/GlobalChatbot.tsx

"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { MessageSquare, X } from "lucide-react";

// --- Helper Functions & Types ---

// Define the structure of a chat message
interface Message {
  sender: "user" | "bot";
  text: string;
}

// Define the key for storing chat *history* (not auth) in localStorage
const CHAT_HISTORY_KEY = "chatbot_history";

// --- The Chatbot Component ---

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat history from localStorage or with a default message
  const [chatHistory, setChatHistory] = useState<Message[]>(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error("Failed to parse chat history:", error);
    }
    // Default message if history is empty or fails to load
    return [{ sender: "bot", text: "Hello! How can I help you today?" }];
  });

  // Effect to scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Effect to save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
  }, [chatHistory]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Handles sending the user's message to the backend API.
   */
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const messageText = currentMessage.trim();

    if (!messageText) return;

    // 1. Add user's message to the UI immediately
    const userMessage: Message = { sender: "user", text: messageText };
    setChatHistory((prevHistory) => [...prevHistory, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // 2. Call the backend API
    try {
      // Use the full URL from your Swagger docs
      const response = await fetch("http://localhost:5001/api/Chatbot/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // --- NO 'Authorization' HEADER IS NEEDED ---
          // The browser will send the 'jwt-token' cookie automatically.
        },
        body: JSON.stringify({ question: messageText }),
        
        // --- THIS IS THE CRITICAL FIX ---
        // This tells the browser to send cookies (like your HttpOnly 'jwt-token')
        // with this cross-origin request. Your CORS policy allows it.
        credentials: "include", 
      });

      if (!response.ok) {
        if (response.status === 401) {
           // This will now correctly trigger if the cookie is missing or expired
          throw new Error("Authentication error. Please log in again.");
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // 3. Add bot's response to the UI
      const botMessage: Message = { sender: "bot", text: data.answer };
      setChatHistory((prevHistory) => [...prevHistory, botMessage]);

    } catch (error: any) {
      console.error("Chatbot API failed:", error);
      const errorMsg: Message = {
        sender: "bot",
        text: error.message || "Sorry, I'm having trouble connecting.",
      };
      setChatHistory((prevHistory) => [...prevHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Popup Window */}
      {isOpen && (
        <div className="bg-white w-80 h-[28rem] rounded-lg shadow-xl flex flex-col border border-gray-300">
          
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Chat with Support</h3>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Body (This is where the chat history is rendered) */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3"
          >
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[80%] text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Show a "typing" indicator while waiting for the API */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 p-2 rounded-lg max-w-xs text-sm">
                  ...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-t bg-gray-50 rounded-b-lg">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              disabled={isLoading}
              aria-label="Chat input"
            />
          </form>
        </div>
      )}

      {/* Chat Toggle Icon Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          aria-label="Open chat"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}