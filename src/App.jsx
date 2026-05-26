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
    { text: "Проверить подзаголовок, слаг, редакции, теги, потоки, формат, вопрос к читателям, нож (в тюнах), мету, ог-описание, краткий заг или краткое описание" },
    { text: "Ог-заг = заголовок статьи" },
    { text: "Проверить скрытие" },
    { text: "Размер обложки, подпись к обложке в нужном месте (под обложкой/в подвале), актуальность текста, 18+ не обрезается на ОГ" },
    { text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие" },
    { text: "Проверить автора обложки или источники" },
    { text: "Иноагенты и прочие враги в подвале" }
  ],

  "Текст": [
    { text: "Проверить метку разметка, если есть доп. авторы" },
    { text: "Подпись автора с маленькой буквы" },
    { text: "Лид на месте, в конце точка" },
    { text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точказапятая кроме последней" },
    { text: "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать" },
    { text: "Внутри склеяны *&nbsp;* слова с частицами бы, же, ли..." },
    { text: "После эмодзи в загах пробел" },
    { text: "Предлог, точка, восклицательный, вопросительный знак, двоеточие в ссылках, запятые вне ссылок" },
    { text: "Точки в сервисных плашках отсутствуют" },
    { text: "Ссылки работают, без и с впн" },
    { text: "Между <nobr></nobr> нет лишних пробелов" },
    { text: "Нет пустых атрибутов" },
    { text: "Ютм метки отсутствуют" },
    { text: "У первого валютного фичера тултип" },
    { text: "У всех тултипов правильный align" },
    { text: "Тултип не стоит рядом с ссылкой" },
    { text: "Проверить списки: болды..." },
    { text: "У плашек с авторами стоит hl isbubble=true" },
    { text: "Опрос на месте, там все склеено" },
    { text: "Верная плашка редакции" },
    {
      text: "Мягкий перенос в заге",
      links: [
        { label: "Символы", url: "https://symbl.cc/ru/00AD/" },
        { label: "Правила", url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe" }
      ]
    },
    { text: "Расставить поля если нужно" },
    { text: "Проверить фичеры, баннеры, этажи" }
  ],

  "Таблицы": [
    { text: "Десктоп работает корректно" },
    { text: "Красиво отрегулированы ширины" },
    { text: "Выравнивание по левому краю..." },
    { text: "Если нужно внутри стоят <br/> и •" }
  ],

  "Картинки": [
    { text: "Сверить с доком все картинки и подписи к ним" },
    { text: "Источники под фотками заменены на © кроме инфографики..." },
    { text: "Фоторамы нужного размера" },
    { text: "Скрины чистые..." },
    { text: "Проверить необходимость bordered у видео" }
  ],

  "Прочее": [
    {
      text: "Методички общие",
      links: [
        {
          label: "Методички общие",
          url: "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994"
        }
      ]
    },
    { text: "Проверить метку в кайтене об обновлении" },
    { text: "Проверить комментарии в кайтене" },
    { text: "В кайтен прикрепить ссылки на драфт и опенграф-картинку" },
    { text: "После выпуска проверить материал на главной" }
  ]
};

const buildCollapsed = (data, prev = {}) => {
  const next = {};
  Object.keys(data).forEach((cat) => {
    next[cat] = prev?.[cat] ?? true;
  });
  return next;
};

export default function App() {
  const [dark, setDark] = useState(false);
  const [preset, setPreset] = useState(() => localStorage.getItem("preset") || "default");
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem("notes") || "");
  const [notesOpen, setNotesOpen] = useState(false);

  // ⚡ стабильная база данных
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
    const version = localStorage.getItem("version");

    if (version !== DATA_VERSION) {
      localStorage.clear();
      localStorage.setItem("version", DATA_VERSION);
    }

    if (saved) return JSON.parse(saved);

    const initial = {};
    Object.keys(currentData).forEach((cat) => {
      initial[cat] = currentData[cat].map(t => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    });

    return initial;
  });

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("collapsed");
    if (saved) return JSON.parse(saved);
    return buildCollapsed(currentData);
  });

  // ⚡ быстрый rebuild без find()
  useEffect(() => {
    setTasks(prev => {
      const next = {};

      for (const cat in currentData) {
        const prevMap = new Map((prev?.[cat] || []).map(t => [t.text, t]));

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
    Object.keys(tasks).forEach(cat => {
      cleared[cat] = tasks[cat].map(t => ({ ...t, done: false }));
    });
    setTasks(cleared);
  };

  const hardReset = () => {
    localStorage.clear();
    setPreset("default");
    setNotes("");

    const initial = {};
    Object.keys(currentData).forEach(cat => {
      initial[cat] = currentData[cat].map(t => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    });

    setTasks(initial);
    setCollapsed(buildCollapsed(currentData));
  };

  const toggleCollapse = (cat) => {
    setCollapsed(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const allTasks = useMemo(() => Object.values(tasks).flat(), [tasks]);
  const doneTasks = useMemo(() => allTasks.filter(t => t.done).length, [allTasks]);
  const totalTasks = allTasks.length;
  const percent = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const textColor = dark ? "#e8e8ea" : "#111";
  const mutedColor = dark ? "#a1a1aa" : "#555";
  const card = dark ? "#18181b" : "#ffffff";
  const border = dark ? "#2a2a2e" : "#e5e7eb";
  const bg = dark ? "#0f0f10" : "#f5f5f7";
  const title = dark ? "#ffffff" : "#0a0a0a";
  const category = dark ? "#e5e7eb" : "#111827";

  const controlBase = {
    height: 34,
    padding: "6px 12px",
    borderRadius: 10,
    fontSize: 13,
    lineHeight: "20px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  };

  const btn = {
    ...controlBase,
    border: `1px solid ${border}`,
    background: dark ? "#18181b" : "#ffffff",
    color: textColor
  };

  return (
    <>
      <div
        className={dark ? "dark" : ""}
        style={{
          padding: 30,
          minHeight: "100vh",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial",
          background: bg,
          color: textColor
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* HEADER — НЕ ТРОГАЛ */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20
          }}>

            <div style={{ flex: 1, textAlign: "center" }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: title }}>
                Чек-лист проверки
              </h1>

              <div style={{ marginTop: 6, fontSize: 13, color: mutedColor }}>
                {doneTasks}/{totalTasks} ({percent}%)
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={btn} onClick={() => setDark(v => !v)}>Тема</button>

              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
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
              <button style={btn} onClick={() => setFocusMode(v => !v)}>
                {focusMode ? "Фокус: ON" : "Фокус: OFF"}
              </button>
              <button style={{ ...btn, color: "red" }} onClick={hardReset}>
                RESET
              </button>
            </div>
          </div>

          {/* LIST — 1:1 */}
          {Object.keys(tasks).map((cat) => (
            <div key={cat} style={{ marginBottom: 20 }}>

              <div
                onClick={() => toggleCollapse(cat)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  color: category
                }}
              >
                <span>{collapsed[cat] ? "▶" : "▼"}</span>
                <span>{cat}</span>

                <span style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: dark ? "#2a2a2e" : "#e5e7eb"
                }}>
                  {tasks[cat].filter(t => t.done).length}/{tasks[cat].length}
                </span>
              </div>

              {!collapsed[cat] && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tasks[cat].map((task, i) => (
                    <label
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "10px 12px",
                        border: `1px solid ${border}`,
                        background: card,
                        borderRadius: 10
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggle(cat, i)}
                      />

                      <div style={{ opacity: task.done ? 0.5 : 1 }}>
                        {task.text}

                        {task.links?.map(link => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              marginLeft: 8,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: dark ? "#27272a" : "#eef2f7"
                            }}
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* NOTES — НЕ ТРОГАЛ */}
      <div style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 999
      }}>
        {notesOpen && (
          <div style={{
            width: 320,
            marginBottom: 12,
            padding: 16,
            borderRadius: 18,
            border: `1px solid ${border}`,
            background: card
          }}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: "100%", height: 180 }}
            />
          </div>
        )}

        <button onClick={() => setNotesOpen(v => !v)}>
          ✍️
        </button>
      </div>
    </>
  );
}