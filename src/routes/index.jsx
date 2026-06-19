import React, { useState } from "react";
import AuthScreen from "../features/auth/AuthScreen.jsx";
import MainApp from "../pages/MainApp.jsx";

export default function AppRoutes() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState(null);

  if (!authed) {
    return <AuthScreen onLogin={(r) => { setRole(r); setAuthed(true); }} />;
  }
  return <MainApp role={role} onLogout={() => { setAuthed(false); setRole(null); }} />;
}