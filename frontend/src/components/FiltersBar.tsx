import { useEffect, useState } from "react";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type ListParams,
} from "../types/ticket";

interface Props {
  params: ListParams;
  onChange: (patch: Partial<ListParams>) => void;
}

export function FiltersBar({ params, onChange }: Props) {
  // Local search state, debounced into the parent to avoid a request per keystroke.
  const [search, setSearch] = useState(params.search ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (params.search ?? "")) onChange({ search, page: 1 });
    }, 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="filters">
      <input
        className="filters__search"
        placeholder="Поиск по названию или описанию…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={params.status ?? ""}
        onChange={(e) => onChange({ status: e.target.value as ListParams["status"], page: 1 })}
      >
        <option value="">Все статусы</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={params.priority ?? ""}
        onChange={(e) => onChange({ priority: e.target.value as ListParams["priority"], page: 1 })}
      >
        <option value="">Все приоритеты</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>

      <select
        value={`${params.sort_by ?? "created_at"}:${params.order ?? "desc"}`}
        onChange={(e) => {
          const [sort_by, order] = e.target.value.split(":") as [
            ListParams["sort_by"],
            ListParams["order"],
          ];
          onChange({ sort_by, order, page: 1 });
        }}
      >
        <option value="created_at:desc">Сначала новые</option>
        <option value="created_at:asc">Сначала старые</option>
        <option value="priority:desc">Приоритет: высокий → низкий</option>
        <option value="priority:asc">Приоритет: низкий → высокий</option>
        <option value="updated_at:desc">Недавно обновлённые</option>
      </select>
    </div>
  );
}
