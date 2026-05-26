import { getApiBaseUrl } from "../../../shared/config/env";

type HealthResponse = {
  status: string;
};

export async function getHealthStatus(): Promise<string> {
  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}/api/health`, { cache: "no-store" });
    if (!res.ok) {
      return `Backend error: ${res.status}`;
    }

    const data = (await res.json()) as HealthResponse;
    return `Backend status: ${data.status}`;
  } catch {
    return "Backend unreachable";
  }
}
