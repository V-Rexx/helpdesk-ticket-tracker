import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TicketList from "./pages/TicketList";
import NewTicket from "./pages/NewTicket";
import TicketDetail from "./pages/TicketDetail";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted">Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">Helpdesk</Link>
        {user && (
          <div className="topbar-right">
            <span className="muted">
              {user.name} <span className={`role role-${user.role}`}>{user.role}</span>
            </span>
            <button className="btn-link" onClick={logout}>Log out</button>
          </div>
        )}
      </header>

      <main className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<Protected><TicketList /></Protected>} />
          <Route path="/tickets/new" element={<Protected><NewTicket /></Protected>} />
          <Route path="/tickets/:id" element={<Protected><TicketDetail /></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
