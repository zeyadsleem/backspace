import { useQuery } from "@tanstack/react-query";
import { api, type SessionWithDetails } from "@/lib/tauri-api";

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
