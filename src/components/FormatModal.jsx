import { useEffect, useRef } from "react";
import FormatControl from "./FormatControl";

export default function FormatModal({
  open,
  preset,
  view,
  onViewChange,
  onSelectPreset,
  onClose,
  focusPreset,
}) {
  const dialogRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      const option = focusPreset
        ? dialogRef.current?.querySelector(
            `[data-format-preset="${focusPreset}"]`,
          )
        : null;
      (option ?? headingRef.current)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [focusPreset, open]);

  if (!open) return null;

  const keepFocusInside = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const controls = [
      ...dialogRef.current.querySelectorAll("button:not(:disabled)"),
    ];
    if (!controls.length) return;

    const first = controls[0];
    const last = controls.at(-1);
    if (
      event.shiftKey &&
      (!controls.includes(document.activeElement) ||
        document.activeElement === first)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="format-modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        id="format-modal"
        className="format-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="format-modal-title"
        onKeyDown={keepFocusInside}
      >
        <div className="format-modal-header">
          <h2 id="format-modal-title" ref={headingRef} tabIndex="-1">
            Выбор формата
          </h2>
          <button
            className="format-modal-close"
            type="button"
            aria-label="Закрыть выбор формата"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="format-modal-content">
          <FormatControl
            preset={preset}
            view={view}
            onViewChange={onViewChange}
            onSelectPreset={(nextPreset, trigger) =>
              onSelectPreset(nextPreset, trigger, "modal")
            }
            className="format-modal-control"
          />
        </div>
      </section>
    </div>
  );
}
