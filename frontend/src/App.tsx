import { useState } from "react";
import { ApiError } from "./api/client";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { FiltersBar } from "./components/FiltersBar";
import { Pagination } from "./components/Pagination";
import { TicketForm } from "./components/TicketForm";
import { TicketTable } from "./components/TicketTable";
import { Empty, ErrorView, Loading } from "./components/StateViews";
import { useAuth } from "./hooks/useAuth";
import { useTicketMutations, useTickets } from "./hooks/useTickets";
import type { ListParams, Priority, Status } from "./types/ticket";

const PAGE_SIZE = 10;

export default function App() {
  const [params, setParams] = useState<ListParams>({
    page: 1,
    page_size: PAGE_SIZE,
    sort_by: "created_at",
    order: "desc",
  });
  const [showLogin, setShowLogin] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { isAdmin, login, logout } = useAuth();
  const { data, isLoading, isError, error } = useTickets(params);
  const { create, changeStatus, remove } = useTicketMutations();

  const patch = (p: Partial<ListParams>) => setParams((prev) => ({ ...prev, ...p }));

  function reportError(err: unknown) {
    setActionError(err instanceof ApiError ? err.message : "Что-то пошло не так");
  }

  async function handleCreate(input: { title: string; description: string; priority: Priority }) {
    setActionError(null);
    try {
      await create.mutateAsync(input);
    } catch (err) {
      reportError(err);
      throw err;
    }
  }

  async function handleStatus(id: number, status: Status) {
    setActionError(null);
    try {
      await changeStatus.mutateAsync({ id, status });
    } catch (err) {
      reportError(err);
    }
  }

  async function handleDelete(id: number) {
    setActionError(null);
    try {
      await remove.mutateAsync(id);
    } catch (err) {
      reportError(err);
    }
  }

  const busyId =
    (changeStatus.isPending && changeStatus.variables?.id) ||
    (remove.isPending && remove.variables) ||
    null;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Управление заявками</h1>
        <div>
          {isAdmin ? (
            <button onClick={logout}>Выйти (админ)</button>
          ) : (
            <button onClick={() => setShowLogin(true)}>Вход для администратора</button>
          )}
        </div>
      </header>

      <div className="app__layout">
        <aside>
          <TicketForm onSubmit={handleCreate} submitting={create.isPending} />
        </aside>

        <main>
          <FiltersBar params={params} onChange={patch} />

          {actionError && <ErrorView message={actionError} />}

          {isLoading ? (
            <Loading />
          ) : isError ? (
            <ErrorView message={error instanceof Error ? error.message : "Не удалось загрузить заявки"} />
          ) : !data || data.items.length === 0 ? (
            <Empty />
          ) : (
            <>
              <TicketTable
                tickets={data.items}
                isAdmin={isAdmin}
                busyId={busyId as number | null}
                onChangeStatus={handleStatus}
                onDelete={handleDelete}
              />
              <Pagination
                page={data.page}
                pageSize={data.page_size}
                total={data.total}
                onPageChange={(page) => patch({ page })}
              />
            </>
          )}
        </main>
      </div>

      {showLogin && <AdminLoginModal onLogin={login} onClose={() => setShowLogin(false)} />}
    </div>
  );
}
