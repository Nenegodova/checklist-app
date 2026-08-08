import { PRESET_LABELS } from "../checklist-data";

export default function FormatControl({
  preset,
  onChange,
  selectRef,
  className = "",
}) {
  return (
    <label className={`format-control ${className}`.trim()}>
      <span>ФОРМАТ</span>
      <select
        ref={selectRef}
        aria-label="Формат"
        value={preset}
        onChange={onChange}
      >
        {Object.entries(PRESET_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
