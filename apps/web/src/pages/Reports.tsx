import { Download } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";

async function download(format: "csv" | "xlsx") {
  const response = await api.get(`/reports/export?format=${format}`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `goalsync-report.${format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Reports() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <h2 className="text-xl font-bold">Planned vs Achievement</h2>
        <p className="mt-2 text-sm text-slate-600">Export target, achievement, progress, approval state, and owner details for HR review cycles.</p>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => download("csv")}><Download size={16} /> CSV</Button>
          <Button variant="secondary" onClick={() => download("xlsx")}><Download size={16} /> Excel</Button>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Completion Tracking</h2>
        <p className="mt-2 text-sm text-slate-600">The dashboard charts summarize completion, approval, and check-in readiness in real time.</p>
      </Card>
    </div>
  );
}
