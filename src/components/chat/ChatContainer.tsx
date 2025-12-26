import { FC, useRef, useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { streamChat } from "@/utils/streamChat";
import { speakText, stopSpeaking } from "@/utils/textToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantContentRef = useRef("");

  const handleVoiceResult = useCallback((transcript: string) => {
    if (transcript.trim()) {
      handleSendMessage(transcript);
    }
  }, []);

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: voiceInputSupported 
  } = useSpeechRecognition({
    onResult: handleVoiceResult,
    lang: "hi-IN",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
    }
  };

  const toggleVoiceOutput = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
    toast({
      title: voiceEnabled ? "Voice output disabled" : "Voice output enabled",
      description: voiceEnabled ? "Aisha will only type responses" : "Aisha will speak her responses",
    });
  };

  const handleSendMessage = async (content: string) => {
    // Stop listening if we're sending a message
    if (isListening) {
      stopListening();
    }
    
    // Stop any current speech
    stopSpeaking();
    setIsSpeaking(false);

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

    let fullResponse = "";

    await streamChat({
      messages: conversationHistory,
      onDelta: (chunk) => {
        assistantContentRef.current += chunk;
        fullResponse = assistantContentRef.current;
        
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && !last.isUser) {
            return prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, content: assistantContentRef.current }
                : m
            );
          }
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
      onDone: async () => {
        setIsTyping(false);
        setStatus("online");
        
        // Speak the response if voice is enabled
        if (voiceEnabled && fullResponse) {
          try {
            setIsSpeaking(true);
            await speakText(fullResponse);
          } catch (error) {
            console.error("TTS error:", error);
          } finally {
            setIsSpeaking(false);
          }
        }
      },
      onError: (errorMessage) => {
        setIsTyping(false);
        setStatus("online");
        
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
      <ChatHeader 
        name={COMPANION_NAME} 
        status={status} 
        isSpeaking={isSpeaking}
        rightElement={
          <button
            onClick={toggleVoiceOutput}
            className={`p-2 rounded-full transition-colors duration-200 ${
              voiceEnabled ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"
            }`}
            title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
          >
            {voiceEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        }
      />

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

      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isTyping} 
        isListening={isListening}
        onToggleListening={handleToggleListening}
        isVoiceSupported={voiceInputSupported}
        interimTranscript={transcript}
      />
    </div>
  );
};

export default ChatContainer;
