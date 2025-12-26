import { FC, useRef, useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { streamChat } from "@/utils/streamChat";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isNew?: boolean;
}

const COMPANION_NAME = "Aisha";

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const ChatContainer: FC = () => {
  const { toast } = useToast();
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
  const assistantContentRef = useRef("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
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
    assistantContentRef.current = "";

    // Build conversation history for AI
    const conversationHistory = messages.map((msg) => ({
      role: msg.isUser ? "user" as const : "assistant" as const,
      content: msg.content,
    }));
    conversationHistory.push({ role: "user", content });

    await streamChat({
      messages: conversationHistory,
      onDelta: (chunk) => {
        assistantContentRef.current += chunk;
        
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && !last.isUser) {
            // Update existing assistant message
            return prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, content: assistantContentRef.current }
                : m
            );
          }
          // Create new assistant message
          return [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              content: assistantContentRef.current,
              isUser: false,
              timestamp: formatTime(new Date()),
              isNew: true,
            },
          ];
        });
      },
      onDone: () => {
        setIsTyping(false);
        setStatus("online");
      },
      onError: (errorMessage) => {
        setIsTyping(false);
        setStatus("online");
        
        // Add error as Aisha's message in her style
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: errorMessage,
            isUser: false,
            timestamp: formatTime(new Date()),
            isNew: true,
          },
        ]);

        toast({
          variant: "destructive",
          title: "Connection issue",
          description: "Please try again in a moment.",
        });
      },
    });
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
          {isTyping && !messages[messages.length - 1]?.content && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatContainer;
