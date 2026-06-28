interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Назад
      </button>
      <span>
        Страница {page} из {totalPages} · всего {total}
      </span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Вперёд →
      </button>
    </div>
  );
}
