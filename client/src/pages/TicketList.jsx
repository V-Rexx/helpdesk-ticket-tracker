import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export const STATUS_LABEL = { open: "Open", in_progress: "In progress", resolved: "Resolved" };

export default function TicketList() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ tickets: [], totalPages: 1, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ page, limit: 10 });
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      setLoading(true);
      api(`/tickets?${params}`)
        .then((d) => { setData(d); setError(""); })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, page]);

  function changeFilter(key, value) {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  }

  return (
    <>
      <div className="page-head">
        <h1>{user.role === "agent" ? "All tickets" : "My tickets"}</h1>
        <Link to="/tickets/new" className="btn">New ticket</Link>
      </div>

      <div className="filters">
        <input placeholder="Search by title" value={filters.search} onChange={(e) => changeFilter("search", e.target.value)} />
        <select value={filters.status} onChange={(e) => changeFilter("status", e.target.value)}>
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filters.priority} onChange={(e) => changeFilter("priority", e.target.value)}>
          <option value="">Any priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {!loading && data.tickets.length === 0 && <p className="muted empty">No tickets found.</p>}

      <ul className="ticket-list">
        {data.tickets.map((t) => (
          <li key={t._id}>
            <Link to={`/tickets/${t._id}`} className="ticket-row">
              <div>
                <strong>{t.title}</strong>
                <div className="muted small">
                  {user.role === "agent" && <>by {t.createdBy?.name} · </>}
                  {new Date(t.createdAt).toLocaleDateString()}
                  {t.assignedTo && <> · assigned to {t.assignedTo.name}</>}
                </div>
              </div>
              <div className="tags">
                <span className={`tag priority-${t.priority}`}>{t.priority}</span>
                <span className={`tag status-${t.status}`}>{STATUS_LABEL[t.status]}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {data.totalPages > 1 && (
        <div className="pager">
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">Page {page} of {data.totalPages}</span>
          <button className="btn-secondary" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
