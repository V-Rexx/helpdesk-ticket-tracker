import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { btn, errorBox, link } from "../ui";
import AuthLayout from "./AuthLayout";

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
    <AuthLayout
      title="Create your account"
      subtitle="Raise and track support requests in one place"
      footer={<>Already registered? <Link to="/login" className={link}>Log in</Link></>}
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <p className={errorBox}>{error}</p>}
        <label>Full name
          <input required autoComplete="name" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>Email
          <input type="email" required autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>Password
          <input type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className={`${btn} h-10 w-full`} disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
      </form>
    </AuthLayout>
  );
}
