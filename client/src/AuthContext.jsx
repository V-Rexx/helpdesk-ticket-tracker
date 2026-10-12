import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) return setLoading(false);
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  function saveSession({ token, user }) {
    localStorage.setItem("token", token);
    setUser(user);
  }

  async function login(email, password) {
    saveSession(await api("/auth/login", { method: "POST", body: { email, password } }));
  }

  async function register(name, email, password) {
    saveSession(await api("/auth/register", { method: "POST", body: { name, email, password } }));
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
