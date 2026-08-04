import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import ChecklistWorkspace from "./components/ChecklistWorkspace";
import {
  DATA,
  DATA_VERSION,
  PRESET_LABELS,
  buildContentFilters,
  getPresetData,
} from "./checklist-data";
import {
  buildCollapsed,
  buildTasks,
  getHiddenByFiltersCount,
  getOverallProgress,
  getRelevantTasks,
  getVisibleTasks,
} from "./lib/checklist-state";
import { readStorageJSON } from "./lib/storage";

export default function App() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("dark");
      if (saved !== null) return saved === "true";
      return (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (localStorage.getItem("dark") === null) {
        setDark(e.matches);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [preset, setPreset] = useState(
    () => localStorage.getItem("preset") || "default",
  );
  const currentData = useMemo(() => getPresetData(preset), [preset]);
  const [contentFilters, setContentFilters] = useState(
    () => readStorageJSON("contentFilters") || buildContentFilters(),
  );
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotesState] = useState(
    () => localStorage.getItem("notes") || "",
  );
  const [notesOpen, setNotesOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [toast, setToast] = useState(null);
  const [undoState, setUndoState] = useState(null);
  const [contextVersion, setContextVersion] = useState(0);
  const notesFabRef = useRef(null);
  const notesTextareaRef = useRef(null);
  const notesPopoverRef = useRef(null);
  const saveTimerRef = useRef(null);

  const markSaving = useCallback(() => {
    window.clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
  }, []);

  const scheduleSaved = useCallback(() => {
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => setSaveStatus("saved"), 420);
  }, []);

  const reportSaveError = useCallback(() => {
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => setSaveStatus("error"), 0);
  }, []);

  const updateDark = useCallback(
    (updater) => {
      markSaving();
      setDark(updater);
    },
    [markSaving],
  );

  const setNotes = useCallback(
    (updater) => {
      markSaving();
      setNotesState((value) =>
        typeof updater === "function" ? updater(value) : updater,
      );
    },
    [markSaving],
  );

  useEffect(() => {
    document.documentElement.className = dark ? "dark" : "";
    try {
      const currentValue = localStorage.getItem("dark");
      if (currentValue !== String(dark))
        localStorage.setItem("dark", String(dark));
      scheduleSaved();
    } catch {
      reportSaveError();
    }
  }, [dark, reportSaveError, scheduleSaved]);
  useEffect(() => {
    try {
      localStorage.removeItem("bgImage");
    } catch {
      reportSaveError();
    }
  }, [reportSaveError]);
  useEffect(() => {
    if (!notesOpen) return undefined;
    notesTextareaRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotesOpen(false);
    };
    const closeOnOutsideClick = (event) => {
      if (
        !notesPopoverRef.current?.contains(event.target) &&
        !notesFabRef.current?.contains(event.target)
      )
        setNotesOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [notesOpen]);
  useEffect(() => {
    if (!notesOpen) notesFabRef.current?.focus();
  }, [notesOpen]);
  const [tasks, setTasks] = useState(() => {
    const savedVersion = localStorage.getItem("version");
    const saved = readStorageJSON("checklist");
    // The data version invalidates saved tasks whenever checklist content changes.
    if (savedVersion !== DATA_VERSION) {
      localStorage.removeItem("checklist");
      localStorage.removeItem("collapsed");
      localStorage.setItem("version", DATA_VERSION);
      return buildTasks(currentData);
    }
    return saved || buildTasks(currentData);
  });
  const [collapsed, setCollapsed] = useState(
    () => readStorageJSON("collapsed") || buildCollapsed(currentData),
  );
  useEffect(() => {
    try {
      localStorage.setItem("preset", preset);
      localStorage.setItem("contentFilters", JSON.stringify(contentFilters));
      localStorage.setItem("checklist", JSON.stringify(tasks));
      localStorage.setItem("collapsed", JSON.stringify(collapsed));
      localStorage.setItem("notes", notes);
      localStorage.setItem("version", DATA_VERSION);
      scheduleSaved();
    } catch {
      reportSaveError();
    }
  }, [
    collapsed,
    contentFilters,
    notes,
    preset,
    reportSaveError,
    scheduleSaved,
    tasks,
  ]);

  useEffect(() => () => window.clearTimeout(saveTimerRef.current), []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(
      () => setToast(null),
      toast.canUndo ? 8000 : 4200,
    );
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const toggle = useCallback(
    (cat, index) => {
      markSaving();
      setTasks((prev) => {
        const updated = prev[cat].map((t, i) =>
          i === index ? { ...t, done: !t.done } : t,
        );
        return { ...prev, [cat]: updated };
      });
    },
    [markSaving],
  );

  const toggleFilter = useCallback(
    (key) => {
      markSaving();
      setContentFilters((value) => ({ ...value, [key]: !value[key] }));
    },
    [markSaving],
  );

  const enableAllFilters = useCallback(() => {
    markSaving();
    setContentFilters(buildContentFilters());
  }, [markSaving]);

  const switchPreset = useCallback(
    (nextPreset) => {
      const nextData = getPresetData(nextPreset);
      markSaving();
      setPreset(nextPreset);
      setTasks(buildTasks(nextData));
      setCollapsed(buildCollapsed(nextData));
      setFocusMode(false);
      setContextVersion((value) => value + 1);
      setToast({
        message: `Формат «${PRESET_LABELS[nextPreset]}» выбран`,
        canUndo: false,
      });
    },
    [markSaving],
  );

  const resetFiltersAndCheckboxes = useCallback(() => {
    markSaving();
    setUndoState({ tasks, contentFilters });
    setContentFilters(buildContentFilters());
    setTasks(buildTasks(currentData));
    setToast({ message: "Отметки сняты, фильтры включены", canUndo: true });
  }, [contentFilters, currentData, markSaving, tasks]);

  const undoClear = useCallback(() => {
    if (!undoState) return;
    markSaving();
    setTasks(undoState.tasks);
    setContentFilters(undoState.contentFilters);
    setUndoState(null);
    setToast({ message: "Отметки и фильтры восстановлены", canUndo: false });
  }, [markSaving, undoState]);

  const hardReset = useCallback(() => {
    markSaving();
    setPreset("default");
    setContentFilters(buildContentFilters());
    setNotesState("");
    setFocusMode(false);
    setTasks(buildTasks(DATA));
    setCollapsed(buildCollapsed(DATA));
    setUndoState(null);
    setContextVersion((value) => value + 1);
    setToast({ message: "Чек-лист сброшен, тема сохранена", canUndo: false });
  }, [markSaving]);

  const toggleCollapse = useCallback(
    (cat) => {
      markSaving();
      setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
    },
    [markSaving],
  );

  const dismissToast = useCallback(() => setToast(null), []);
  const relevantTasks = useMemo(
    () => getRelevantTasks(tasks, contentFilters),
    [tasks, contentFilters],
  );
  const visibleTasks = useMemo(
    () => getVisibleTasks(relevantTasks, focusMode),
    [relevantTasks, focusMode],
  );
  const hiddenByFilters = getHiddenByFiltersCount(tasks, relevantTasks);
  const {
    done: doneTasks,
    total: totalTasks,
    percent,
  } = getOverallProgress(relevantTasks);
  return (
    <ChecklistWorkspace
      dark={dark}
      setDark={updateDark}
      preset={preset}
      switchPreset={switchPreset}
      tasks={tasks}
      collapsed={collapsed}
      toggleCollapse={toggleCollapse}
      toggle={toggle}
      contentFilters={contentFilters}
      toggleFilter={toggleFilter}
      enableAllFilters={enableAllFilters}
      focusMode={focusMode}
      setFocusMode={setFocusMode}
      relevantTasks={relevantTasks}
      visibleTasks={visibleTasks}
      hiddenByFilters={hiddenByFilters}
      progress={{ done: doneTasks, total: totalTasks, percent }}
      resetFiltersAndCheckboxes={resetFiltersAndCheckboxes}
      hardReset={hardReset}
      notes={notes}
      setNotes={setNotes}
      notesOpen={notesOpen}
      setNotesOpen={setNotesOpen}
      notesFabRef={notesFabRef}
      notesPopoverRef={notesPopoverRef}
      notesTextareaRef={notesTextareaRef}
      saveStatus={saveStatus}
      toast={toast}
      dismissToast={dismissToast}
      undoClear={undoClear}
      contextVersion={contextVersion}
    />
  );
}
