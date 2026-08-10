export default function FocusToggle({
  focusMode,
  onToggle,
  completedHidden,
  title,
  compact = false,
  className = "",
}) {
  const onHint = compact
    ? `скрыто ${completedHidden} готовых`
    : `вкл · скрыто ${completedHidden} готовых`;
  const offHint = compact ? "показывать всё" : "выкл · показывать всё";
  return (
    <div className={className}>
      <button
        type="button"
        className={`focus-control ${focusMode ? "is-on" : ""}`}
        role="switch"
        aria-checked={focusMode}
        onClick={onToggle}
      >
        <span>
          <b>{title}</b>
          <small>{focusMode ? onHint : offHint}</small>
        </span>
        <i aria-hidden="true" />
      </button>
    </div>
  );
}
