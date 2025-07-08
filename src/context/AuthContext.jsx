import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cleanup = () => {};
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const userRef = doc(db, "users", user.uid);

        try {
          await updateDoc(userRef, {
            isOnline: true,
            lastSeen: serverTimestamp(),
          });
        } catch (error) {
          console.error("Failed to mark user online:", error);
        }

        const handleBeforeUnload = async () => {
          try {
            await updateDoc(userRef, {
              isOnline: false,
              lastSeen: serverTimestamp(),
            });
          } catch (error) {
            console.error("Failed to update user offline on unload:", error);
          }
        };

        // Add unload listener
        window.addEventListener("beforeunload", handleBeforeUnload);

        // Cleanup on logout
        cleanup = () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };
      } else {
        if (currentUser?.uid) {
          try {
            await updateDoc(doc(db, "users", currentUser.uid), {
              isOnline: false,
              lastSeen: serverTimestamp(),
            });
          } catch (error) {
            console.error("Error marking user offline:", error);
          }
        }
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return () => {
      unsub();
      cleanup();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
