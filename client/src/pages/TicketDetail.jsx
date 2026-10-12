import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { HiOutlineArrowLeft, HiOutlineChatBubbleOvalLeftEllipsis } from "react-icons/hi2";
import { Avatar, PriorityBadge, RoleBadge, Spinner, StatusBadge, btn, btnSecondary, card, errorBox, link } from "../ui";

const NEXT_STATUS = {
  open: ["in_progress"],
  in_progress: ["resolved", "open"],
  resolved: ["open"],
};
const ACTION_LABEL = { in_progress: "Start work", resolved: "Mark resolved", open: "Reopen" };

const formatDate = (d) =>
  new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

function Detail({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function Person({ name }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar name={name} size="size-6 text-[10px]" />
      {name}
    </span>
  );
}

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
    return error
      ? <p className={errorBox}>{error} · <Link to="/" className={link}>Back to tickets</Link></p>
      : <Spinner label="Loading ticket…" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="inline-flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <HiOutlineArrowLeft className="size-4" />All tickets
      </Link>

      {error && <p className={errorBox}>{error}</p>}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <article className={`${card} p-6`}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{ticket.title}</h1>
            <div className="mt-3 flex items-center gap-2.5 text-sm text-slate-500">
              <Avatar name={ticket.createdBy?.name} size="size-7 text-[11px]" />
              <span><span className="font-medium text-slate-700">{ticket.createdBy?.name}</span> opened this on {formatDate(ticket.createdAt)}</span>
            </div>
            <p className="mt-6 border-t border-slate-100 pt-6 text-[15px] leading-relaxed whitespace-pre-wrap text-slate-700">{ticket.description}</p>
          </article>

          <section className={card}>
            <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
              <HiOutlineChatBubbleOvalLeftEllipsis className="size-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">Activity</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{ticket.comments.length}</span>
            </div>

            <div className="p-6">
              {ticket.comments.length === 0 ? (
                <p className="text-sm text-slate-500">No comments yet. Start the conversation below.</p>
              ) : (
                <ul className="flex flex-col gap-6">
                  {ticket.comments.map((c) => (
                    <li key={c._id} className="flex gap-3">
                      <Avatar name={c.author?.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium text-slate-900">{c.author?.name}</span>
                          <RoleBadge role={c.author?.role} />
                          <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{c.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={addComment} className="mt-6 flex gap-3 border-t border-slate-100 pt-6">
                <Avatar name={user.name} />
                <div className="flex flex-1 flex-col items-end gap-3">
                  <textarea rows={3} placeholder="Write a comment…" value={comment} onChange={(e) => setComment(e.target.value)} />
                  <button className={btn} disabled={busy || !comment.trim()}>Comment</button>
                </div>
              </form>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          {isAgent && (
            <div className={`${card} p-5`}>
              <h2 className="text-sm font-semibold text-slate-900">Actions</h2>
              <div className="mt-3 flex flex-col gap-2">
                {NEXT_STATUS[ticket.status].map((s, i) => (
                  <button
                    key={s}
                    className={`${i === 0 ? btn : btnSecondary} w-full`}
                    disabled={busy}
                    onClick={() => run("/status", { status: s })}
                  >
                    {ACTION_LABEL[s]}
                  </button>
                ))}
              </div>
              <label className="mt-5">Assignee
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
          )}

          <div className={`${card} px-5 py-2`}>
            <dl className="divide-y divide-slate-100">
              <Detail label="Status"><StatusBadge status={ticket.status} /></Detail>
              <Detail label="Priority"><PriorityBadge priority={ticket.priority} /></Detail>
              <Detail label="Reporter"><Person name={ticket.createdBy?.name} /></Detail>
              <Detail label="Assignee">
                {ticket.assignedTo ? <Person name={ticket.assignedTo.name} /> : <span className="font-normal text-slate-400">Unassigned</span>}
              </Detail>
              <Detail label="Created">{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</Detail>
              {ticket.updatedAt && (
                <Detail label="Updated">{new Date(ticket.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</Detail>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
