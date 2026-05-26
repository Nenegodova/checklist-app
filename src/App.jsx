import { useEffect, useState, useMemo, useCallback } from "react";

const DATA_VERSION = "1.1";

const PRESETS = {
  default: {},

  invest: {
    "Админка": [
      { text: "Заполнена выдержка" },
      { text: "Заполнен тикер" }
    ]
  },

  shopping: {
    "Админка": [
      { text: "Напоминание о пересчете цен" },
      { text: "Тег noads" }
    ]
  },

  tests: {
    "Текст": [
      { text: "В мини-тестах автор и подпись стоят перед лидом" }
    ],
    "Админка": [
      { text: "В подвале больших тестов прописаны авторы и источники" },
      { text: "Тег noads" },
      { text: "В больших тестах под обложкой указан иллюстратор" }
    ],
    "Прочее": [
      {
        text: "Методичка тесты",
        links: [
          {
            label: "Методичка тесты",
            url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c"
          }
        ]
      }
    ]
  },

  compare: {
    "Админка": [{ text: "Тег noads" }]
  },

  spending: {
    "Прочее": [{ text: "Нажата кнопка из сообщества" }]
  }
};

const DATA = {
  "Админка": [
    { text: "Проверить подзаголовок, слаг, редакции, теги, потоки, формат, вопрос к читателям, нож (в тюнах), мету, ог-описание..." },
    { text: "Ог-заг = заголовок статьи" },
    { text: "Проверить скрытие" }
  ],
  "Текст": [
    { text: "Проверить метку разметка, если есть доп. авторы" },
    { text: "Подпись автора с маленькой буквы" }
  ],
  "Таблицы": [
    { text: "Десктоп работает корректно" }
  ],
  "Картинки": [
    { text: "Сверить с доком все картинки и подписи к ним" }
  ],
  "Прочее": [
    { text: "Проверить комментарии в кайтене" }
  ]
};

const buildCollapsed = (data, prev = {}) => {
  const next = {};
  for (const cat in data) {
    next[cat] = prev?.[cat] ?? true;
  }
  return next;
};

export default function App() {
  const [dark, setDark] = useState(false);

  const [preset, setPreset] = useState(() => localStorage.getItem("preset") || "default");

  const [focusMode, setFocusMode] = useState(false);

  const [notes, setNotes] = useState(() => localStorage.getItem("notes") || "");

  const [notesOpen, setNotesOpen] = useState(false);

  // ✅ stable dataset
  const currentData = useMemo(() => {
    const base = JSON.parse(JSON.stringify(DATA));
    const presetData = PRESETS[preset];

    if (!presetData) return base;

    for (const cat in presetData) {
      if (!base[cat]) base[cat] = [];
      base[cat] = base[cat].concat(presetData[cat]);
    }

    return base;
  }, [preset]);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("checklist");
    const savedVersion = localStorage.getItem("version");

    if (savedVersion !== DATA_VERSION) {
      localStorage.clear();
      localStorage.setItem("version", DATA_VERSION);
    }

    if (saved) return JSON.parse(saved);

    const initial = {};
    for (const cat in currentData) {
      initial[cat] = currentData[cat].map(t => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    }

    return initial;
  });

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("collapsed");
    if (saved) return JSON.parse(saved);
    return buildCollapsed(currentData);
  });

  // rebuild tasks FAST (Map instead of find)
  useEffect(() => {
    setTasks(prev => {
      const next = {};

      for (const cat in currentData) {
        const prevMap = new Map(
          (prev?.[cat] || []).map(t => [t.text, t])
        );

        next[cat] = currentData[cat].map(t => {
          const text = typeof t === "string" ? t : t.text;
          const links = typeof t === "string" ? [] : t.links || [];
          const old = prevMap.get(text);

          return {
            text,
            links,
            done: old?.done ?? false
          };
        });
      }

      return next;
    });

    setCollapsed(prev => buildCollapsed(currentData, prev));
  }, [currentData]);

  useEffect(() => {
    localStorage.setItem("checklist", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem("preset", preset);
  }, [preset]);

  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  // ⚡ memo progress
  const { doneTasks, totalTasks, percent } = useMemo(() => {
    const all = Object.values(tasks).flat();
    const done = all.filter(t => t.done).length;

    return {
      doneTasks: done,
      totalTasks: all.length,
      percent: all.length ? Math.round((done / all.length) * 100) : 0
    };
  }, [tasks]);

  // ⚡ stable toggle
  const toggle = useCallback((cat, index) => {
    setTasks(prev => {
      const updated = prev[cat].map((t, i) =>
        i === index ? { ...t, done: !t.done } : t
      );

      if (updated.every(t => t.done)) {
        setCollapsed(p => ({ ...p, [cat]: true }));
      }

      return { ...prev, [cat]: updated };
    });
  }, []);

  const resetAll = () => {
    const cleared = {};
    for (const cat in tasks) {
      cleared[cat] = tasks[cat].map(t => ({ ...t, done: false }));
    }
    setTasks(cleared);
  };

  const hardReset = () => {
    localStorage.clear();
    setPreset("default");
    setNotes("");

    const initial = {};
    for (const cat in currentData) {
      initial[cat] = currentData[cat].map(t => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    }

    setTasks(initial);
    setCollapsed(buildCollapsed(currentData));
  };

  const toggleCollapse = (cat) => {
    setCollapsed(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const textColor = dark ? "#e8e8ea" : "#111";
  const mutedColor = dark ? "#a1a1aa" : "#555";
  const card = dark ? "#18181b" : "#fff";
  const border = dark ? "#2a2a2e" : "#e5e7eb";
  const bg = dark ? "#0f0f10" : "#f5f5f7";
  const title = dark ? "#fff" : "#000";
  const category = dark ? "#e5e7eb" : "#111827";

  const btn = {
    padding: "6px 12px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: dark ? "#18181b" : "#fff",
    color: textColor,
    cursor: "pointer"
  };

  return (
    <>
      <div style={{ padding: 30, background: bg, color: textColor }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* HEADER (UNCHANGED UI) */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1>Чек-лист проверки</h1>
              <div>{doneTasks}/{totalTasks} ({percent}%)</div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={btn} onClick={() => setDark(v => !v)}>Тема</button>

              <select
                value={preset}
                onChange={e => setPreset(e.target.value)}
                style={btn}
              >
                <option value="default">Обычный</option>
                <option value="invest">Инвест</option>
                <option value="shopping">Шопинг</option>
                <option value="tests">Тест</option>
                <option value="compare">Сравнятор</option>
                <option value="spending">Дневник трат</option>
              </select>

              <button style={btn} onClick={resetAll}>Сброс</button>
              <button style={btn} onClick={() => setFocusMode(v => !v)}>Фокус</button>
              <button style={{ ...btn, color: "red" }} onClick={hardReset}>RESET</button>
            </div>
          </div>

          {/* LIST */}
          {Object.keys(tasks).map(cat => (
            <div key={cat}>
              <div onClick={() => toggleCollapse(cat)}>
                {cat} {tasks[cat].filter(t => t.done).length}/{tasks[cat].length}
              </div>

              {!collapsed[cat] && (
                <div>
                  {tasks[cat].map((task, i) => (
                    <label key={i}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggle(cat, i)}
                      />
                      {task.text}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </>
  );
}