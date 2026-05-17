import { Card } from "./Card";

export function Stat({ label, value, tone = "brand" }: { label: string; value: string | number; tone?: "brand" | "coral" | "ink" }) {
  const color = tone === "brand" ? "text-brand" : tone === "coral" ? "text-coral" : "text-ink";
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}
