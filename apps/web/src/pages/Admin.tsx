import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";
import { useGoalMutations, useGoals } from "../hooks/useGoals";
import type { Role, User } from "../types/domain";

export function Admin() {
  const { data: users = [], refetch } = useQuery({ queryKey: ["users"], queryFn: async () => (await api.get<User[]>("/admin/users")).data });
  const { data: cycle } = useQuery({ queryKey: ["cycle"], queryFn: async () => (await api.get("/admin/cycle")).data });
  const { data: goals = [] } = useGoals();
  const { unlock } = useGoalMutations();
  const [form, setForm] = useState({ name: "", email: "", password: "password123", role: "EMPLOYEE" as Role, managerId: "" });
  const [shared, setShared] = useState({ title: "", description: "", thrustArea: "", targetValue: 0, weightage: 10, quarter: "FY26", deadline: "2026-12-31", assignedEmployees: [] as string[] });
  const saveUser = useMutation({ mutationFn: () => api.post("/admin/users", form), onSuccess: () => refetch() });
  const saveShared = useMutation({ mutationFn: () => api.post("/goals/shared", { ...shared, deadline: new Date(shared.deadline).toISOString() }) });

  async function submit(event: FormEvent) {
    event.preventDefault();
    await saveUser.mutateAsync();
    toast.success("User saved");
  }

  async function createShared(event: FormEvent) {
    event.preventDefault();
    await saveShared.mutateAsync();
    toast.success("Shared departmental goal assigned");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Active cycle</p><p className="mt-2 text-2xl font-bold text-brand">{cycle?.activeCycle ?? "Loading"}</p></Card>
        <Card><p className="text-sm text-slate-500">Users</p><p className="mt-2 text-2xl font-bold text-brand">{users.length}</p></Card>
        <Card><p className="text-sm text-slate-500">Approved goals</p><p className="mt-2 text-2xl font-bold text-brand">{goals.filter((g) => g.approvalStatus === "APPROVED").length}</p></Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="text-lg font-bold">Manage Users</h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border px-3 py-2" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border px-3 py-2" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="w-full rounded-md border px-3 py-2">
              <option>EMPLOYEE</option><option>MANAGER</option><option>ADMIN</option>
            </select>
            <Button>Save User</Button>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Department Shared Goal</h2>
          <form onSubmit={createShared} className="mt-4 grid gap-3 lg:grid-cols-2">
            <input required placeholder="Title" value={shared.title} onChange={(e) => setShared({ ...shared, title: e.target.value })} className="rounded-md border px-3 py-2" />
            <input required placeholder="Thrust Area" value={shared.thrustArea} onChange={(e) => setShared({ ...shared, thrustArea: e.target.value })} className="rounded-md border px-3 py-2" />
            <input type="number" min={0} placeholder="Target" value={shared.targetValue} onChange={(e) => setShared({ ...shared, targetValue: Number(e.target.value) })} className="rounded-md border px-3 py-2" />
            <input type="number" min={10} max={100} placeholder="Weightage" value={shared.weightage} onChange={(e) => setShared({ ...shared, weightage: Number(e.target.value) })} className="rounded-md border px-3 py-2" />
            <input type="date" value={shared.deadline} onChange={(e) => setShared({ ...shared, deadline: e.target.value })} className="rounded-md border px-3 py-2" />
            <select multiple value={shared.assignedEmployees} onChange={(e) => setShared({ ...shared, assignedEmployees: Array.from(e.target.selectedOptions).map((option) => option.value) })} className="min-h-24 rounded-md border px-3 py-2">
              {users.filter((user) => user.role === "EMPLOYEE").map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
            <textarea required placeholder="Description" value={shared.description} onChange={(e) => setShared({ ...shared, description: e.target.value })} className="min-h-24 rounded-md border px-3 py-2 lg:col-span-2" />
            <Button className="lg:col-span-2">Assign Shared Goal</Button>
          </form>
        </Card>
      </div>
      <div className="grid gap-5">
        <Card>
          <h2 className="text-lg font-bold">Unlock Approved Goals</h2>
          <div className="mt-4 divide-y">
            {goals.filter((goal) => goal.isLocked).map((goal) => (
              <div key={goal.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{goal.title}</p>
                  <p className="text-sm text-slate-500">{goal.employee?.name} · {goal.approvalStatus}</p>
                </div>
                <Button variant="secondary" onClick={() => unlock.mutate(goal.id)}>Unlock</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
