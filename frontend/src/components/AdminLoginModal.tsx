import { useState } from "react";

interface Props {
  onLogin: (username: string, password: string) => Promise<void>;
  onClose: () => void;
}

export function AdminLoginModal({ onLogin, onClose }: Props) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(username, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Вход для администратора</h2>
        <input
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="state state--error">{error}</div>}
        <div className="modal__actions">
          <button type="button" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Вход…" : "Войти"}
          </button>
        </div>
      </form>
    </div>
  );
}
