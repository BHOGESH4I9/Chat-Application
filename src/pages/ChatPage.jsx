import React from 'react'
import ChatWindow from '../components/ChatWindow/ChatWindow';
import Sidebar from '../components/Sidebar/Sidebar';

const ChatPage = () => {
  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;