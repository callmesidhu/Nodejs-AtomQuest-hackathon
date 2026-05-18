import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/Card";
import { Stat } from "../components/ui/Stat";
import { api } from "../services/api";
import type { DashboardStats } from "../types/domain";

const COLORS = ["#28666E", "#D95D39", "#74A57F", "#F2C14E"];

export function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: async () => (await api.get<DashboardStats>("/reports/dashboard")).data });
  if (isLoading || !data) return <div className="h-40 animate-pulse rounded-lg bg-white" />;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Total goals" value={data.totalGoals} />
        <Stat label="Average progress" value={`${data.avgProgress}%`} />
        <Stat label="Completion rate" value={`${data.completionRate}%`} />
        <Stat label="Pending approvals" value={data.pendingApprovals} tone="coral" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Goal Distribution</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.distribution} dataKey="value" nameKey="name" outerRadius={110} label>
                  {data.distribution.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Progress by Thrust Area</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={data.byThrustArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="progress" fill="#28666E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
