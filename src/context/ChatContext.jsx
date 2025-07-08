import { createContext, useContext, useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  updateDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuthContext } from "./AuthContext";
import { getChatId } from "../utils/getChatId";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuthContext();

  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState({});
  const [showChatWindowOnMobile, setShowChatWindowOnMobile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUserStatus, setSelectedUserStatus] = useState({
    isOnline: false,
    lastSeen: null,
  });

  // Generate chatId when user is selected
  useEffect(() => {
    if (currentUser && selectedUser) {
      const id = getChatId(currentUser.uid, selectedUser.uid);
      setChatId(id);
    }
  }, [selectedUser, currentUser]);

  // Fetch chat messages
  useEffect(() => {
    if (!chatId) return;

    const msgRef = collection(db, "chats", chatId, "messages");
    const q = query(msgRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId]);

  // Listen to selectedUser's status (online/lastSeen)
  useEffect(() => {
    if (!selectedUser) return;

    const userRef = doc(db, "users", selectedUser.uid);
    const unsub = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSelectedUserStatus({
          isOnline: data?.isOnline || false,
          lastSeen: data?.lastSeen?.toDate?.() || null,
        });
      }
    });

    return () => unsub();
  }, [selectedUser]);

  // ✅ FIXED: Listen for unread message notifications
  useEffect(() => {
    if (!currentUser) return;

    const chatIdsRef = collection(db, "userChats", currentUser.uid, "chats");

    const unsub = onSnapshot(chatIdsRef, (snapshot) => {
      const unsubList = snapshot.docs.map((chatDoc) => {
        const chatId = chatDoc.id;

        const uids = chatId.split("_");
        const senderUid = uids.find((uid) => uid !== currentUser.uid);

        const q = query(
          collection(db, "chats", chatId, "messages"),
          where("receiverId", "==", currentUser.uid),
          where("read", "==", false),
          where("senderId", "==", senderUid)
        );

        return onSnapshot(q, (msgsSnap) => {
          setNotifications((prev) => ({
            ...prev,
            [senderUid.trim()]: msgsSnap.docs.length,
          }));
        });
      });

      return () => unsubList.forEach((fn) => fn());
    });

    return () => unsub();
  }, [currentUser]);

  // Mark messages as read when user opens the chat
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const msgsRef = collection(db, "chats", chatId, "messages");
    const q = query(
      msgsRef,
      where("receiverId", "==", currentUser.uid),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      const updates = snap.docs.map((docSnap) =>
        updateDoc(docSnap.ref, { read: true })
      );
      Promise.all(updates).catch((error) =>
        console.error("Error marking messages as read:", error)
      );
    });

    return () => unsub();
  }, [chatId, currentUser]);

  const sendMessage = async (text) => {
    if (!text.trim() || !chatId || !currentUser || !selectedUser) return;

    const message = {
      senderId: currentUser.uid,
      receiverId: selectedUser.uid,
      text,
      timestamp: serverTimestamp(),
      read: false,
      deletedFor: [],
      deletedForEveryone: false,
    };

    try {
      const messageRef = await addDoc(
        collection(db, "chats", chatId, "messages"),
        message
      );

      const metaData = {
        uid: selectedUser.uid,
        lastMessage: text,
        timestamp: serverTimestamp(),
      };

      const reverseMetaData = {
        uid: currentUser.uid,
        lastMessage: text,
        timestamp: serverTimestamp(),
      };

      await setDoc(
        doc(db, "userChats", currentUser.uid, "chats", chatId),
        metaData
      );
      await setDoc(
        doc(db, "userChats", selectedUser.uid, "chats", chatId),
        reverseMetaData
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 55%)`;
  };

  return (
    <ChatContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        chatId,
        messages,
        sendMessage,
        searchQuery,
        setSearchQuery,
        notifications,
        showChatWindowOnMobile,
        setShowChatWindowOnMobile,
        isTyping,
        setIsTyping,
        stringToColor,
        selectedUserStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
