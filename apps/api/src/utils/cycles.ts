export type Cycle = "GOAL_SETTING" | "Q1" | "Q2" | "Q3" | "Q4" | "CLOSED";

export function getActiveCycle(date = new Date()): Cycle {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 5 && day >= 1) return "GOAL_SETTING";
  if (month === 7) return "Q1";
  if (month === 10) return "Q2";
  if (month === 1) return "Q3";
  if (month === 3 || month === 4) return "Q4";
  return "CLOSED";
}

export function canCheckIn(quarter: string, date = new Date()) {
  return getActiveCycle(date) === quarter;
}
