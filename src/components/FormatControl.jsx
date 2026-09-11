import { useId, useState } from "react";
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
  collapsible = false,
  className = "",
}) {
  const controlId = useId();
  const [collapsed, setCollapsed] = useState(false);

  const activeType = getFormatType(view.typeId) ?? getFormatType("regular");
  const activeCategory =
    activeType.categories?.find(
      (category) => category.id === view.categoryId,
    ) ?? activeType.categories?.[0];
  const activeItems = activeType.items ?? activeCategory?.items ?? [];
  const optionsId = `${controlId}-options`;
  const contentId = `${controlId}-content`;

  return (
    <section
      className={`format-control format-control-hierarchy ${className}`.trim()}
      aria-labelledby={`${controlId}-label`}
    >
      {collapsible ? (
        <button
          type="button"
          id={`${controlId}-label`}
          className="format-control-toggle"
          aria-expanded={!collapsed}
          aria-controls={contentId}
          onClick={() => setCollapsed((value) => !value)}
        >
          <span>ФОРМАТ</span>
          <i aria-hidden="true">⌄</i>
        </button>
      ) : (
        <span id={`${controlId}-label`} className="format-control-label">
          ФОРМАТ
        </span>
      )}
      {!collapsed && (
        <div id={contentId} className="format-control-content">
          <div
            className="format-type-switch"
            role="group"
            aria-label="Тип формата"
          >
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
                  data-format-preset={item.preset}
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
        </div>
      )}
    </section>
  );
}
