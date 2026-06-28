export const STATUSES = ["new", "in_progress", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTickets {
  items: Ticket[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListParams {
  status?: Status | "";
  priority?: Priority | "";
  search?: string;
  sort_by?: "created_at" | "updated_at" | "priority";
  order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export const STATUS_LABELS: Record<Status, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Завершена",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

// Which target statuses are selectable from a given status (mirrors backend rules).
export const ALLOWED_NEXT: Record<Status, Status[]> = {
  new: ["new", "in_progress", "done"],
  in_progress: ["new", "in_progress", "done"],
  done: ["done"],
};
