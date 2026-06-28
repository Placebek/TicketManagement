import { useState } from "react";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "../types/ticket";

interface Props {
  onSubmit: (input: { title: string; description: string; priority: Priority }) => Promise<void>;
  submitting: boolean;
  error?: string | null;
}

export function TicketForm({ onSubmit, submitting, error }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const canSubmit = title.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit({ title: title.trim(), description: description.trim(), priority });
    setTitle("");
    setDescription("");
    setPriority("medium");
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <h2>Новая заявка</h2>
      <input
        placeholder="Название *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
      />
      <textarea
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <div className="ticket-form__row">
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!canSubmit}>
          {submitting ? "Создание…" : "Создать"}
        </button>
      </div>
      {error && <div className="state state--error">{error}</div>}
    </form>
  );
}
