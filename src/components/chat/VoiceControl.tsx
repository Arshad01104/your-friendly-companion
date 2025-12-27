import { FC } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceControlProps {
  isListening: boolean;
  isSpeaking: boolean;
  disabled?: boolean;
  onToggleListening: () => void;
}

const VoiceControl: FC<VoiceControlProps> = ({
  isListening,
  isSpeaking,
  disabled = false,
  onToggleListening,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <button
        onClick={onToggleListening}
        disabled={disabled || isSpeaking}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
          isListening
            ? "gradient-warm shadow-glow animate-pulse-soft scale-110"
            : "bg-secondary hover:bg-secondary/80 hover:scale-105",
          (disabled || isSpeaking) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isListening ? (
          <MicOff className="w-10 h-10 text-primary-foreground" />
        ) : (
          <Mic className="w-10 h-10 text-muted-foreground" />
        )}
      </button>

      <p className="text-sm text-muted-foreground text-center">
        {isSpeaking
          ? "Aisha bol rahi hai..."
          : isListening
          ? "🎤 Sun rahi hoon..."
          : "Mic tap karke bolo"}
      </p>
    </div>
  );
};

export default VoiceControl;
