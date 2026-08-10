import { useEffect, useRef, useState } from "react";
import { METHODICHKA_URL, PRESET_LABELS } from "../checklist-data";
import { getCategoryProgress } from "../lib/checklist-state";
import ConfirmationDialog from "./ConfirmationDialog";
import ContentFilterBar from "./ContentFilterBar";
import FocusToggle from "./FocusToggle";
import FormatControl from "./FormatControl";
import NotesPopover from "./NotesPopover";
import TaskSection from "./TaskSection";

export default function ChecklistWorkspace({
  dark,
  setDark,
  preset,
  switchPreset,
  tasks,
  collapsed,
  toggleCollapse,
  toggle,
  contentFilters,
  toggleFilter,
  resetFilters,
  filtersAreDefault,
  focusMode,
  setFocusMode,
  relevantTasks,
  visibleTasks,
  hiddenByFilters,
  progress,
  clearMarks,
  hardReset,
  notes,
  setNotes,
  notesOpen,
  setNotesOpen,
  notesFabRef,
  notesPopoverRef,
  notesTextareaRef,
  saveStatus,
  toast,
  dismissToast,
  undoClear,
  contextVersion,
}) {
  const [activeCategory, setActiveCategory] = useState(
    () => Object.keys(tasks)[0],
  );
  const [pendingAction, setPendingAction] = useState(null);
  const headerFormatSelectRef = useRef(null);
  const sidebarFormatSelectRef = useRef(null);
  const resetButtonRef = useRef(null);
  const actionTriggerRef = useRef(null);
  const scrollingTargetRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const previousContextVersionRef = useRef(contextVersion);
  const categories = Object.keys(tasks);
  const currentActiveCategory = categories.includes(activeCategory)
    ? activeCategory
    : categories[0];
  const completedHidden = Object.values(relevantTasks)
    .flat()
    .filter((task) => task.done).length;
  const isChecklistComplete =
    progress.total > 0 && progress.done === progress.total;
  const saveLabel =
    saveStatus === "saving"
      ? "Сохраняю…"
      : saveStatus === "error"
        ? "Не удалось сохранить"
        : "Сохранено";

  useEffect(() => {
    const categories = Object.keys(tasks);
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingTargetRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        const category = visible[0]?.target.dataset.category;
        if (category) setActiveCategory(category);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    categories.forEach((category) => {
      const section = document.getElementById(`category-${category}`);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [tasks]);

  useEffect(() => () => window.clearTimeout(scrollTimerRef.current), []);

  useEffect(() => {
    if (previousContextVersionRef.current === contextVersion) return;
    previousContextVersionRef.current = contextVersion;
    const firstCategory = Object.keys(tasks)[0];
    setActiveCategory(firstCategory);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      document
        .getElementById(`category-${firstCategory}`)
        ?.querySelector(".section-heading")
        ?.focus({ preventScroll: true });
    });
  }, [contextVersion, tasks]);

  const categoryProgress = (category) =>
    getCategoryProgress(relevantTasks, category);
  // Header and filters bar heights vary by breakpoint, preset, and chip wrapping, so a
  // fixed scroll-margin-top can't track them — measure what's actually pinned right now.
  const getStickyOffset = () => {
    const headerHeight =
      document.querySelector(".sticky-header")?.getBoundingClientRect()
        .height ?? 0;
    const filtersHeight =
      document.querySelector(".content-filters")?.getBoundingClientRect()
        .height ?? 0;
    return headerHeight + filtersHeight;
  };
  const scrollToCategory = (category) => {
    scrollingTargetRef.current = category;
    setActiveCategory(category);
    const target = document.getElementById(`category-${category}`);
    if (target) {
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        getStickyOffset() -
        12;
      window.scrollTo({ top, behavior: "smooth" });
    }
    window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      scrollingTargetRef.current = null;
      setActiveCategory(category);
    }, 550);
  };
  const getVisibleFormatSelect = () =>
    [headerFormatSelectRef.current, sidebarFormatSelectRef.current].find(
      (el) => el && el.offsetParent !== null,
    ) ?? null;
  const changePreset = (event) => {
    const nextPreset = event.target.value;
    if (nextPreset === preset) return;
    if (progress.done > 0) {
      actionTriggerRef.current = getVisibleFormatSelect();
      setPendingAction({ kind: "preset", value: nextPreset });
      return;
    }
    switchPreset(nextPreset);
  };
  const requestReset = () => {
    actionTriggerRef.current = resetButtonRef.current;
    setPendingAction({ kind: "reset" });
  };
  const cancelPendingAction = () => {
    setPendingAction(null);
    window.requestAnimationFrame(() => actionTriggerRef.current?.focus());
  };
  const confirmPendingAction = () => {
    const action = pendingAction;
    setPendingAction(null);
    if (action.kind === "preset") switchPreset(action.value);
    else hardReset();
  };
  const scrollToNextCategory = (category) => {
    const index = categories.indexOf(category);
    const nextCategory = categories[index + 1];
    if (nextCategory) scrollToCategory(nextCategory);
  };
  const hasIncompleteTasks = Object.values(relevantTasks).some(
    (categoryTasks) => categoryTasks.some((task) => !task.done),
  );
  const goToNextIncomplete = () => {
    const category = categories.find((name) =>
      relevantTasks[name].some((task) => !task.done),
    );
    if (!category) return;
    const task = relevantTasks[category].find((item) => !item.done);
    const index = tasks[category].findIndex((item) => item.id === task.id);
    scrollingTargetRef.current = category;
    setActiveCategory(category);
    if (collapsed[category]) toggleCollapse(category);
    // Expanding a collapsed section takes one render; the second frame waits until its checkbox exists.
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        const checkbox = document.getElementById(`${category}-${index}`);
        checkbox?.scrollIntoView({ behavior: "smooth", block: "center" });
        checkbox?.focus({ preventScroll: true });
        window.clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = window.setTimeout(() => {
          scrollingTargetRef.current = null;
          setActiveCategory(category);
        }, 550);
      }),
    );
  };

  return (
    <div className={`app ${dark ? "app-dark" : ""}`}>
      <div className="app-frame">
        <div className="sticky-header">
          <header className="topbar">
            <div className="brand">
              <h1>Чек-лист проверки · {PRESET_LABELS[preset]}</h1>
              <a
                className="method-link header-method-link"
                href={METHODICHKA_URL}
                target="_blank"
                rel="noreferrer"
              >
                Методички ↗
              </a>
            </div>
            <div
              className="header-progress"
              aria-label={`Общий прогресс: ${progress.done} из ${progress.total}`}
            >
              <span className="progress-number">
                {progress.done}
                <small>/ {progress.total}</small>
              </span>
              <div className="progress-track">
                <span style={{ width: `${progress.percent}%` }} />
              </div>
              <span className="progress-percent">{progress.percent}%</span>
              <small
                className={`header-save-status save-status ${saveStatus === "error" ? "is-error" : ""}`}
              >
                {saveLabel}
              </small>
            </div>
            <FormatControl
              preset={preset}
              onChange={changePreset}
              selectRef={headerFormatSelectRef}
              className="header-format-control"
            />
            <FocusToggle
              className="header-focus"
              focusMode={focusMode}
              onToggle={() => setFocusMode((value) => !value)}
              completedHidden={completedHidden}
              title="Режим фокуса"
            />
            <div className="header-actions">
              <button
                className="icon-button has-tooltip"
                data-testid="theme-toggle"
                type="button"
                aria-label={
                  dark ? "Включить светлую тему" : "Включить тёмную тему"
                }
                aria-pressed={dark}
                data-tooltip={dark ? "Светлая тема" : "Тёмная тема"}
                onClick={() => setDark((value) => !value)}
              >
                {dark ? "☀" : "◐"}
              </button>
              <button
                className="icon-button reset-button has-tooltip"
                data-testid="full-reset"
                ref={resetButtonRef}
                type="button"
                aria-label="Полный RESET"
                data-tooltip="Полный сброс"
                onClick={requestReset}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4.4 7.1A6.2 6.2 0 1 1 4 12.2" />
                  <path d="M4.4 3.8v3.7h3.7" />
                </svg>
                <span>Reset</span>
              </button>
            </div>
          </header>

          <div className="mobile-category-nav-row">
            <div className="mobile-category-nav" aria-label="Разделы чек-листа">
              {Object.keys(tasks).map((category) => {
                const item = categoryProgress(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={
                      category === currentActiveCategory ? "active" : ""
                    }
                    aria-current={
                      category === currentActiveCategory ? "true" : undefined
                    }
                    onClick={() => scrollToCategory(category)}
                  >
                    {category}{" "}
                    <span>
                      {item.done}/{item.total}
                    </span>
                  </button>
                );
              })}
            </div>
            <a
              className="method-link mobile-method-link"
              href={METHODICHKA_URL}
              target="_blank"
              rel="noreferrer"
            >
              Методички ↗
            </a>
          </div>
        </div>

        <div className="workspace">
          <aside className="sidebar">
            <FormatControl
              preset={preset}
              onChange={changePreset}
              selectRef={sidebarFormatSelectRef}
              className="sidebar-format-control"
            />
            <section
              className="sidebar-progress"
              aria-label={`Прогресс в боковой панели: ${progress.done} из ${progress.total}`}
            >
              <div className="sidebar-progress-heading">
                <span className="progress-number">
                  {progress.done}
                  <small>/ {progress.total}</small>
                </span>
                <span className="progress-percent">{progress.percent}%</span>
              </div>
              <div className="progress-track">
                <span style={{ width: `${progress.percent}%` }} />
              </div>
              <small
                className={`autosave-label save-status ${saveStatus === "error" ? "is-error" : ""}`}
              >
                {saveLabel}
              </small>
            </section>
            <nav className="section-nav" aria-label="Разделы чек-листа">
              {Object.keys(tasks).map((category) => {
                const item = categoryProgress(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={
                      category === currentActiveCategory ? "active" : ""
                    }
                    aria-current={
                      category === currentActiveCategory ? "true" : undefined
                    }
                    onClick={() => scrollToCategory(category)}
                  >
                    <span>{category}</span>
                    <small>
                      {item.done}/{item.total}
                    </small>
                  </button>
                );
              })}
            </nav>
            <button
              type="button"
              className="next-task-button sidebar-next-task"
              disabled={!hasIncompleteTasks}
              onClick={goToNextIncomplete}
            >
              Следующий невыполненный →
            </button>
            <button
              type="button"
              className="clear-button sidebar-clear-button"
              onClick={clearMarks}
            >
              Снять отметки
            </button>
            {isChecklistComplete && (
              <img
                className="sidebar-completion-treat"
                src="/cat-scuba-kicau.gif"
                alt=""
                aria-hidden="true"
              />
            )}
          </aside>

          <main className="main-content">
            <ContentFilterBar
              values={contentFilters}
              onToggle={toggleFilter}
              hiddenByFilters={hiddenByFilters}
              onReset={resetFilters}
              canReset={!filtersAreDefault}
            />
            <button
              type="button"
              className="clear-button mobile-clear-button"
              onClick={clearMarks}
            >
              Снять отметки
            </button>
            <button
              type="button"
              className="next-task-button mobile-next-task"
              disabled={!hasIncompleteTasks}
              onClick={goToNextIncomplete}
            >
              Следующий невыполненный →
            </button>
            <FocusToggle
              className="mobile-focus"
              focusMode={focusMode}
              onToggle={() => setFocusMode((value) => !value)}
              completedHidden={completedHidden}
              title="Фокус"
              compact
            />

            <div className="task-sections">
              {categories.map((category, index) => (
                <TaskSection
                  key={category}
                  category={category}
                  tasks={tasks[category]}
                  visibleTasks={visibleTasks[category]}
                  progress={categoryProgress(category)}
                  collapsed={collapsed[category]}
                  focusMode={focusMode}
                  hasNextCategory={index < categories.length - 1}
                  onToggleCollapse={toggleCollapse}
                  onToggleTask={toggle}
                  onShowAll={() => setFocusMode(false)}
                  onReset={clearMarks}
                  onNextCategory={scrollToNextCategory}
                />
              ))}
            </div>
          </main>
        </div>
      </div>

      <NotesPopover
        notes={notes}
        onChange={setNotes}
        open={notesOpen}
        onOpenChange={setNotesOpen}
        fabRef={notesFabRef}
        popoverRef={notesPopoverRef}
        textareaRef={notesTextareaRef}
        saveLabel={saveLabel}
        hasSaveError={saveStatus === "error"}
      />
      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.canUndo && (
            <button type="button" onClick={undoClear}>
              Вернуть
            </button>
          )}
          <button
            className="toast-close"
            type="button"
            aria-label="Закрыть уведомление"
            onClick={dismissToast}
          >
            ×
          </button>
        </div>
      )}
      <div className="sr-only" aria-live="polite">
        Прогресс: {progress.done} из {progress.total}. Скрыто фильтрами:{" "}
        {hiddenByFilters}. {saveLabel}.
      </div>
      <ConfirmationDialog
        action={pendingAction}
        onCancel={cancelPendingAction}
        onConfirm={confirmPendingAction}
      />
    </div>
  );
}
