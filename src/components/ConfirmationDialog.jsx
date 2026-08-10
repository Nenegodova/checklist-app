import { useEffect, useRef } from "react";
import { PRESET_LABELS } from "../checklist-data";

export default function ConfirmationDialog({ action, onCancel, onConfirm }) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!action) return undefined;
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [action]);

  if (!action) return null;

  const isPreset = action.kind === "preset";
  const title = isPreset ? "Сменить формат?" : "Сбросить чек-лист?";
  const description = isPreset
    ? `Отметки текущего формата будут сняты. Новый формат: «${PRESET_LABELS[action.value]}».`
    : "Будут сброшены формат, отметки, фильтры и заметки. Выбранная тема сохранится.";

  const keepFocusInside = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;

    const controls = [...dialogRef.current.querySelectorAll("button")].filter(
      (button) => !button.disabled,
    );
    if (!controls.length) return;

    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onCancel()
      }
    >
      <section
        className="confirm-dialog"
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        onKeyDown={keepFocusInside}
      >
        <div className="confirm-icon" aria-hidden="true">
          !
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        <div className="confirm-actions">
          <button ref={cancelRef} type="button" onClick={onCancel}>
            Отмена
          </button>
          <button className="danger-action" type="button" onClick={onConfirm}>
            {isPreset ? "Сменить формат" : "Сбросить"}
          </button>
        </div>
      </section>
    </div>
  );
}
