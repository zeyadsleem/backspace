import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SessionWithDetails, type CreateSession } from "@/lib/tauri-api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

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
  const { language } = useI18n();

  return useMutation({
    mutationFn: (data: CreateSession) => api.sessions.start(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "active"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast.success(language === "ar" ? "تم بدء الجلسة بنجاح" : "Session started successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل بدء الجلسة: ${message}` : `Failed to start session: ${message}`);
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  return useMutation({
    mutationFn: (id: string) => api.sessions.end(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "active"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast.success(language === "ar" ? "تم إنهاء الجلسة بنجاح" : "Session ended successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل إنهاء الجلسة: ${message}` : `Failed to end session: ${message}`);
    },
  });
}
