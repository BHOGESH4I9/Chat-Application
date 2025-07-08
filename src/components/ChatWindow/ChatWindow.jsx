import React from 'react'
import { useChatContext } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import Chartinput from './ChartInput';



const ChatWindow = () => {
  const { selectedUser } = useChatContext();

  if (!selectedUser) {
    return (
      <div className="chat-window d-flex justify-content-center align-items-center text-muted flex-grow-1 w-100">
        <p>Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window d-flex flex-column flex-grow-1 w-100">
      <ChatHeader />
      <MessageList />
      <Chartinput />
    </div>
  );
};

export default ChatWindow;