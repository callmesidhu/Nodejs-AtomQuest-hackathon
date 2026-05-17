import type { Goal } from "../types/domain";

export function validateGoalSheet(goals: Pick<Goal, "weightage">[]) {
  if (goals.length > 8) return "Maximum 8 goals are allowed";
  if (goals.some((goal) => Number(goal.weightage) < 10)) return "Each goal must carry at least 10% weightage";
  const total = goals.reduce((sum, goal) => sum + Number(goal.weightage), 0);
  if (Math.abs(total - 100) > 0.001) return `Total weightage must be exactly 100%. Current total is ${total}%`;
  return null;
}
