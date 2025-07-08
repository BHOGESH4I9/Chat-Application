import React, { useEffect, useRef, useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useAuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { FiChevronDown } from 'react-icons/fi';
import { BsCheck, BsCheckAll } from 'react-icons/bs';

const MessageList = () => {
  const { messages, chatId } = useChatContext();
  const { currentUser } = useAuthContext();

  const endRef = useRef(null);
  const dropdownRef = useRef(null);
  const bubbleRef = useRef({});

  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [dropdownDirection, setDropdownDirection] = useState('down');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDeleteForMe = async (msg) => {
    const msgRef = doc(db, 'chats', chatId, 'messages', msg.id);
    await updateDoc(msgRef, {
      deletedFor: [...(msg.deletedFor || []), currentUser.uid],
    });
    setOpenDropdown(null);
  };

  const handleDeleteForEveryone = async (msg) => {
    const msgRef = doc(db, 'chats', chatId, 'messages', msg.id);
    await updateDoc(msgRef, {
      deletedForEveryone: true,
    });
    setOpenDropdown(null);
  };

  const isVisible = (msg) => {
    if (msg.deletedForEveryone) return false;
    if ((msg.deletedFor || []).includes(currentUser.uid)) return false;
    return true;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const toggleDropdown = (msgId) => {
    if (openDropdown === msgId) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(msgId);
      setTimeout(() => {
        const bubble = bubbleRef.current[msgId];
        if (bubble) {
          const rect = bubble.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          const dropdownHeight = 90;
          setDropdownDirection(spaceBelow < dropdownHeight ? 'up' : 'down');
        }
      }, 0);
    }
  };

  return (
    <div
      className="flex-grow-1 overflow-auto px-3 py-3"
      style={{
        backgroundColor: '#ffffff',
        maxHeight: 'calc(100vh - 140px)',
      }}
    >
      {messages.map((msg) =>
        !isVisible(msg) ? null : (
          <div
            key={msg.id}
            className={`d-flex mb-2 ${msg.senderId === currentUser.uid ? 'justify-content-end' : 'justify-content-start'}`}
            onMouseEnter={() => setHoveredMsgId(msg.id)}
            onMouseLeave={() => setHoveredMsgId(null)}
          >
            <div style={{ width: '4px', marginRight: '0.5rem' }} />

            <div
              ref={(el) => (bubbleRef.current[msg.id] = el)}
              style={{ maxWidth: '65%', position: 'relative' }}
            >
              <div
                className="px-3 py-2 position-relative"
                style={{
                  backgroundColor:
                    msg.senderId === currentUser.uid
                      ? 'rgb(81, 150, 255)'
                      : 'rgb(232, 240, 254)',
                  color: msg.senderId === currentUser.uid ? '#fff' : '#000',
                  borderRadius:
                    msg.senderId === currentUser.uid
                      ? '20px 20px 20px 0'
                      : '20px 20px 0 20px',
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  wordBreak: 'break-word',
                  transition: 'all 0.3s ease',
                }}
              >
                <div>{msg.text}</div>

                <div
                  className="d-flex align-items-center justify-content-end gap-1"
                  style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '4px' }}
                >
                  <span>{formatTime(msg.timestamp)}</span>
                  {msg.senderId === currentUser.uid && (
                    <span>
                      {msg.read ? (
                        <BsCheckAll style={{ color: '#fff', fontSize: '1rem' }} />
                      ) : (
                        <BsCheck style={{ fontSize: '1rem' }} />
                      )}
                    </span>
                  )}
                </div>

                {msg.senderId === currentUser.uid && hoveredMsgId === msg.id && (
                  <div
                    onClick={() => toggleDropdown(msg.id)}
                    className="position-absolute"
                    style={{
                      top: '4px',
                      right: '6px',
                      cursor: 'pointer',
                      color: '#fff',
                    }}
                    title="Options"
                  >
                    <FiChevronDown />
                  </div>
                )}
              </div>

              {openDropdown === msg.id && (
                <div
                  ref={dropdownRef}
                  className="bg-white border rounded shadow-sm"
                  style={{
                    position: 'absolute',
                    [dropdownDirection === 'up' ? 'bottom' : 'top']: '100%',
                    right: msg.senderId === currentUser.uid ? '0' : 'unset',
                    left: msg.senderId !== currentUser.uid ? '0' : 'unset',
                    zIndex: 100,
                    width: '180px',
                    marginTop: dropdownDirection === 'down' ? '5px' : '',
                    marginBottom: dropdownDirection === 'up' ? '5px' : '',
                  }}
                >
                  <div
                    className="dropdown-item py-2 px-3 border-bottom text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDeleteForMe(msg)}
                  >
                    Delete for me
                  </div>
                  <div
                    className="dropdown-item py-2 px-3 text-danger"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDeleteForEveryone(msg)}
                  >
                    Delete for everyone
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
