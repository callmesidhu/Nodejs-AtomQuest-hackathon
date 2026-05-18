import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useGoals } from "../hooks/useGoals";
import { api } from "../services/api";

export function Checkins() {
  const { data: goals = [] } = useGoals();
  const [goalId, setGoalId] = useState("");
  const [achievement, setAchievement] = useState(0);
  const [quarter, setQuarter] = useState("Q1");
  const [employeeComment, setEmployeeComment] = useState("");
  const mutation = useMutation({ mutationFn: () => api.post("/checkins", { goalId, achievement, quarter, employeeComment, status: "ON_TRACK" }) });

  async function submit(event: FormEvent) {
    event.preventDefault();
    await mutation.mutateAsync();
    toast.success("Check-in submitted");
  }

  return (
    <Card className="max-w-2xl">
      <h2 className="text-xl font-bold">Quarterly Check-in</h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <select required value={goalId} onChange={(e) => setGoalId(e.target.value)} className="w-full rounded-md border px-3 py-2">
          <option value="">Select goal</option>
          {goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
        </select>
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="w-full rounded-md border px-3 py-2">
          <option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option>
        </select>
        <input type="number" min={0} value={achievement} onChange={(e) => setAchievement(Number(e.target.value))} className="w-full rounded-md border px-3 py-2" />
        <textarea placeholder="Employee comment" value={employeeComment} onChange={(e) => setEmployeeComment(e.target.value)} className="min-h-28 w-full rounded-md border px-3 py-2" />
        <Button disabled={!goalId || mutation.isPending}>Submit Check-in</Button>
      </form>
    </Card>
  );
}
