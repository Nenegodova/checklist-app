import { useId } from "react";
import {
  FORMAT_GROUPS,
  PRESET_LABELS,
  getCategoryCount,
  getFormatType,
  getTypeCount,
} from "../checklist-data";

const getFormatCountLabel = (count) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  const suffix =
    mod100 >= 11 && mod100 <= 14
      ? "форматов"
      : mod10 === 1
        ? "формат"
        : mod10 >= 2 && mod10 <= 4
          ? "формата"
          : "форматов";
  return `${count} ${suffix}`;
};

export default function FormatControl({
  preset,
  view,
  onViewChange,
  onSelectPreset,
  variant = "sidebar",
  className = "",
}) {
  const controlId = useId();

  // The compact native control stays in the mobile header until FormatModal is
  // introduced in stage D. It already uses the new explicit selection API.
  if (variant === "header") {
    return (
      <label className={`format-control ${className}`.trim()}>
        <span className="format-control-label">ФОРМАТ</span>
        <select
          aria-label="Формат"
          value={preset}
          onChange={(event) =>
            onSelectPreset(event.target.value, event.currentTarget, "header")
          }
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

  const activeType = getFormatType(view.typeId) ?? getFormatType("regular");
  const activeCategory =
    activeType.categories?.find(
      (category) => category.id === view.categoryId,
    ) ?? activeType.categories?.[0];
  const activeItems = activeType.items ?? activeCategory?.items ?? [];
  const optionsId = `${controlId}-options`;

  return (
    <section
      className={`format-control format-control-hierarchy ${className}`.trim()}
      aria-labelledby={`${controlId}-label`}
    >
      <span id={`${controlId}-label`} className="format-control-label">
        ФОРМАТ
      </span>
      <div className="format-type-switch" role="group" aria-label="Тип формата">
        {FORMAT_GROUPS.map((type) => {
          const count = getTypeCount(type);
          const isOpen = activeType.id === type.id;
          return (
            <button
              key={type.id}
              type="button"
              className={`format-type-button ${isOpen ? "is-open" : ""}`.trim()}
              aria-label={`Тип: ${type.label}, ${getFormatCountLabel(count)}`}
              aria-pressed={isOpen}
              onClick={() => onViewChange({ ...view, typeId: type.id })}
            >
              <span>{type.label}</span>
              <small aria-hidden="true">{count}</small>
            </button>
          );
        })}
      </div>

      {activeType.categories && (
        <div className="format-category-section">
          <span className="format-control-subheading">РУБРИКА</span>
          <div
            className="format-category-list"
            role="group"
            aria-label="Рубрики UGC"
          >
            {activeType.categories.map((category) => {
              const count = getCategoryCount(category);
              const isOpen = activeCategory?.id === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`format-category-button ${isOpen ? "is-open" : ""}`.trim()}
                  aria-label={`Рубрика ${category.label}, ${getFormatCountLabel(count)}`}
                  aria-pressed={isOpen}
                  aria-controls={optionsId}
                  onClick={() =>
                    onViewChange({ ...view, categoryId: category.id })
                  }
                >
                  <span>{category.label}</span>
                  <small aria-hidden="true">{count}</small>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        id={optionsId}
        className="format-option-list"
        role="group"
        aria-label={
          activeCategory
            ? `Форматы рубрики ${activeCategory.label}`
            : "Обычные форматы"
        }
      >
        {activeItems.map((item) => {
          const isSelected = preset === item.preset;
          return (
            <button
              key={item.preset}
              type="button"
              className={`format-option-button ${isSelected ? "is-selected" : ""}`.trim()}
              aria-label={`Формат: ${PRESET_LABELS[item.preset]}`}
              aria-pressed={isSelected}
              onClick={(event) =>
                onSelectPreset(item.preset, event.currentTarget, "sidebar")
              }
            >
              <span>{item.label}</span>
              {isSelected && (
                <span className="format-option-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
