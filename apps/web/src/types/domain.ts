export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";
export type UomType = "MIN" | "MAX" | "TIMELINE" | "ZERO";
export type GoalStatus = "NOT_STARTED" | "ON_TRACK" | "COMPLETED";
export type ApprovalStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId?: string;
};

export type Goal = {
  id: string;
  employeeId: string;
  employee?: User;
  thrustArea: string;
  title: string;
  description: string;
  uomType: UomType;
  targetValue: number;
  achievementValue: number;
  weightage: number;
  progressScore: number;
  status: GoalStatus;
  approvalStatus: ApprovalStatus;
  isLocked: boolean;
  quarter: string;
  deadline: string;
  sharedGoalId?: string;
};

export type DashboardStats = {
  totalGoals: number;
  completed: number;
  completionRate: number;
  pendingApprovals: number;
  avgProgress: number;
  distribution: { name: string; value: number }[];
  byThrustArea: { name: string; progress: number }[];
};
