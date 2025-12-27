import { FC, useRef, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import ChatHeader from "./ChatHeader";
import Avatar3D from "./Avatar3D";
import VoiceControl from "./VoiceControl";
import { streamChat } from "@/utils/streamChat";
import { speakText, stopSpeaking } from "@/utils/textToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const COMPANION_NAME = "Aisha";

const ChatContainer: FC = () => {
  const { toast } = useToast();
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<"online" | "typing" | "offline">("online");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastResponse, setLastResponse] = useState("Mic tap karo aur mujhse baat karo!");
  const [userTranscript, setUserTranscript] = useState("");
  const assistantContentRef = useRef("");

  const handleSendMessage = useCallback(async (content: string) => {
    stopSpeaking();
    setIsSpeaking(false);
    setUserTranscript("");

    const newHistory = [...conversationHistory, { role: "user" as const, content }];
    setConversationHistory(newHistory);
    setIsTyping(true);
    setStatus("typing");
    assistantContentRef.current = "";

    let fullResponse = "";

    await streamChat({
      messages: newHistory,
      onDelta: (chunk) => {
        assistantContentRef.current += chunk;
        fullResponse = assistantContentRef.current;
        setLastResponse(assistantContentRef.current);
      },
      onDone: async () => {
        setIsTyping(false);
        setStatus("online");
        setConversationHistory(prev => [...prev, { role: "assistant", content: fullResponse }]);
        
        // Speak the response
        if (fullResponse) {
          try {
            setIsSpeaking(true);
            await speakText(fullResponse);
          } catch (error) {
            console.error("TTS error:", error);
            toast({
              variant: "destructive",
              title: "Voice error",
              description: "Could not play voice response",
            });
          } finally {
            setIsSpeaking(false);
          }
        }
      },
      onError: (errorMessage) => {
        setIsTyping(false);
        setStatus("online");
        setLastResponse(errorMessage);

        toast({
          variant: "destructive",
          title: "Connection issue",
          description: "Please try again in a moment.",
        });
      },
    });
  }, [conversationHistory, toast]);

  const handleVoiceResult = useCallback((transcript: string) => {
    if (transcript.trim()) {
      setUserTranscript(transcript);
      handleSendMessage(transcript);
    }
  }, [handleSendMessage]);

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

  // Update transcript display when listening
  const displayTranscript = isListening && transcript ? transcript : userTranscript;

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      setUserTranscript("");
      startListening();
    }
  };

  const clearHistory = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setConversationHistory([]);
    setLastResponse("Mic tap karo aur mujhse baat karo!");
    setUserTranscript("");
    toast({
      title: "Chat cleared",
      description: "Starting fresh conversation with Aisha",
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
            onClick={clearHistory}
            className="p-2 rounded-full hover:bg-secondary transition-colors duration-200 text-muted-foreground"
            title="Clear chat history"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        }
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        {/* 3D Avatar */}
        <Avatar3D isSpeaking={isSpeaking} isListening={isListening} />
        
        {/* Status Text */}
        <div className="text-center max-w-md">
          {displayTranscript && (
            <p className="text-sm text-muted-foreground mb-2 animate-fade-in">
              Tum: "{displayTranscript}"
            </p>
          )}
          <p className={`text-lg font-medium transition-all duration-300 ${
            isSpeaking ? "text-primary animate-pulse-soft" : "text-foreground"
          }`}>
            {isTyping ? "Soch rahi hoon..." : lastResponse}
          </p>
        </div>
      </main>

      {voiceInputSupported ? (
        <VoiceControl
          isListening={isListening}
          isSpeaking={isSpeaking}
          disabled={isTyping}
          onToggleListening={handleToggleListening}
        />
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          Voice input not supported in this browser
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
