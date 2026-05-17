import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Goal } from "../types/domain";

export function useGoals() {
  return useQuery({ queryKey: ["goals"], queryFn: async () => (await api.get<Goal[]>("/goals")).data });
}

export function useGoalMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["goals"] });
  return {
    create: useMutation({ mutationFn: (payload: Partial<Goal>) => api.post("/goals", payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<Goal> }) => api.put(`/goals/${id}`, payload), onSuccess: invalidate }),
    submit: useMutation({ mutationFn: () => api.post("/goals/submit"), onSuccess: invalidate }),
    approve: useMutation({ mutationFn: (id: string) => api.post(`/approval/${id}/approve`), onSuccess: invalidate }),
    reject: useMutation({ mutationFn: ({ id, comment }: { id: string; comment?: string }) => api.post(`/approval/${id}/reject`, { comment }), onSuccess: invalidate }),
    unlock: useMutation({ mutationFn: (id: string) => api.post(`/goals/${id}/unlock`), onSuccess: invalidate })
  };
}
