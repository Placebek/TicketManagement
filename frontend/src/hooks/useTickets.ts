import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTicket,
  deleteTicket,
  listTickets,
  updateStatus,
  updateTicket,
} from "../api/tickets";
import type { ListParams, Priority, Status } from "../types/ticket";

export function useTickets(params: ListParams) {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => listTickets(params),
    placeholderData: (prev) => prev, // keep previous page visible while fetching
  });
}

export function useTicketMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tickets"] });

  const create = useMutation({
    mutationFn: (input: { title: string; description: string; priority: Priority }) =>
      createTicket(input),
    onSuccess: invalidate,
  });

  const edit = useMutation({
    mutationFn: (vars: {
      id: number;
      input: { title?: string; description?: string; priority?: Priority };
    }) => updateTicket(vars.id, vars.input),
    onSuccess: invalidate,
  });

  const changeStatus = useMutation({
    mutationFn: (vars: { id: number; status: Status }) => updateStatus(vars.id, vars.status),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteTicket(id),
    onSuccess: invalidate,
  });

  return { create, edit, changeStatus, remove };
}
