import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(8) })
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(20) })
});

export const goalSchema = z.object({
  body: z.object({
    thrustArea: z.string().min(2),
    title: z.string().min(3),
    description: z.string().min(3),
    uomType: z.enum(["MIN", "MAX", "TIMELINE", "ZERO"]),
    uomCategory: z.string().optional(),
    targetValue: z.coerce.number().nonnegative(),
    achievementValue: z.coerce.number().nonnegative().optional(),
    weightage: z.coerce.number().min(10).max(100),
    quarter: z.string().min(2),
    deadline: z.coerce.date(),
    sharedGoalId: z.string().uuid().optional()
  })
});

export const updateGoalSchema = goalSchema.deepPartial().extend({
  params: z.object({ id: z.string().uuid() })
});

export const idParamSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const rejectSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ comment: z.string().min(2).optional() })
});

export const checkinSchema = z.object({
  body: z.object({
    goalId: z.string().uuid(),
    quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
    achievement: z.coerce.number().nonnegative(),
    employeeComment: z.string().optional(),
    managerComment: z.string().optional(),
    status: z.enum(["NOT_STARTED", "ON_TRACK", "COMPLETED"]).optional()
  })
});

export const sharedGoalSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(3),
    targetValue: z.coerce.number().nonnegative(),
    thrustArea: z.string().min(2),
    assignedEmployees: z.array(z.string().uuid()).min(1),
    weightage: z.coerce.number().min(10).max(100),
    deadline: z.coerce.date(),
    quarter: z.string().min(2)
  })
});
