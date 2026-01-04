import { useQuery } from "@tanstack/react-query";
import { api, type Resource } from "@/lib/tauri-api";

export function useResources() {
  return useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => api.resources.list(),
  });
}

export function useResource(id: string) {
  return useQuery<Resource>({
    queryKey: ["resources", "detail", id],
    queryFn: () => api.resources.get(id),
  });
}
