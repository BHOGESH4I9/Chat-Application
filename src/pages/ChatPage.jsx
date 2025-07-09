import React from 'react';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import Sidebar from '../components/Sidebar/Sidebar';
import { useChatContext } from '../context/ChatContext';

const ChatPage = () => {
  const { showChatWindowOnMobile } = useChatContext();

  return (
    <div className="d-flex w-100" style={{ height: '100vh', overflow: 'hidden' }}>
      
      <div
        className={`h-100 ${showChatWindowOnMobile ? 'd-none d-md-block' : ''}`}
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <Sidebar />
      </div>

      
      <div
        className={`d-flex flex-column h-100 flex-grow-1 ${!showChatWindowOnMobile ? 'd-none d-md-flex' : ''}`}
      >
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
