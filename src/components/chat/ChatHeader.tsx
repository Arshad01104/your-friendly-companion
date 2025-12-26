import { FC, ReactNode } from "react";

interface ChatHeaderProps {
  name: string;
  status: "online" | "typing" | "offline";
  avatarUrl?: string;
  isSpeaking?: boolean;
  rightElement?: ReactNode;
}

const ChatHeader: FC<ChatHeaderProps> = ({ name, status, avatarUrl, isSpeaking, rightElement }) => {
  const getStatusText = () => {
    if (isSpeaking) return "Speaking...";
    if (status === "typing") return "Typing...";
    if (status === "online") return "Online";
    return "Offline";
  };

  const statusColor = {
    online: "bg-green-400",
    typing: "bg-primary",
    offline: "bg-muted-foreground",
  };

  return (
    <header className="flex items-center gap-4 px-6 py-4 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-soft">
      <div className="relative">
        <div className={`w-12 h-12 rounded-full gradient-warm shadow-glow flex items-center justify-center overflow-hidden ${isSpeaking ? "animate-pulse-soft" : ""}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl text-primary-foreground font-display font-semibold">
              {name.charAt(0)}
            </span>
          )}
        </div>
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${statusColor[status]} rounded-full border-2 border-card ${
            status === "typing" || isSpeaking ? "animate-pulse-soft" : ""
          }`}
        />
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-display font-semibold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">{getStatusText()}</p>
      </div>
      <div className="flex items-center gap-2">
        {rightElement}
        <button className="p-2 rounded-full hover:bg-secondary transition-colors duration-200">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-secondary transition-colors duration-200">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
