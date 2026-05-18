import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useGoalMutations, useGoals } from "../hooks/useGoals";
import { validateGoalSheet } from "../utils/validation";
import type { UomType } from "../types/domain";

const initial = { thrustArea: "", title: "", description: "", uomType: "MIN" as UomType, targetValue: 0, weightage: 10, quarter: "FY26", deadline: "2026-12-31" };

export function Goals() {
  const { data: goals = [], isLoading } = useGoals();
  const mutations = useGoalMutations();
  const [form, setForm] = useState(initial);
  const total = useMemo(() => goals.reduce((sum, goal) => sum + goal.weightage, 0), [goals]);
  const sheetError = validateGoalSheet(goals);

  async function create(event: FormEvent) {
    event.preventDefault();
    await mutations.create.mutateAsync({ ...form, deadline: new Date(form.deadline).toISOString() });
    setForm(initial);
    toast.success("Goal saved as draft");
  }

  async function submitSheet() {
    const error = validateGoalSheet(goals);
    if (error) return toast.error(error);
    await mutations.submit.mutateAsync();
    toast.success("Goal sheet submitted");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Card>
        <h2 className="text-lg font-bold">Create Goal</h2>
        <form onSubmit={create} className="mt-4 space-y-3">
          <input required placeholder="Thrust Area" value={form.thrustArea} onChange={(e) => setForm({ ...form, thrustArea: e.target.value })} className="w-full rounded-md border px-3 py-2" />
          <input required placeholder="Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border px-3 py-2" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-24 w-full rounded-md border px-3 py-2" />
          <select value={form.uomType} onChange={(e) => setForm({ ...form, uomType: e.target.value as UomType })} className="w-full rounded-md border px-3 py-2">
            <option value="MIN">MIN - higher is better</option>
            <option value="MAX">MAX - lower is better</option>
            <option value="TIMELINE">Timeline</option>
            <option value="ZERO">Zero defect</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min={0} placeholder="Target" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} className="rounded-md border px-3 py-2" />
            <input type="number" min={10} max={100} placeholder="Weightage" value={form.weightage} onChange={(e) => setForm({ ...form, weightage: Number(e.target.value) })} className="rounded-md border px-3 py-2" />
          </div>
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full rounded-md border px-3 py-2" />
          <Button className="w-full" disabled={mutations.create.isPending}>Save Draft</Button>
        </form>
      </Card>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Goal Sheet</h2>
            <p className={`text-sm ${sheetError ? "text-coral" : "text-brand"}`}>Weightage total: {total}% {sheetError ? `· ${sheetError}` : "· ready to submit"}</p>
          </div>
          <Button onClick={submitSheet} disabled={isLoading || Boolean(sheetError)}>Submit Sheet</Button>
        </div>
        <div className="grid gap-3">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand">{goal.thrustArea}</p>
                  <h3 className="text-lg font-bold">{goal.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{goal.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{goal.progressScore}%</p>
                  <p className="text-sm text-slate-500">{goal.approvalStatus} · {goal.weightage}%</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
