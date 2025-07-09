import React from 'react';
import { useChatContext } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import Chartinput from './ChartInput';
import { BsArrowLeft } from 'react-icons/bs';

const ChatWindow = () => {
  const { selectedUser, setShowChatWindowOnMobile } = useChatContext();

  if (!selectedUser) {
    return (
      <div className="chat-window d-flex justify-content-center align-items-center text-muted flex-grow-1 w-100 bg-white">
        <p>Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window d-flex flex-column h-100 bg-white">
      {/* Mobile back button */}
      <div className="d-md-none px-3 py-2 border-bottom d-flex align-items-center shadow-sm">
        <BsArrowLeft
          size={20}
          onClick={() => setShowChatWindowOnMobile(false)}
          style={{ cursor: 'pointer', marginRight: '10px' }}
        />
        <strong>{selectedUser.displayName}</strong>
      </div>

      {/* Header */}
      <div style={{ height: '60px', flexShrink: 0 }}>
        <ChatHeader />
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto">
        <MessageList />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0 }}>
        <Chartinput />
      </div>
    </div>
  );
};

export default ChatWindow;