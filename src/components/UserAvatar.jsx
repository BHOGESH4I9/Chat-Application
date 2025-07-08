import React from 'react';

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 55%)`;
};

const getInitials = (name) => {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const UserAvatar = ({ photoURL, displayName, uid, size = 40, className = '' }) => {
  const initials = getInitials(displayName);
  const bgColor = stringToColor(uid || displayName || 'U');

  return photoURL ? (
    <img
      src={photoURL}
      alt="User"
      className={`rounded-circle ${className}`}
      style={{ width: size, height: size, objectFit: 'cover' }}
    />
  ) : (
    <div
      className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        backgroundColor: bgColor,
      }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
