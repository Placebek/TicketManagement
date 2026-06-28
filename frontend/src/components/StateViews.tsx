export function Loading({ label = "Загрузка…" }: { label?: string }) {
  return <div className="state state--loading">{label}</div>;
}

export function ErrorView({ message }: { message: string }) {
  return <div className="state state--error">⚠ {message}</div>;
}

export function Empty({ label = "Заявки не найдены." }: { label?: string }) {
  return <div className="state state--empty">{label}</div>;
}
