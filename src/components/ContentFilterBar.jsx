import { useState } from "react";
import FilterChips from "./FilterChips";

export default function ContentFilterBar({
  values,
  onToggle,
  hiddenByFilters,
  onReset,
  canReset,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section
      className={`content-filters ${collapsed ? "is-collapsed" : ""}`}
      aria-label="Фильтры контента"
    >
      <div className="content-filters-primary">
        <button
          type="button"
          className="content-filters-toggle"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          <h2>Что есть в материале</h2>
          <i aria-hidden="true">⌄</i>
        </button>
        {!collapsed && <FilterChips values={values} onToggle={onToggle} />}
      </div>
      <div className="content-filters-secondary">
        <button
          type="button"
          className="filters-reset-button"
          data-testid="reset-filters"
          onClick={onReset}
          disabled={!canReset}
        >
          Сбросить фильтры
        </button>
        <output data-testid="hidden-by-filters">
          Скрыто фильтрами: {hiddenByFilters}
        </output>
      </div>
    </section>
  );
}
