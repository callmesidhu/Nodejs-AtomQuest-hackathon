import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";

type Log = { id: string; entityType: string; entityId: string; action: string; changedBy: string; timestamp: string };

export function AuditLogs() {
  const { data: logs = [] } = useQuery({ queryKey: ["audit"], queryFn: async () => (await api.get<Log[]>("/audit-logs")).data });

  return (
    <Card>
      <h2 className="text-xl font-bold">Audit Logs</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr><th className="p-3">Time</th><th>Entity</th><th>Action</th><th>Changed By</th><th>Entity ID</th></tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.entityType}</td>
                <td className="font-semibold text-brand">{log.action}</td>
                <td>{log.changedBy}</td>
                <td className="font-mono text-xs">{log.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
