import {
  ALLOWED_NEXT,
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUSES,
  type Status,
  type Ticket,
} from "../types/ticket";

interface Props {
  tickets: Ticket[];
  isAdmin: boolean;
  busyId: number | null;
  onChangeStatus: (id: number, status: Status) => void;
  onDelete: (id: number) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU");
}

export function TicketTable({ tickets, isAdmin, busyId, onChangeStatus, onDelete }: Props) {
  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Приоритет</th>
          <th>Статус</th>
          <th>Создана</th>
          {isAdmin && <th>Действия</th>}
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => {
          const locked = t.status === "done";
          const options = ALLOWED_NEXT[t.status] ?? STATUSES;
          return (
            <tr key={t.id} className={locked ? "row--done" : ""}>
              <td>{t.id}</td>
              <td>
                <div className="cell-title">{t.title}</div>
                {t.description && <div className="cell-desc">{t.description}</div>}
              </td>
              <td>
                <span className={`badge badge--prio-${t.priority}`}>
                  {PRIORITY_LABELS[t.priority]}
                </span>
              </td>
              <td>
                <select
                  className={`badge badge--status-${t.status}`}
                  value={t.status}
                  disabled={locked || busyId === t.id}
                  title={locked ? "Завершённые заявки заблокированы" : "Изменить статус"}
                  onChange={(e) => onChangeStatus(t.id, e.target.value as Status)}
                >
                  {options.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td>{formatDate(t.created_at)}</td>
              {isAdmin && (
                <td>
                  <button
                    className="btn-danger"
                    disabled={busyId === t.id}
                    onClick={() => onDelete(t.id)}
                  >
                    Удалить
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
