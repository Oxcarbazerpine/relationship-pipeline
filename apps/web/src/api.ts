import type { AdvisorKind, Connection, ConnectionInput, DecisionInput, DecisionResult, NextAction } from "./types";

const devHeaders: HeadersInit = {
  "X-Dev-User-Id": "web-demo",
  "X-Dev-Email": "web-demo@example.com"
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...devHeaders,
      ...init.headers
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  listConnections: () => request<Connection[]>("/connections"),
  createConnection: (input: ConnectionInput) =>
    request<Connection>("/connections", { method: "POST", body: JSON.stringify(input) }),
  updateConnection: (id: string, input: ConnectionInput) =>
    request<Connection>(`/connections/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteConnection: (id: string) =>
    request<void>(`/connections/${id}`, { method: "DELETE" }),
  setOverride: (id: string, overrideAction: NextAction | null, overrideReason?: string | null) =>
    request<Connection>(`/connections/${id}/override`, {
      method: "PATCH",
      body: JSON.stringify({ overrideAction, overrideReason })
    }),
  decide: (input: DecisionInput) =>
    request<DecisionResult>("/decide", { method: "POST", body: JSON.stringify(input) }),
  testAdvisor: async (kind: AdvisorKind): Promise<{ ok: boolean; kind: AdvisorKind; error?: string }> => {
    try {
      const response = await fetch("/api/advisor/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...devHeaders },
        body: JSON.stringify({ kind })
      });
      return await response.json();
    } catch (e) {
      return { ok: false, kind, error: (e as Error).message };
    }
  }
};
