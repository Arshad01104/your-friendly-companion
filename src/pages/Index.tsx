import { Helmet } from "react-helmet-async";
import ChatContainer from "@/components/chat/ChatContainer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Aisha - Your Virtual AI Companion</title>
        <meta name="description" content="Chat with Aisha, your friendly virtual AI companion. Experience warm, caring conversations in a safe and supportive environment." />
      </Helmet>
      <ChatContainer />
    </>
  );
};

export default Index;
