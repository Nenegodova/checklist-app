import { NOTES_TEMPLATE } from "../checklist-data";

export default function NotesPopover({
  notes,
  onChange,
  open,
  onOpenChange,
  fabRef,
  popoverRef,
  textareaRef,
  saveLabel,
  hasSaveError,
}) {
  return (
    <div className="notes-fab-wrapper">
      {open && (
        <div
          className="notes-window"
          ref={popoverRef}
          data-testid="notes-popover"
          role="dialog"
          aria-modal="false"
          aria-labelledby="notes-title"
        >
          <div className="notes-title" id="notes-title">
            Заметки
            <button
              type="button"
              aria-label="Закрыть заметки"
              onClick={() => onOpenChange(false)}
            >
              ×
            </button>
          </div>
          <div className="notes-actions">
            <button
              type="button"
              onClick={() =>
                onChange((value) => (value.trim() ? value : NOTES_TEMPLATE))
              }
            >
              Вставить шаблон
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => onChange("")}
            >
              Очистить
            </button>
          </div>
          <textarea
            ref={textareaRef}
            aria-label="Заметки"
            value={notes}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Заметки по ходу проверки"
          />
          <small
            className={`notes-save-status save-status ${hasSaveError ? "is-error" : ""}`}
          >
            {saveLabel}
          </small>
        </div>
      )}
      <button
        className="notes-fab has-tooltip"
        type="button"
        ref={fabRef}
        aria-label="Открыть заметки"
        data-tooltip="Заметки"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 5.5h12M4 10h12M4 14.5h7" />
        </svg>
      </button>
    </div>
  );
}
