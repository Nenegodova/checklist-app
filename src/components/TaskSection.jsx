function ChecklistText({ text }) {
  if (!text) return null;

  // Checklist copy supports a deliberately small Markdown subset: emphasis and external links.
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("*") && part.endsWith("*")) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }
    const match = part.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (match) {
      const [, label, url] = match;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-link"
        >
          {label}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function TaskRow({ category, index, task, onToggle }) {
  const toggleFromRow = (event) => {
    if (event.target.closest("a, button, input, label")) return;
    onToggle(category, index);
  };
  const label =
    task.text ||
    task.links?.map((link) => link.label).join(", ") ||
    "Пункт чек-листа";

  return (
    <div
      className={`task-row ${task.done ? "is-done" : ""}`}
      onClick={toggleFromRow}
    >
      <label className="checkbox-control">
        <input
          id={`${category}-${index}`}
          type="checkbox"
          aria-label={label}
          checked={task.done}
          onChange={() => onToggle(category, index)}
        />
      </label>
      <div className="task-copy">
        {task.text && (
          <span>
            <ChecklistText text={task.text} />
          </span>
        )}
        {task.links?.length > 0 && (
          <span className="task-links">
            {task.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.label} ↗
              </a>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TaskSection({
  category,
  tasks,
  visibleTasks,
  progress,
  collapsed,
  focusMode,
  hasNextCategory,
  onToggleCollapse,
  onToggleTask,
  onShowAll,
  onReset,
  onNextCategory,
}) {
  const isComplete = progress.total > 0 && progress.done === progress.total;

  return (
    <section
      id={`category-${category}`}
      data-category={category}
      className={`task-section ${collapsed ? "is-collapsed" : ""}`}
    >
      <button
        className="section-heading"
        type="button"
        aria-expanded={!collapsed}
        aria-label={`Раздел ${category}`}
        onClick={() => onToggleCollapse(category)}
      >
        <span>{category}</span>
        <small>
          {progress.done}/{progress.total}
        </small>
        {isComplete && <em>Готово</em>}
        <i aria-hidden="true">⌄</i>
      </button>

      {!collapsed && (
        <div className="task-list">
          {visibleTasks.map((task) => {
            const index = tasks.findIndex((saved) => saved.id === task.id);
            return (
              <TaskRow
                key={`${category}-${task.id}`}
                category={category}
                index={index}
                task={task}
                onToggle={onToggleTask}
              />
            );
          })}
          {visibleTasks.length === 0 && (
            <div className="empty-section">
              <p>
                {focusMode && isComplete
                  ? "Все релевантные пункты выполнены"
                  : "Нет пунктов для выбранных фильтров"}
              </p>
              {focusMode && isComplete && (
                <div className="empty-actions">
                  <button type="button" onClick={onShowAll}>
                    Показать всё
                  </button>
                  <button type="button" onClick={onReset}>
                    Снять отметки
                  </button>
                </div>
              )}
            </div>
          )}
          {isComplete && !focusMode && (
            <div className="completion-banner">
              <span>
                <b>Раздел завершён</b>
                <small>Все релевантные пункты отмечены</small>
              </span>
              {hasNextCategory && (
                <button type="button" onClick={() => onNextCategory(category)}>
                  Следующий раздел →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
