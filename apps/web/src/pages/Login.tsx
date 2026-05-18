import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { useAuth } from "../store/auth";

const demos = [
  ["employee@goalsync.com", "Employee"],
  ["manager@goalsync.com", "Manager"],
  ["admin@goalsync.com", "Admin"]
] as const;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("employee@goalsync.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome to GoalSync");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-panel lg:grid-cols-[1.1fr_.9fr]">
      <section className="flex items-center px-8 py-12 lg:px-16">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-coral">Enterprise HRMS</p>
          <h1 className="mt-4 text-5xl font-bold text-ink">GoalSync</h1>
          <p className="mt-4 text-lg text-slate-600">In-house goal setting, manager approval, quarterly tracking, governance, and auditability in one focused performance workflow.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {demos.map(([demoEmail, label]) => (
              <button key={demoEmail} onClick={() => setEmail(demoEmail)} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-soft">
                <p className="font-semibold text-ink">{label}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{demoEmail}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-white px-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 p-8 shadow-soft">
          <h2 className="text-2xl font-bold text-ink">Sign in</h2>
          <label className="mt-6 block text-sm font-semibold text-slate-700">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" />
          <label className="mt-4 block text-sm font-semibold text-slate-700">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" />
          <Button disabled={loading} className="mt-6 w-full">{loading ? "Signing in..." : "Login"}</Button>
        </form>
      </section>
    </main>
  );
}
