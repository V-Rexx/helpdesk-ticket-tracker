import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { btn, btnSecondary, card, errorBox } from "../ui";

const PRIORITIES = [
  { value: "low", label: "Low", hint: "Minor issue, no rush" },
  { value: "medium", label: "Medium", hint: "Affects my work" },
  { value: "high", label: "High", hint: "Blocking or urgent" },
];

export default function NewTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { ticket } = await api("/tickets", { method: "POST", body: form });
      navigate(`/tickets/${ticket._id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
          <HiOutlineArrowLeft className="size-4" />All tickets
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">New ticket</h1>
        <p className="mt-1 text-sm text-slate-500">Describe the problem and our support team will pick it up.</p>
      </div>

      <form className={card} onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 p-6">
          {error && <p className={errorBox}>{error}</p>}
          <label>Title
            <input required maxLength={120} placeholder="e.g. Can't connect to the VPN" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>Description
            <textarea required rows={6} maxLength={2000} placeholder="What happened, what you expected, and any steps to reproduce." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <span className="self-end text-xs font-normal text-slate-400">{form.description.length}/2000</span>
          </label>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Priority</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {PRIORITIES.map((p) => {
                const selected = form.priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setForm({ ...form, priority: p.value })}
                    className={`cursor-pointer rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                      selected ? "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className={`block text-sm font-medium ${selected ? "text-indigo-700" : "text-slate-900"}`}>{p.label}</span>
                    <span className="block text-xs text-slate-500">{p.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" className={btnSecondary} onClick={() => navigate(-1)}>Cancel</button>
          <button className={btn} disabled={busy}>{busy ? "Submitting…" : "Submit ticket"}</button>
        </div>
      </form>
    </div>
  );
}
