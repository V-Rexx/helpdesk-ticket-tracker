import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

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
    <form className="card" onSubmit={handleSubmit}>
      <h1>New ticket</h1>
      {error && <p className="error">{error}</p>}
      <label>Title
        <input required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </label>
      <label>Describe the problem
        <textarea required rows={5} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <label>Priority
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <div className="row">
        <button className="btn" disabled={busy}>{busy ? "Submitting…" : "Submit ticket"}</button>
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </form>
  );
}
