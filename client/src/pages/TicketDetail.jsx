import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { STATUS_LABEL } from "./TicketList";

const NEXT_STATUS = {
  open: ["in_progress"],
  in_progress: ["resolved", "open"],
  resolved: ["open"],
};
const ACTION_LABEL = { in_progress: "Start work", resolved: "Mark resolved", open: "Reopen" };

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAgent = user.role === "agent";

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/tickets/${id}`).then((d) => setTicket(d.ticket)).catch((err) => setError(err.message));
    if (isAgent) api("/users/agents").then((d) => setAgents(d.agents)).catch(() => {});
  }, [id, isAgent]);

  // Runs an update and replaces the ticket with the server's response.
  async function run(path, body, method = "PATCH") {
    setError("");
    setBusy(true);
    try {
      const d = await api(`/tickets/${id}${path}`, { method, body });
      setTicket(d.ticket);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (await run("/comments", { text: comment }, "POST")) setComment("");
  }

  if (!ticket) {
    return error ? <p className="error">{error} <Link to="/">Back</Link></p> : <p className="muted">Loading…</p>;
  }

  return (
    <>
      <Link to="/" className="muted small">← All tickets</Link>

      <div className="card">
        <div className="page-head">
          <h1>{ticket.title}</h1>
          <div className="tags">
            <span className={`tag priority-${ticket.priority}`}>{ticket.priority}</span>
            <span className={`tag status-${ticket.status}`}>{STATUS_LABEL[ticket.status]}</span>
          </div>
        </div>
        <p className="muted small">
          Raised by {ticket.createdBy?.name} on {new Date(ticket.createdAt).toLocaleString()}
        </p>
        <p className="description">{ticket.description}</p>

        {error && <p className="error">{error}</p>}

        {isAgent ? (
          <div className="agent-panel">
            <div className="row">
              {NEXT_STATUS[ticket.status].map((s) => (
                <button key={s} className="btn" disabled={busy} onClick={() => run("/status", { status: s })}>
                  {ACTION_LABEL[s]}
                </button>
              ))}
            </div>
            <label>Assigned to
              <select
                value={ticket.assignedTo?._id || ""}
                disabled={busy}
                onChange={(e) => run("/assign", { agentId: e.target.value || null })}
              >
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </label>
          </div>
        ) : (
          <p className="muted small">Assigned to: {ticket.assignedTo?.name || "not yet assigned"}</p>
        )}
      </div>

      <div className="card">
        <h2>Comments ({ticket.comments.length})</h2>
        {ticket.comments.length === 0 && <p className="muted">No comments yet.</p>}
        <ul className="comments">
          {ticket.comments.map((c) => (
            <li key={c._id}>
              <div className="small">
                <strong>{c.author?.name}</strong>{" "}
                <span className={`role role-${c.author?.role}`}>{c.author?.role}</span>{" "}
                <span className="muted">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={addComment}>
          <textarea rows={3} placeholder="Write a comment" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn" disabled={busy || !comment.trim()}>Add comment</button>
        </form>
      </div>
    </>
  );
}
