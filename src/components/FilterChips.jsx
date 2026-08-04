import { CONTENT_FILTERS } from "../checklist-data";

export default function FilterChips({ values, onToggle }) {
  return (
    <div className="filter-list">
      {Object.entries(CONTENT_FILTERS).map(([key, filter]) => (
        <button
          key={key}
          type="button"
          className={values[key] ? "filter-chip active" : "filter-chip"}
          aria-pressed={values[key]}
          onClick={() => onToggle(key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
