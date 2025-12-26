import { FC } from "react";

const TypingIndicator: FC = () => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="bg-card px-5 py-4 rounded-2xl rounded-bl-md shadow-message border border-border/30">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="w-2 h-2 bg-primary/60 rounded-full animate-typing-dot"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
