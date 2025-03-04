import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoChatbubblesOutline,
  IoClose,
  IoPerson,
  IoCloseCircleOutline,
} from "react-icons/io5";
import {
  FaRobot,
  FaCompressArrowsAlt,
  FaExpandArrowsAlt,
} from "react-icons/fa";

interface Message {
  text: string;
  sender: "user" | "bot";
  read?: boolean;
  timestamp: Date;
}

const MAX_MESSAGE_LENGTH = 500;

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! Welcome to Gudz Driver Support. We offer 24/7 customer support! How may I assist you today?",
      sender: "bot",
      read: true,
      timestamp: new Date(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasClosedStartOver, setHasClosedStartOver] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [shake, setShake] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasUnread = messages.some((msg) => msg.sender === "bot" && !msg.read);
    setHasUnreadMessages(hasUnread);
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [isExpanded, setIsExpanded] = useState(false); // Add this line

  const toggleExpand = () => {
    setIsExpanded(!isExpanded); // Add this line
  };

  const handleSendMessage = () => {
    if (!validateInput(input)) {
      // Validation failed, trigger shake
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    sendMessage();
  };
  const validateInput = (text: string): boolean => {
    if (!text.trim()) {
      setError("Message cannot be empty");
      return false;
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      setError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
      return false;
    }
    setError(null);
    return true;
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input; // Use messageText if provided, else use input field
    if (!validateInput(text)) return;

    const newUserMessage: Message = {
      text,
      sender: "user",
      timestamp: new Date(),
    };
    const newMessages: Message[] = [...messages, newUserMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: text, // Send correct text
      });

      const botMessage: Message = {
        text: response.data.response,
        sender: "bot",
        read: false,
        timestamp: new Date(),
      };
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages,
        {
          text: "Error connecting to AI",
          sender: "bot",
          read: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const sendPredefinedMessage = (text: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text, sender: "user", timestamp: new Date() },
    ]);
    sendMessage(text);
  };
  const resetChat = () => {
    setMessages([
      {
        text: "Hello! Welcome to Gudz Driver Support. We offer 24/7 customer support! How may I assist you today?",
        sender: "bot",
        read: true,
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);

    const updatedMessages = messages.map((msg) =>
      msg.sender === "bot" && !msg.read ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  useEffect(() => {
    let prevScrollPos = 0; // Initialize previous scroll position

    const handleScroll = () => {
      if (scrollRef.current) {
        const currentScrollPos = scrollRef.current.scrollTop;
        if (currentScrollPos > prevScrollPos) {
          // Scrolling down
          setShowButtons(false);
        } else {
          // Scrolling up or at the top
          setShowButtons(true);
        }
        prevScrollPos = currentScrollPos; // Update previous scroll position
      }
    };

    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentScrollRef) {
        currentScrollRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="flex justify-end items-end fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end space-y-2">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`bg-white border shadow-lg rounded-lg w-80 ${
                isExpanded ? "h-[600px]" : "h-[400px]"
              } flex flex-col`}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #6F43EE, #6F43EE)", // Gradient background
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "8px 8px 0 0", // Rounded corners on top
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", // Center content horizontally
                  gap: "8px", // Space between icon and text
                }}
              >
                <FaRobot size={20} color="white" /> {/* Robot icon */}
                <span
                  style={{
                    fontWeight: "600", // Slightly bolder text
                    fontSize: "1.1em", // Slightly larger text
                    letterSpacing: "0.5px", // Add letter spacing
                  }}
                >
                  gudz BOT
                </span>
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-3"
              >
                <div
                  ref={scrollRef} // Corrected
                  className="flex-1 overflow-y-auto p-3 space-y-3"
                >
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        x: msg.sender === "user" ? 50 : -50,
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start space-x-2"
                    >
                      {msg.sender === "bot" && (
                        <div className="w-6 h-6 text-green-500 mt-1">
                          <FaRobot size="100%" color="currentColor" />
                        </div>
                      )}
                      <div
                        className={`flex flex-col ${
                          msg.sender === "user"
                            ? "items-end ml-auto"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg max-w-[80%] ${
                            msg.sender === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.text}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      {msg.sender === "user" && (
                        <div className="w-6 h-6 text-blue-500 mt-1">
                          <IoPerson size="100%" color="currentColor" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        "How do I add money to my wallet?",
                        "Where can I find my work orders?",
                        "What is my current rental plan?",
                      ].map((faq, idx) => (
                        <motion.button // Wrap button with motion.button
                          key={idx}
                          className="bg-blue-500 text-white border border-white-300 px-4 py-2 rounded-lg text-sm transition duration-200 hover:bg-gray-200 flex items-center justify-center w-48"
                          onClick={() => sendPredefinedMessage(faq)}
                          whileHover={{ scale: 1.05 }} // Add zoom on hover
                          transition={{ duration: 0.2 }} // Optional: Add smooth transition
                        >
                          {faq}
                        </motion.button>
                      ))}
                    </div>
                  )}
                  {loading && (
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 text-green-500 mt-1">
                        <FaRobot size="100%" color="currentColor" />
                      </div>
                      <motion.div
                        className="bg-gray-100 text-gray-600 p-2 rounded-lg"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        Gudz Bot is typing...
                      </motion.div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="p-3 border-t bg-gray-50 flex flex-col">
                {error && (
                  <div className="text-red-500 text-sm mb-2">{error}</div>
                )}

                {/* Start Over Button - Appears when chat length > 6 */}
                <AnimatePresence>
                  {messages.length > 8 &&
                    !hasClosedStartOver &&
                    showButtons && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="fixed right-23 bottom-37 bg hover:bg text-white rounded-lg transition-all flex items-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        {/* Start Over Button */}
                        <motion.button
                          onClick={resetChat}
                          className="text-xs py-1 px-2 font-medium bg-red-600 bg-opacity-50 rounded-l-lg"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          Start Over
                        </motion.button>

                        {/* Spacing */}
                        <div className="mx-1"></div>

                        {/* Close Button */}
                        <motion.button
                          onClick={() => {
                            setHasClosedStartOver(true); // Only set hasClosedStartOver to true
                          }}
                          className="p-1 text-white hover:bg-red-700 transition-colors bg-red-600 rounded-r-lg border-none"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transform: "scale(1.6)",
                            }}
                          >
                            <IoCloseCircleOutline size={12.5} color="red" />
                          </span>
                        </motion.button>
                      </motion.div>
                    )}
                </AnimatePresence>
                <div style={{ overflowY: "auto", maxHeight: "500px" }}>
                  {/* your chat messages here */}
                </div>
                <div className="flex">
                  <motion.input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInput(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className={`flex-1 p-2 border rounded-lg shadow-sm text-black ${
                      shake ? "shake" : ""
                    }`}
                    placeholder="Ask something..."
                    maxLength={MAX_MESSAGE_LENGTH}
                    animate={shake ? { x: [-10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.button
                    onClick={() => sendMessage()}
                    className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Send
                  </motion.button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {input.length}/{MAX_MESSAGE_LENGTH}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center space-x-2">
          {isOpen && (
            <>
              <motion.button
                className="bg-red-500 text-white p-2 rounded-full shadow-md transition-all text-sm"
                onClick={toggleChat}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <IoClose size={18} />
              </motion.button>
              <motion.button
                className="bg-gray-500 text-white p-2 rounded-full shadow-md hover:bg-gray-600 transition-all text-sm"
                onClick={toggleExpand} // Function to toggle expand/collapse
                aria-label={isExpanded ? "Collapse" : "Expand"}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {isExpanded ? (
                  <FaCompressArrowsAlt size={18} /> // Collapse icon
                ) : (
                  <FaExpandArrowsAlt size={18} /> // Expand icon
                )}
              </motion.button>
            </>
          )}
          <motion.button
            className="relative p-3 rounded-full shadow-md text-white transition-all"
            onClick={toggleChat}
            style={{ backgroundColor: "#6F43EE" }} // Set background color to purple
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <IoChatbubblesOutline size={24} />
            {hasUnreadMessages && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold"
              >
                1
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default App;
