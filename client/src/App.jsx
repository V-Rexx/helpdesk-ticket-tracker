import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { HiOutlineArrowRightStartOnRectangle } from "react-icons/hi2";
import { Avatar, Logo, RoleBadge, Spinner, btnGhost } from "./ui";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TicketList from "./pages/TicketList";
import NewTicket from "./pages/NewTicket";
import TicketDetail from "./pages/TicketDetail";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Logo /></Link>
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2.5 sm:flex">
                <Avatar name={user.name} />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-slate-900">{user.name}</span>
                  <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                </div>
              </div>
              <span className="sm:hidden"><RoleBadge role={user.role} /></span>
              <span className="h-6 w-px bg-slate-200" />
              <button className={btnGhost} onClick={logout}>
                <HiOutlineArrowRightStartOnRectangle className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<Protected><TicketList /></Protected>} />
          <Route path="/tickets/new" element={<Protected><NewTicket /></Protected>} />
          <Route path="/tickets/:id" element={<Protected><TicketDetail /></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
