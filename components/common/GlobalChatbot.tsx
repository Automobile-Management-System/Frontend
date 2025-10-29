// components/common/GlobalChatbot.tsx

"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { MessageSquare, X, SendHorizonal, Bot, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext"; // Import the custom hook
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import remarkGfm from 'remark-gfm'; // Import remark-gfm for table support etc.

// --- Helper Functions & Types ---

interface Message {
  sender: "user" | "bot";
  text: string;
}

const CHAT_HISTORY_KEY = "chatbot_history"; // Consider role-specific keys if needed

// --- Role-Specific Configuration ---
interface RoleConfig {
  headerTitle: string;
  headerColor: string; // Tailwind bg color class
  welcomeMessage: (name?: string) => string; // Function for personalized welcome
  icon: React.ReactNode;
}

const roleConfigs: Record<string, RoleConfig> = {
  Admin: {
    headerTitle: "Admin Assistant",
    headerColor: "bg-red-600",
    welcomeMessage: (name) => `Hello Admin ${name || ''}! How can I assist with system management?`,
    icon: <ShieldCheck size={20} className="mr-2 flex-shrink-0" />, // Added flex-shrink-0
  },
  Employee: {
    headerTitle: "Employee Support",
    headerColor: "bg-green-600",
    welcomeMessage: (name) => `Hi ${name || 'there'}! Ready to log time or check tasks?`,
    icon: <Bot size={20} className="mr-2 flex-shrink-0" />,
  },
  Customer: {
    headerTitle: "Customer Support",
    headerColor: "bg-blue-600",
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
  const { user, isLoading: isAuthLoading } = useAuth(); // Use the custom hook

  // Determine user role and name or default to 'Guest'
  const userRole = user?.role || "Guest";
  // Extract first name if user exists
  const firstName = user?.firstName?.split(' ')[0]; // Get first name
  const config = roleConfigs[userRole] || roleConfigs.Guest;

  // Generate the current welcome message
  const currentWelcomeMessage = config.welcomeMessage(firstName);

  // Initialize chat history
  const [chatHistory, setChatHistory] = useState<Message[]>(() => {
    // Return default message immediately, useEffect will load history
    return [{ sender: "bot", text: currentWelcomeMessage }];
  });

  // Effect to load history from localStorage ONCE on mount
   useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure localStorage is available
        try {
            const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
            if (storedHistory) {
                const parsed = JSON.parse(storedHistory);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(msg => msg.sender && msg.text)) {
                    // Check if the loaded history only contains an old welcome message
                    if (parsed.length === 1 && parsed[0].sender === 'bot' && Object.values(roleConfigs).some(rc => rc.welcomeMessage() === parsed[0].text && parsed[0].text !== currentWelcomeMessage)) {
                         setChatHistory([{ sender: "bot", text: currentWelcomeMessage }]); // Reset to current welcome if only old welcome exists
                    } else {
                        setChatHistory(parsed);
                    }
                    return; // Stop execution if history loaded successfully
                } else {
                     console.warn("Invalid chat history structure found in localStorage.");
                     localStorage.removeItem(CHAT_HISTORY_KEY); // Clear invalid data
                }
            }
        } catch (error) {
            console.error("Failed to parse chat history:", error);
            localStorage.removeItem(CHAT_HISTORY_KEY); // Clear invalid data
        }
        // If loading failed or no history, ensure the current welcome message is set
        setChatHistory([{ sender: "bot", text: currentWelcomeMessage }]);
    }
   }, [currentWelcomeMessage]); // Rerun if welcome message changes (e.g., login/logout)


  // Effect to scroll to bottom
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      // Use setTimeout to allow DOM to update before scrolling
      setTimeout(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 50); // Small delay
    }
  }, [chatHistory, isOpen]); // Rerun scroll logic when history or open state changes

  // Effect to save chat history
  useEffect(() => {
     if (chatHistory.length > 0) { // Don't save empty or just default state initially
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
     }
  }, [chatHistory]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // When opening, if only welcome message exists, ensure it's the latest one
     if (!isOpen && chatHistory.length === 1 && chatHistory[0].sender === 'bot' && chatHistory[0].text !== currentWelcomeMessage) {
        setChatHistory([{ sender: "bot", text: currentWelcomeMessage }]);
     }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const messageText = currentMessage.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { sender: "user", text: messageText };
    setChatHistory((prevHistory) => [...prevHistory, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/Chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText }),
        credentials: "include",
      });

      let botResponseText = "Sorry, I encountered an issue processing your request. Please try again later."; // More specific default error

      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (response.status === 401) {
            botResponseText = "Authentication error. Your session might have expired. Please log in again.";
          } else {
            botResponseText = errorData.answer || errorData.title || `Error ${response.status}: Could not process the request.`;
          }
        } catch {
          botResponseText = `Network Error: ${response.status} ${response.statusText}. Please check your connection.`;
        }
        console.error("Chatbot API Error:", botResponseText);
      } else {
        const data = await response.json();
        // Check if the backend returned an actual answer
        botResponseText = data.answer || "I received a response, but couldn't find the answer content.";
      }

      const botMessage: Message = { sender: "bot", text: botResponseText };
      setChatHistory((prevHistory) => [...prevHistory, botMessage]);

    } catch (error: any) {
      console.error("Chatbot API Request Failed:", error);
      const errorMsg: Message = {
        sender: "bot",
        text: "Sorry, I'm having trouble connecting to the support service right now. Please check your network connection.",
      };
      setChatHistory((prevHistory) => [...prevHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the button until auth status is known
  if (isAuthLoading) {
     return null; // Or a placeholder loading state if you prefer
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans"> {/* Increased z-index */}
      {/* Chat Popup Window with Transitions */}
        <div
            className={`transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          <div className="bg-white w-80 sm:w-96 h-[30rem] sm:h-[32rem] rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden"> {/* Added overflow hidden */}

            {/* Header */}
            <div className={`${config.headerColor} text-white p-3 flex justify-between items-center shadow-md flex-shrink-0`}> {/* Added flex-shrink-0 */}
              <div className="flex items-center min-w-0"> {/* Added min-w-0 for ellipsis */}
                {config.icon}
                <h3 className="font-semibold text-base truncate pr-2">{config.headerTitle}</h3> {/* Added truncate */}
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
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/80" // Slightly transparent bg
              aria-live="polite" // Accessibility for new messages
            >
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-2.5 rounded-lg max-w-[85%] text-sm shadow-sm leading-relaxed prose prose-sm ${ // Added prose for markdown styling
                      msg.sender === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {/* Render text using ReactMarkdown */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {/* Loading Indicator */}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-500 p-2.5 rounded-lg rounded-bl-none max-w-xs text-sm shadow-sm flex items-center space-x-1.5"> {/* Increased spacing */}
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                    </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-gray-100 flex items-center space-x-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
              <input
                type="text"
                placeholder="Ask AutoServe 360..." // More specific placeholder
                className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-200 transition" // Added border focus
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                disabled={isLoading}
                aria-label="Chat input"
              />
              <button
                type="submit"
                disabled={isLoading || !currentMessage.trim()}
                className={`p-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    isLoading || !currentMessage.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
                aria-label="Send message"
              >
                <SendHorizonal size={20} />
              </button>
            </form>
          </div>
        </div>


      {/* Chat Toggle Icon Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ring-blue-500 transition-all duration-300 ease-out transform hover:scale-110 ${
          isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        } ${config.headerColor} hover:opacity-95`} // Use role color, smooth transition
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Render icon based on open state or role */}
        {isOpen ? <X size={24} /> : (config.icon || <MessageSquare size={24} />)}
      </button>
    </div>
  );
}