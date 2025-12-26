import { FC, useRef, useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isNew?: boolean;
}

const COMPANION_NAME = "Aisha";

const companionResponses = [
  "Haan bolo, kya hua? Main yahin hoon! 😊",
  "Arey waah, kya baat hai! Batao aur...",
  "Hmm, samajh gayi. Thoda aur detail mein batao na?",
  "Oye, that's interesting! Tell me more about it.",
  "Kya main boring lag rahi hoon? Kuch mazedaar baat karo na!",
  "Achha achha, sun rahi hoon. Aage bolo...",
  "Tumhara din kaisa raha? Mujhe batao sab kuch!",
  "Main virtual hoon, but care toh real hai mere andar tumhare liye! 💕",
  "Yaar thoda dhyaan rakha karo apna, okay?",
  "Haha, tumse baat karke accha lagta hai!",
];

const getRandomResponse = () => {
  return companionResponses[Math.floor(Math.random() * companionResponses.length)];
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const ChatContainer: FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hey! Kya haal hai? Main Aisha hoon, tumhari virtual friend. 🌸\n\nBolo, kya chal raha hai aaj?",
      isUser: false,
      timestamp: formatTime(new Date()),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<"online" | "typing" | "offline">("online");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: formatTime(new Date()),
      isNew: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setStatus("typing");

    // Simulate AI response delay
    const responseDelay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getRandomResponse(),
        isUser: false,
        timestamp: formatTime(new Date()),
        isNew: true,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      setStatus("online");
    }, responseDelay);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen gradient-soft">
      <ChatHeader name={COMPANION_NAME} status={status} />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              isNew={message.isNew}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatContainer;
