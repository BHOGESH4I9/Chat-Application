import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { useAuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import SearchBar from "./SearchBar";
import UserCard from "./UserCard";
import { Dropdown } from "react-bootstrap";
import { BsThreeDotsVertical } from "react-icons/bs";
import { signOut } from "firebase/auth";

const Sidebar = () => {
  const { currentUser } = useAuthContext();
  const { searchQuery } = useChatContext();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs
        .map((doc) => doc.data())
        .filter((u) => u.uid !== currentUser.uid);

      setUsers(userList);
      setLoadingUsers(false);
    });

    return () => unsub();
  }, [currentUser]);

  const filteredUsers = users.filter((user) =>
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ✅ Custom dropdown toggle without caret
  const CustomToggle = React.forwardRef(({ onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{ cursor: "pointer" }}
    >
      <BsThreeDotsVertical size={18} />
    </div>
  ));

  return (
    <div
      className="sidebar bg-light p-3"
      style={{ width: "450px", height: "100vh", overflowY: "auto" }}
    >
      {/* Header: App Title + 3-dot Options */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0 fw-bold text-primary">ChatBox</h5>

        <Dropdown align="end">
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-toggle" />

          <Dropdown.Menu>
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Users List */}
      <div className="user-list mt-3">
        {loadingUsers ? (
          <p className="text-center text-muted">Loading users...</p>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCard key={user.uid} user={user} />
          ))
        ) : (
          <p className="text-muted text-center mt-4">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
