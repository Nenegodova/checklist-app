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
      <h2>Что есть в материале</h2>
      <FilterChips values={values} onToggle={onToggle} />
      <output data-testid="hidden-by-filters">
        Скрыто фильтрами: {hiddenByFilters}
      </output>
      <button
        type="button"
        data-testid="reset-filters"
        onClick={onReset}
        disabled={!canReset}
      >
        Сбросить фильтры
      </button>
    </section>
  );
}
