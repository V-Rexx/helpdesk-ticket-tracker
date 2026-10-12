import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { HiOutlineChevronRight, HiOutlineInbox, HiOutlineMagnifyingGlass, HiPlus } from "react-icons/hi2";
import { PriorityBadge, Spinner, StatusBadge, btn, btnSecondary, card, errorBox } from "../ui";

export default function TicketList() {
  const { user } = useAuth();
  const isAgent = user.role === "agent";
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

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{isAgent ? "All tickets" : "My tickets"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAgent ? "Triage, assign and resolve requests from your team." : "Track the status of the requests you've raised."}
          </p>
        </div>
        <Link to="/tickets/new" className={btn}><HiPlus className="size-4" />New ticket</Link>
      </div>

      <div className={card}>
        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 p-4 sm:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input className="pl-9" placeholder="Search by title…" value={filters.search} onChange={(e) => changeFilter("search", e.target.value)} />
          </div>
          <select value={filters.status} onChange={(e) => changeFilter("status", e.target.value)}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filters.priority} onChange={(e) => changeFilter("priority", e.target.value)}>
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {error && <p className={`${errorBox} m-4`}>{error}</p>}

        {loading && data.tickets.length === 0 ? (
          <Spinner label="Loading tickets…" />
        ) : !loading && data.tickets.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <HiOutlineInbox className="size-6" />
            </span>
            <p className="text-sm font-medium text-slate-900">No tickets found</p>
            <p className="mt-1 text-sm text-slate-500">
              {hasFilters ? "Try adjusting your search or filters." : "When tickets are raised, they'll show up here."}
            </p>
          </div>
        ) : (
          <ul className={`divide-y divide-slate-100 transition-opacity ${loading ? "opacity-60" : ""}`}>
            {data.tickets.map((t) => (
              <li key={t._id}>
                <Link
                  to={`/tickets/${t._id}`}
                  className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-6 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 group-hover:text-indigo-600">{t.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                      {isAgent && <><span>{t.createdBy?.name}</span><span className="text-slate-300">•</span></>}
                      <span>{new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span className="text-slate-300">•</span>
                      <span>{t.assignedTo ? `Assigned to ${t.assignedTo.name}` : "Unassigned"}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <HiOutlineChevronRight className="ml-1 hidden size-4 text-slate-300 group-hover:text-slate-500 sm:block" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {data.total > 0 && (
          <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 sm:px-5">
            <p className="text-sm text-slate-500">
              {data.total} {data.total === 1 ? "ticket" : "tickets"}
              {data.totalPages > 1 && <> · Page {page} of {data.totalPages}</>}
            </p>
            {data.totalPages > 1 && (
              <div className="flex gap-2">
                <button className={btnSecondary} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <button className={btnSecondary} disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
