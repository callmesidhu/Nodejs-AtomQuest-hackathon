import type { UomType } from "@prisma/client";

type Args = {
  uomType: UomType;
  targetValue: number;
  achievementValue: number;
  deadline?: Date;
  completionDate?: Date;
};

export function calculateProgressScore(args: Args) {
  const { uomType, targetValue, achievementValue, deadline, completionDate } = args;
  if (targetValue <= 0 && uomType !== "ZERO") return 0;

  if (uomType === "MIN") return clamp((achievementValue / targetValue) * 100);
  if (uomType === "MAX") return achievementValue <= 0 ? 100 : clamp((targetValue / achievementValue) * 100);
  if (uomType === "ZERO") return achievementValue === 0 ? 100 : 0;

  if (!deadline || !completionDate) return 0;
  if (completionDate.getTime() <= deadline.getTime()) return 100;

  const delayDays = Math.ceil((completionDate.getTime() - deadline.getTime()) / 86_400_000);
  return clamp(100 - delayDays * 5);
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}
