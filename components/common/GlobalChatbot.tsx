// components/common/GlobalChatbot.tsx

"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { MessageSquare, X, SendHorizonal, Bot, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Helper Functions & Types ---
interface Message {
  sender: "user" | "bot";
  text: string;
}
const CHAT_HISTORY_KEY = "chatbot_history";

// --- Role-Specific Configuration ---
interface RoleConfig {
  headerTitle: string;
  headerColor: string;
  welcomeMessage: (name?: string) => string;
  icon: React.ReactNode;
}
const roleConfigs: Record<string, RoleConfig> = {
  Admin: {
    headerTitle: "Admin Assistant",
    headerColor: "bg-blue-600", // Changed Admin color for consistency
    welcomeMessage: (name) => `Hello Admin ${name || ''}! How can I assist with system management?`,
    icon: <ShieldCheck size={20} className="mr-2 flex-shrink-0" />,
  },
  Employee: {
    headerTitle: "Employee Support",
    headerColor: "bg-blue-600", // Changed Employee color for consistency
    welcomeMessage: (name) => `Hi ${name || 'there'}! Ready to log time or check tasks?`,
    icon: <Bot size={20} className="mr-2 flex-shrink-0" />,
  },
  Customer: {
    headerTitle: "Customer Support",
    headerColor: "bg-blue-600", // Kept Customer color
    welcomeMessage: (name) => `Hello ${name || ''}! How can AutoServe 360 help you today?`,
    icon: <User size={20} className="mr-2 flex-shrink-0" />,
  },
  Guest: {
    headerTitle: "AutoServe 360 Support",
    headerColor: "bg-gray-700",
    welcomeMessage: () => "Welcome to AutoServe 360! How can I provide information about our system?",
    icon: <MessageSquare size={20} className="mr-2 flex-shrink-0" />,
  },
};

// --- The Chatbot Component ---
export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

  const userRole = user?.role || "Guest";
  const firstName = user?.firstName?.split(' ')[0];
  const config = roleConfigs[userRole] || roleConfigs.Guest;
  const currentWelcomeMessage = config.welcomeMessage(firstName);

  const [chatHistory, setChatHistory] = useState<Message[]>(() => [
    { sender: "bot", text: currentWelcomeMessage },
  ]);

  // --- Effects (Load History, Scroll, Save History) ---
  useEffect(() => {
    // Load history logic (slightly simplified)
    if (typeof window !== 'undefined') {
        try {
            const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
            if (storedHistory) {
                const parsed = JSON.parse(storedHistory);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(msg => msg.sender && msg.text)) {
                    // Avoid resetting if history seems valid, let welcome message logic handle updates
                     if (!(parsed.length === 1 && parsed[0].sender === 'bot')) {
                          setChatHistory(parsed);
                          return; // History loaded
                     }
                }
            }
        } catch (error) { console.error("Failed to parse chat history:", error); localStorage.removeItem(CHAT_HISTORY_KEY); }
        // Ensure current welcome message if no valid history loaded
        setChatHistory([{ sender: "bot", text: currentWelcomeMessage }]);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // Update welcome message if role changes and it's the only message
    if (chatHistory.length === 1 && chatHistory[0].sender === 'bot' && chatHistory[0].text !== currentWelcomeMessage) {
        setChatHistory([{ sender: "bot", text: currentWelcomeMessage }]);
    }
  }, [currentWelcomeMessage]); // Dependency on the calculated welcome message

  useEffect(() => {
    // Scroll logic
    if (isOpen && chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' }); // Added smooth scroll
      }, 50);
    }
  }, [chatHistory, isOpen]);

  useEffect(() => {
    // Save history logic
     if (chatHistory.length > 0 && !(chatHistory.length === 1 && chatHistory[0].text === currentWelcomeMessage)) { // Don't save just the initial welcome
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
     }
  }, [chatHistory, currentWelcomeMessage]);
  // --- End Effects ---


  const toggleChat = () => {
    setIsOpen(!isOpen);
     // Refresh welcome message if opening and only default exists
     if (!isOpen && chatHistory.length === 1 && chatHistory[0].sender === 'bot' && chatHistory[0].text !== currentWelcomeMessage) {
        setChatHistory([{ sender: "bot", text: currentWelcomeMessage }]);
     }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const messageText = currentMessage.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { sender: "user", text: messageText };
    setChatHistory((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/Chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText }),
        credentials: "include",
      });

      let botResponseText = "Sorry, I encountered an issue processing your request. Please try again later.";

      if (!response.ok) {
        try {
          const errorData = await response.json();
          botResponseText = response.status === 401
            ? "Authentication error. Your session might have expired. Please log in again."
            : errorData.answer || errorData.title || `Error ${response.status}: Could not process the request.`;
        } catch { botResponseText = `Network Error: ${response.status} ${response.statusText}. Please check connection.`; }
        console.error("Chatbot API Error:", botResponseText);
      } else {
        const data = await response.json();
        botResponseText = data.answer || "I received a response, but couldn't find the answer content.";
      }
      setChatHistory((prev) => [...prev, { sender: "bot", text: botResponseText }]);
    } catch (error: any) {
      console.error("Chatbot API Request Failed:", error);
      setChatHistory((prev) => [...prev, { sender: "bot", text: "Sorry, connection trouble. Please check network." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) return null; // Don't render until auth state is known

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      {/* Chat Popup Window - Conditionally Rendered */}
      {isOpen && (
        // Added transition classes here for smooth appearance/disappearance
        <div className="transition-all duration-300 ease-out origin-bottom-right transform scale-100 opacity-100">
           <div className="bg-white w-80 sm:w-96 h-[30rem] sm:h-[32rem] rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className={`${config.headerColor} text-white p-3 flex justify-between items-center shadow-md flex-shrink-0`}>
              <div className="flex items-center min-w-0">
                {config.icon}
                <h3 className="font-semibold text-base truncate pr-2">{config.headerTitle}</h3>
              </div>
              <button
                onClick={toggleChat}
                className="text-white rounded-full p-1 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/80"
              aria-live="polite"
            >
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`p-2.5 rounded-lg max-w-[85%] text-sm shadow-sm leading-relaxed prose prose-sm ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-500 p-2.5 rounded-lg rounded-bl-none max-w-xs text-sm shadow-sm flex items-center space-x-1.5">
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                    </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-gray-100 flex items-center space-x-2 flex-shrink-0">
              <input
                type="text"
                placeholder="Ask AutoServe 360..."
                className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-200 transition"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                disabled={isLoading}
                aria-label="Chat input"
              />
              <button
                type="submit"
                disabled={isLoading || !currentMessage.trim()}
                className={`p-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    isLoading || !currentMessage.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
                aria-label="Send message"
              >
                <SendHorizonal size={20} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat Toggle Icon Button */}
      <button
        onClick={toggleChat}
        // Apply transition and conditional classes for visibility
        className={`fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ring-blue-500 transition-all duration-300 ease-out transform hover:scale-110 ${
          isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100' // Hide button when chat is open
        } ${config.headerColor} hover:opacity-95`}
        aria-label="Open chat"
      >
        {/* Show appropriate icon (always show open icon here) */}
        {config.icon || <MessageSquare size={24} />}
      </button>
    </div>
  );
}