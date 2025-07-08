import React, { useEffect, useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import { useAuthContext } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import UserAvatar from "../UserAvatar";
import { getChatId } from "../../utils/getChatId";

const UserCard = ({ user }) => {
  const { setSelectedUser, notifications, setShowChatWindowOnMobile } = useChatContext();
  const { currentUser } = useAuthContext();

  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const cleanedUid = String(user.uid).trim();

  useEffect(() => {
    const count = parseInt(notifications?.[cleanedUid] || 0);
    setUnreadCount(count);
  }, [notifications, cleanedUid]);

  useEffect(() => {
    if (!currentUser || !user) return;

    const chatId = getChatId(currentUser.uid, user.uid);

    const unsubMessage = onSnapshot(
      doc(db, "userChats", currentUser.uid, "chats", chatId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLastMessage(data.lastMessage || "");
          setLastMessageTime(data.timestamp?.toDate() || null);
        } else {
          setLastMessage("");
          setLastMessageTime(null);
        }
      }
    );

    return () => {
      unsubMessage();
    };
  }, [currentUser, user]);

  const handleSelect = () => {
    setSelectedUser(user);
    setShowChatWindowOnMobile(true);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const isToday = timestamp.toDateString() === now.toDateString();
    return isToday
      ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : timestamp.toLocaleDateString();
  };

  return (
    <div
      onClick={handleSelect}
      style={{
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
        backgroundColor: "white",
        transition: "background-color 0.2s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f0f4f8")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ position: "relative", marginRight: "10px" }}>
          <UserAvatar
            photoURL={user.photoURL}
            displayName={user.displayName}
            uid={user.uid}
            size={40}
          />
          {unreadCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "red",
                color: "white",
                width: "18px",
                height: "18px",
                fontSize: "0.7rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "2px solid white",
                fontWeight: "bold",
                zIndex: 1,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>

        <div>
          {user.displayName}
          <div
            style={{
              fontSize: "0.8rem",
              color: "#6c757d",
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {lastMessage ? lastMessage : "No messages yet"}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "0.7rem",
          color: "#6c757d",
          textAlign: "right",
          minWidth: "65px",
        }}
      >
        {lastMessageTime ? formatTime(lastMessageTime) : ""}
      </div>
    </div>
  );
};

export default UserCard;
