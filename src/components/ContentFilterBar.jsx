import FilterChips from "./FilterChips";

export default function ContentFilterBar({
  values,
  onToggle,
  hiddenByFilters,
  onReset,
}) {
  return (
    <section className="sidebar-filters" aria-label="Фильтры контента">
      <h2>Что есть в материале</h2>
      <FilterChips values={values} onToggle={onToggle} />
      <div className="sidebar-filter-summary">
        <output data-testid="desktop-hidden-by-filters">
          Скрыто: {hiddenByFilters}
        </output>
        <button type="button" onClick={onReset}>
          Включить все
        </button>
      </div>
    </section>
  );
}
