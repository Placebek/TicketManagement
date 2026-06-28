import { apiFetch } from "./client";
import type {
  ListParams,
  PaginatedTickets,
  Priority,
  Status,
  Ticket,
} from "../types/ticket";

function buildQuery(params: ListParams): string {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.priority) q.set("priority", params.priority);
  if (params.search) q.set("search", params.search);
  if (params.sort_by) q.set("sort_by", params.sort_by);
  if (params.order) q.set("order", params.order);
  q.set("page", String(params.page ?? 1));
  q.set("page_size", String(params.page_size ?? 10));
  return q.toString();
}

export function listTickets(params: ListParams): Promise<PaginatedTickets> {
  return apiFetch<PaginatedTickets>(`/tickets?${buildQuery(params)}`);
}

export function createTicket(input: {
  title: string;
  description: string;
  priority: Priority;
}): Promise<Ticket> {
  return apiFetch<Ticket>("/tickets", { method: "POST", body: JSON.stringify(input) });
}

export function updateTicket(
  id: number,
  input: { title?: string; description?: string; priority?: Priority }
): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function updateStatus(id: number, status: Status): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteTicket(id: number): Promise<void> {
  return apiFetch<void>(`/tickets/${id}`, { method: "DELETE" });
}
