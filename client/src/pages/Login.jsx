import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { btn, errorBox, link } from "../ui";
import AuthLayout from "./AuthLayout";

const DEMO_ACCOUNTS = [
  { label: "Agent", email: "agent@demo.com", password: "agent123" },
  { label: "User", email: "user@demo.com", password: "user123" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your support tickets"
      footer={<>No account? <Link to="/register" className={link}>Create one</Link></>}
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <p className={errorBox}>{error}</p>}
        <label>Email
          <input type="email" required autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>Password
          <input type="password" required autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className={`${btn} h-10 w-full`} disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="mb-2.5 text-xs font-medium tracking-wide text-slate-500 uppercase">Try a demo account</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => setForm({ email: a.email, password: a.password })}
              className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <span className="block text-sm font-medium text-slate-900">{a.label}</span>
              <span className="block truncate text-xs text-slate-500">{a.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
