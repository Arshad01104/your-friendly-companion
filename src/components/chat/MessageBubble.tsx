import { FC } from "react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp: string;
  isNew?: boolean;
}

const MessageBubble: FC<MessageBubbleProps> = ({ content, isUser, timestamp, isNew = false }) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
        isNew && "animate-fade-in-up"
      )}
      style={{ animationDelay: isNew ? "0.1s" : "0s" }}
    >
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl",
          isUser
            ? "gradient-message text-primary-foreground rounded-br-md shadow-glow"
            : "bg-card text-card-foreground rounded-bl-md shadow-message border border-border/30"
        )}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        <p
          className={cn(
            "text-[11px] mt-1.5",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
