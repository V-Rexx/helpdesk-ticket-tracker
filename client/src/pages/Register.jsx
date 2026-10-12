import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card narrow" onSubmit={handleSubmit}>
      <h1>Create account</h1>
      {error && <p className="error">{error}</p>}
      <label>Name
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label>Email
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label>Password (min 6 characters)
        <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </label>
      <button className="btn" disabled={busy}>{busy ? "Creating…" : "Register"}</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
