import { FC, useState, useEffect, lazy, Suspense } from "react";

interface Avatar3DProps {
  isSpeaking: boolean;
  isListening: boolean;
}

// Animated 2D fallback avatar
const AnimatedAvatar2D: FC<Avatar3DProps> = ({ isSpeaking, isListening }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setScale(1 + Math.random() * 0.1);
      }, 100);
      return () => clearInterval(interval);
    } else if (isListening) {
      const interval = setInterval(() => {
        setScale(1 + Math.random() * 0.05);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setScale(1);
    }
  }, [isSpeaking, isListening]);

  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      {/* Outer glow rings */}
      <div 
        className={`absolute w-40 h-40 rounded-full transition-all duration-300 ${
          isSpeaking 
            ? "bg-primary/20 animate-ping" 
            : isListening 
            ? "bg-accent/20 animate-pulse" 
            : "bg-primary/10"
        }`}
      />
      <div 
        className={`absolute w-36 h-36 rounded-full transition-all duration-300 ${
          isSpeaking 
            ? "bg-primary/30" 
            : isListening 
            ? "bg-accent/30" 
            : "bg-primary/20"
        }`}
        style={{ animationDelay: "0.2s" }}
      />
      
      {/* Main avatar sphere */}
      <div 
        className={`relative w-32 h-32 rounded-full gradient-warm shadow-glow flex items-center justify-center transition-transform duration-150 ${
          isSpeaking ? "animate-pulse" : ""
        }`}
        style={{ transform: `scale(${scale})` }}
      >
        {/* Face elements */}
        <div className="flex flex-col items-center gap-3">
          {/* Eyes */}
          <div className="flex gap-4">
            <div className={`w-3 h-3 bg-white/90 rounded-full ${isListening ? "animate-bounce" : ""}`} />
            <div className={`w-3 h-3 bg-white/90 rounded-full ${isListening ? "animate-bounce" : ""}`} style={{ animationDelay: "0.1s" }} />
          </div>
          
          {/* Mouth */}
          <div 
            className={`bg-white/80 rounded-full transition-all duration-150 ${
              isSpeaking 
                ? "w-4 h-4 animate-pulse" 
                : isListening 
                ? "w-6 h-2" 
                : "w-8 h-2"
            }`}
          />
        </div>
      </div>

      {/* Orbiting particles */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-3 h-3 rounded-full ${
            isSpeaking ? "bg-primary" : "bg-accent"
          } transition-all duration-300`}
          style={{
            animation: `orbit ${isSpeaking ? 2 : isListening ? 3 : 6}s linear infinite`,
            animationDelay: `${i * 0.5}s`,
            transformOrigin: "center",
          }}
        />
      ))}

      <style>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(90px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(90px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
};

const Avatar3D: FC<Avatar3DProps> = ({ isSpeaking, isListening }) => {
  return <AnimatedAvatar2D isSpeaking={isSpeaking} isListening={isListening} />;
};

export default Avatar3D;
