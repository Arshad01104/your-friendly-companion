import { FC, useState, KeyboardEvent, useRef, useEffect } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isListening?: boolean;
  onToggleListening?: () => void;
  isVoiceSupported?: boolean;
  interimTranscript?: string;
}

const ChatInput: FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false,
  isListening = false,
  onToggleListening,
  isVoiceSupported = false,
  interimTranscript = "",
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update message when interim transcript changes
  useEffect(() => {
    if (isListening && interimTranscript) {
      setMessage(interimTranscript);
    }
  }, [interimTranscript, isListening]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="px-4 py-4 bg-card/80 backdrop-blur-md border-t border-border/50">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        {isVoiceSupported && (
          <button 
            onClick={onToggleListening}
            disabled={disabled}
            className={cn(
              "p-3 rounded-full transition-all duration-200 flex-shrink-0",
              isListening 
                ? "gradient-warm shadow-glow animate-pulse-soft" 
                : "hover:bg-secondary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Mic className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening... 🎤" : "Type or speak a message..."}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 text-foreground placeholder:text-muted-foreground disabled:opacity-50",
              isListening && "border-primary/50 ring-2 ring-primary/20"
            )}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="p-3 rounded-full gradient-warm shadow-glow disabled:opacity-50 disabled:shadow-none transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <Send className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
      
      {isListening && (
        <p className="text-center text-sm text-muted-foreground mt-2 animate-fade-in">
          🎤 Bol rahe ho? Sun rahi hoon...
        </p>
      )}
    </div>
  );
};

export default ChatInput;
