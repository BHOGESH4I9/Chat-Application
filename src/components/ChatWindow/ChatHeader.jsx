import React, { useEffect, useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BsTelephone, BsCameraVideo } from 'react-icons/bs';
import UserAvatar from '../UserAvatar'; 

const ChatHeader = () => {
  const { selectedUser } = useChatContext();
  const [status, setStatus] = useState({ isOnline: false, lastSeen: null });

  useEffect(() => {
    if (!selectedUser?.uid) return;

    const unsub = onSnapshot(doc(db, 'users', selectedUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus({
          isOnline: data.isOnline,
          lastSeen: data.lastSeen?.toDate() || null,
        });
      }
    });

    return () => unsub();
  }, [selectedUser]);

  if (!selectedUser) return null;

  const { isOnline, lastSeen } = status;

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'unavailable';
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();

    return isToday
      ? `today at ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : `${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const subtitle = isOnline ? 'Online' : `Last seen: ${formatLastSeen(lastSeen)}`;

  return (
    <div className="d-flex align-items-center justify-content-between p-2 border-bottom bg-white">
      <div className="d-flex align-items-center">
        <UserAvatar
          photoURL={selectedUser.photoURL}
          displayName={selectedUser.displayName}
          uid={selectedUser.uid}
          className="me-2"
        />
        <div>
          {selectedUser.displayName}
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>{subtitle}</div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 me-2">
        <BsTelephone size={20} className="text-secondary" style={{ cursor: 'pointer' }} title="Audio Call" />
        <BsCameraVideo size={20} className="text-secondary" style={{ cursor: 'pointer' }} title="Video Call" />
      </div>
    </div>
  );
};

export default ChatHeader;