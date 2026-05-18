import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useGoalMutations, useGoals } from "../hooks/useGoals";

export function Approvals() {
  const { data: goals = [] } = useGoals();
  const { approve, reject, update } = useGoalMutations();
  const pending = goals.filter((goal) => goal.approvalStatus === "SUBMITTED");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pending Manager Approvals</h2>
      {pending.map((goal) => (
        <Card key={goal.id}>
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="text-sm font-semibold text-brand">{goal.employee?.name} · {goal.thrustArea}</p>
              <h3 className="text-lg font-bold">{goal.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{goal.description}</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" defaultValue={goal.targetValue} onBlur={(e) => update.mutate({ id: goal.id, payload: { targetValue: Number(e.target.value) } })} className="rounded-md border px-3 py-2" />
                <input type="number" defaultValue={goal.weightage} onBlur={(e) => update.mutate({ id: goal.id, payload: { weightage: Number(e.target.value) } })} className="rounded-md border px-3 py-2" />
              </div>
              <div className="flex gap-2">
                <Button onClick={async () => { await approve.mutateAsync(goal.id); toast.success("Goal approved and locked"); }} className="flex-1">Approve</Button>
                <Button variant="danger" onClick={async () => { await reject.mutateAsync({ id: goal.id, comment: "Please revise goal details." }); toast.success("Goal rejected"); }} className="flex-1">Reject</Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      {!pending.length && <Card>No pending approvals.</Card>}
    </div>
  );
}
