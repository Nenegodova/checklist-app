import FilterChips from "./FilterChips";

export default function ContentFilterBar({
  values,
  onToggle,
  hiddenByFilters,
  onReset,
  canReset,
}) {
  return (
    <section className="content-filters" aria-label="Фильтры контента">
      <div className="content-filters-primary">
        <h2>Что есть в материале</h2>
        <FilterChips values={values} onToggle={onToggle} />
      </div>
      <div className="content-filters-secondary">
        <output data-testid="hidden-by-filters">
          Скрыто фильтрами: {hiddenByFilters}
        </output>
        <button
          type="button"
          className="filters-reset-button"
          data-testid="reset-filters"
          onClick={onReset}
          disabled={!canReset}
        >
          Сбросить фильтры
        </button>
      </div>
    </section>
  );
}
