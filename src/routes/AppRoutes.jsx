import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from '../pages/ChatPage'
import { useAuthContext } from "../context/AuthContext";
import AuthPage from "../pages/AuthPage/AuthPage";

const AppRoutes = () => {
  const { currentUser } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/auth"
        element={!currentUser ? <AuthPage /> : <Navigate to="/" />}
      />

      <Route
        path="/"
        element={currentUser ? <ChatPage /> : <Navigate to="/auth" />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
