import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SessionWithDetails, type CreateSession } from "@/lib/tauri-api";
import { toast } from "sonner";

export function useSessions() {
  return useQuery<SessionWithDetails[]>({
    queryKey: ["sessions"],
    queryFn: () => api.sessions.list(),
  });
}

export function useActiveSessions() {
  return useQuery<SessionWithDetails[]>({
    queryKey: ["sessions", "active"],
    queryFn: () => api.sessions.getActive(),
  });
}

export function useSession(id: string) {
  return useQuery<SessionWithDetails>({
    queryKey: ["sessions", "detail", id],
    queryFn: () => api.sessions.get(id),
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSession) => api.sessions.start(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "active"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast.success("Session started successfully");
    },
    onError: () => {
      toast.error("Failed to start session");
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.sessions.end(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "active"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast.success("Session ended successfully");
    },
    onError: () => {
      toast.error("Failed to end session");
    },
  });
}
