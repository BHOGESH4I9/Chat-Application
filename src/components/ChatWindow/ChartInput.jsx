import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { Form } from 'react-bootstrap';
import { BsSendFill, BsEmojiSmile } from 'react-icons/bs';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiMic } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

const Chartinput = () => {
  const { sendMessage, setIsTyping } = useChatContext();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);

  // Detect typing
  useEffect(() => {
    if (text.trim()) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [text, setIsTyping]);

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
      setShowEmojiPicker(false);
    }
  };

  // Emoji picker logic
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="px-2 py-2 border-top"
      style={{
        backgroundColor: '#ffffff', 
        position: 'relative',
      }}
    >
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiRef}
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '50px',
            zIndex: 1000,
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Chat input */}
      <Form
        onSubmit={handleSubmit}
        className="d-flex align-items-center px-3 py-2 rounded-pill shadow-sm"
        style={{
          height: '48px',
          backgroundColor: '#ffffff', 
          border: '1px solid #ccc',
        }}
      >
        {/* Left icons */}
        <div className="d-flex align-items-center me-2">
          <AiOutlinePlus size={20} className="me-2 text-secondary" />
          <BsEmojiSmile
            size={20}
            className="text-secondary"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          />
        </div>

        {/* Input field */}
        <Form.Control
          type="text"
          placeholder="Type a message"
          className="border-0 flex-grow-1 shadow-none"
          style={{
            backgroundColor: '#ffffff', 
            fontSize: '0.95rem',
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Right icon */}
        <div className="ms-2">
          {text.trim() ? (
            <button type="submit" className="btn btn-link p-0" style={{ textDecoration: 'none' }}>
              <BsSendFill size={20} className="text-primary" />
            </button>
          ) : (
            <FiMic size={20} className="text-secondary" />
          )}
        </div>
      </Form>
    </div>
  );
};

export default Chartinput;
