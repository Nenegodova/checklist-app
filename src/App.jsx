import { useEffect, useState, useMemo, useCallback } from "react";
import "./App.css";

// --- Data & Constants ---
const DATA_VERSION = "1.1";
const NOTES_TEMPLATE = `Вопросы к редакции:
—
Вопросы к выпускающему:
—
Поставить блокер:
—
Правки для фотореда/дизайнера:
—`;

const CONTENT_FILTERS = {
  tables: { label: "Таблицы", default: true },
  screenshots: { label: "Скрины", default: true },
  images: { label: "Картинки", default: true },
  poll: { label: "Опрос", default: true },
  infographic: { label: "Инфографика", default: true },
};

const buildContentFilters = () => {
  const result = {};
  Object.entries(CONTENT_FILTERS).forEach(([key, value]) => {
    result[key] = value.default;
  });
  return result;
};

const PRESETS = {
  default: {},
  invest: {
    "Админка": [{ text: "Заполнено краткое описание" }, { text: "Заполнен тикер" }],
  },
  shopping: {
    "Админка": [
      { text: "В подвале стоит: Цены действительны на момент публикации" },
      { _sortOrder: 3, text: "Тег noads" },
    ],
    "Текст": [{ text: "Список в шортах: первая строчка с большой..." }],
  },
  tests: {
    "Текст": [{ text: "В мини-тестах автор и подпись стоят перед лидом" }],
    "Админка": [{ text: "Проверить автора обложки или источники" }],
    "Прочее": [
      { links: [{ label: "Методичка тесты", url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c" }] },
    ],
  },
  cd: {
    "Админка": [{ _sortOrder: 1, text: "В классических ЧД нет подзаг" }],
    "Текст": [{ _sortOrder: 0, text: "В классических ЧД нет лида" }],
    "Выпуск": [{ text: "Если материал сверстан в старом вопросе автора..." }],
    "Прочее": [{ links: [{ label: "Методичка ЧД", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] }],
  },
  shorts: {
    "Админка": [{ _sortOrder: 2, text: "Проставлен *тег noadsshort*" }],
    "Текст": [{ _sortOrder: 4, text: "Подводка размещается в теге *p grade=\"secondary\"*..." }],
    "Прочее": [{ links: [{ label: "Методичка шорты", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] }],
  },
  ugc: {
    "Админка": [{ text: "Нажата кнопка из сообщества" }],
    "Текст": [{ _sortOrder: 2, links: [{ label: "В текст добавлена актуальная плашка сообщества", url: "https://docs.google.com/document/d/1U_YBVur4Rtjv5jEMY1Xas9Rr4TxdvenLlIBFbVxIBjg/edit?tab=t.0" }] }],
  },
};

const PRESET_EXCLUDES = {
  cd: { "Текст": ["lead", "heading-levels", "editor-badge"], "Админка": ["cover-author", "cover-type", "utm"] },
  shorts: { "Текст": ["tooltip-link", "currency-tooltip", "lists-style", "utm"] },
};

const DATA = {
  "Админка": [
    { text: "Проверить, что коллеги закрыли вкладку с визивигом" },
    { text: "Проверить формат" },
    { text: "Ог-заг = заголовок статьи, ОГ-описание на месте" },
    { text: "Перенести мету из комментария в кайтене в админку" },
    { text: "Проверить скрытие" },
    { id: "cover-type", text: "Проверить тип обложки, кредит к обложке в нужном месте (под обложкой/в подвале), наличие бирки на ОГ, текст на ОГ оттипирован (проставлены склейки)" },
    { text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие" },
    { text: "Проверить автора обложки или источники" },
    { links: [{ label: "Иноагенты и прочие враги в подвале", url: "https://tinkoffjournal.kaiten.ru/documents/d/05e4af49-d4af-433d-a183-528ac0d4da1a" }] },
    { text: "Мягкий перенос в заге", links: [{ label: "Символы", url: "https://symbl.cc/ru/00AD/" }, { label: "Правила", url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe" }] },
  ],
  "Текст": [
    { text: "Подпись автора с маленькой буквы" },
    { id: "lead", text: "Лид на месте, в конце точка" },
    { text: "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать" },
    { id: "heading-levels", text: "Везде проставлены верные уровни заголовков (*h2*, *h2 level=\"2\"*, *h3* для плашек)" },
    { text: "Проверить бирки над заголовками" },
    { text: "Заменяем невидимые пробелы на *&nbsp;*" },
    { text: "*&nbsp;* склеяны слова с частицами бы, же, ли; предлоги при, про, над, под, для, вне, обо, без" },
    { text: "Внутри *<nobr></nobr>* стоят диапазоны чисел, составные наречия, °C..." },
    { text: "После эмодзи стоит пробел" },
    { text: "Поправить типографирование: м², а не м2, 1/2, а не ½" },
    { text: "Предлог, точка, восклицательный, вопросительный знак, двоеточие в ссылках, запятые вне ссылок" },
    { text: "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с запятой в жире/марке" },
    { text: "У сервисных плашек в последнем предложении отсутствует точка" },
    { text: "Нет пустых атрибутов" },
    { id: "utm", text: "UTM метки отсутствуют" },
    { id: "currency-tooltip", text: "У первого валютного фичера тултип: Суммы в рублях пересчитываются по актуальному курсу раз в день" },
    { id: "tooltip-link", text: "Тултип не стоит рядом с ссылкой" },
    { id: "lists-style", text: "Списки с цифрами и кастомные — с большой буквы, в конце точки. Список с буллитами — с маленькой буквы, в конце точка, запятые" },
    { text: "У плашек с авторами стоит *hl isbubble=\"true\"*" },
    { text: "Опрос на месте, в нем все склеено", feature: "poll" },
    { id: "editor-badge", text: "Верная плашка редакции" },
    { text: "Расставить поля если нужно, они не должны стоять рядом с баннерами, анкетами, картинками и таблицами" },
    { text: "Проверить виджеты, фичеры, баннеры, этажи, кат" },
  ],
  "Таблицы": [
    { text: "У таблицы есть заголовок" },
    { text: "Проверить *table sticky-header=\"true\"* у таблиц с thead" },
    { text: "Красиво отрегулированы ширины" },
    { text: "Выравнивание по левому краю если..." },
    { text: "Списки: пункты лежат внутри одной ячейки..." },
    { text: "Если в таблице есть цены, то строки нужно отсортировать по убыванию цен..." },
  ],
  "Картинки": [
    { text: "Источники под фотками заменены на ©", feature: "images" },
    { text: "Скрины ретиновые и чистые... *prop=\"bordered\"*...", feature: "screenshots" },
    { text: "Проверить необходимость *prop=\"bordered\"* у видео", feature: "images" },
    { text: "Для инфографики проставлен *prop=\"bordered rounded\"*", feature: "infographic" },
    { text: "В подписе к инфографике есть Источник: ", feature: "infographic" },
    { text: "Проверить в кайтене наличие комментария от фотореда о размере картинок...", feature: "images" },
    { text: "Проверить есть ли засветы или вотермарки на картинках от фотореда", feature: "images" },
    { text: "При необходимости заблюрены все персональные данные", feature: "images" },
  ],
  "Выпуск": [
    { text: "Проверить метку разметка, если есть доп. авторы" },
    { text: "Проверить комментарии в кайтене" },
    { text: "В кайтен прикрепить ссылку на материал после выпуска и опенграф-картинку" },
    { text: "После выпуска проверить материал на главной" },
  ],
  "Прочее": [
    { text: "В ссылке шаблона гугл-дока для копирования */edit* заменен на */copy*." },
    { links: [{ label: "Методички общие", url: "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994" }] },
  ],
};

// --- Helpers ---
const readStorageJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.warn(`localStorage corrupted: ${key}`, err);
    localStorage.removeItem(key);
    return null;
  }
};

const buildCollapsed = (data, prev = {}) => {
  const next = {};
  Object.keys(data).forEach((cat) => {
    next[cat] = prev?.[cat] ?? true;
  });
  return next;
};

const buildTasks = (data) => {
  const initial = {};
  Object.keys(data).forEach((cat) => {
    initial[cat] = data[cat].map((t) => ({
      id: t.id || t.text,
      text: typeof t === "string" ? t : t.text,
      links: typeof t === "string" ? [] : t.links || [],
      feature: typeof t === "string" ? null : t.feature || null,
      done: false,
    }));
  });
  return initial;
};

function useMediaQuery(query) {
  const getMatches = () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(getMatches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// --- Component ---
export default function App() {
  const [dark, setDark] = useState(false);
  const [preset, setPreset] = useState(() => localStorage.getItem("preset") || "default");
  const [contentFilters, setContentFilters] = useState(() => readStorageJSON("contentFilters") || buildContentFilters());
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem("notes") || "");
  const [notesOpen, setNotesOpen] = useState(false);

  const currentData = useMemo(() => {
    const result = JSON.parse(JSON.stringify(DATA));
    const presetData = PRESETS[preset];

    const processCategory = (baseItems, presetItems = []) => {
      const withExplicitSort = (items, offset = 0) =>
        items.map((item, i) => ({
          ...item,
          _sortOrder: item._sortOrder !== undefined ? item._sortOrder : i + offset,
        }));

      const base = withExplicitSort(baseItems, 0);
      const preset = withExplicitSort(presetItems, 10000);
      return [...base, ...preset].sort((a, b) => (a._sortOrder ?? Infinity) - (b._sortOrder ?? Infinity));
    };

    if (presetData) {
      Object.keys(presetData).forEach((cat) => {
        if (!result[cat]) result[cat] = [];
        result[cat] = processCategory(result[cat], presetData[cat]);
      });
    } else {
      Object.keys(result).forEach((cat) => {
        result[cat] = processCategory(result[cat]);
      });
    }

    const excludes = PRESET_EXCLUDES[preset];
    if (excludes) {
      Object.entries(excludes).forEach(([cat, ids]) => {
        if (!result[cat]) return;
        result[cat] = result[cat].filter((item) => !ids.includes(item.id));
      });
    }
    return result;
  }, [preset]);

  const [tasks, setTasks] = useState(() => {
    const savedVersion = localStorage.getItem("version");
    const saved = readStorageJSON("checklist");
    if (savedVersion !== DATA_VERSION) {
      localStorage.removeItem("checklist");
      localStorage.removeItem("collapsed");
      localStorage.setItem("version", DATA_VERSION);
      return buildTasks(DATA);
    }
    return saved || buildTasks(DATA);
  });

  const [collapsed, setCollapsed] = useState(() => readStorageJSON("collapsed") || buildCollapsed(DATA));

  useEffect(() => {
    localStorage.setItem("preset", preset);
    localStorage.setItem("contentFilters", JSON.stringify(contentFilters));
    localStorage.setItem("checklist", JSON.stringify(tasks));
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
    localStorage.setItem("notes", notes);
  }, [preset, contentFilters, tasks, collapsed, notes]);

  useEffect(() => {
    setTasks((prev) => {
      const next = {};
      Object.keys(currentData).forEach((cat) => {
        next[cat] = currentData[cat].map((t) => {
          const id = typeof t === "string" ? t : t.id || t.text;
          const text = typeof t === "string" ? t : t.text;
          const links = typeof t === "string" ? [] : t.links || [];
          const feature = typeof t === "string" ? null : t.feature || null;
          const old = prev?.[cat]?.find((x) => x.id === id);
          return { id, text, links, feature, done: old?.done ?? false };
        });
      });
      return next;
    });
    setCollapsed((prev) => buildCollapsed(currentData, prev));
  }, [currentData]);

  const toggle = useCallback((cat, index) => {
    setTasks((prev) => {
      const updated = prev[cat].map((t, i) => (i === index ? { ...t, done: !t.done } : t));
      const nextTasks = { ...prev, [cat]: updated };
      if (updated.every((t) => t.done)) {
        setCollapsed((old) => {
          const next = { ...old, [cat]: true };
          const categories = Object.keys(nextTasks);
          const currentIndex = categories.indexOf(cat);
          for (let i = currentIndex + 1; i < categories.length; i++) {
            if (nextTasks[categories[i]].some((t) => !t.done)) {
              next[categories[i]] = false;
              break;
            }
          }
          return next;
        });
      }
      return nextTasks;
    });
  }, []);

  const resetAll = useCallback(() => {
    setTasks((prev) => {
      const cleared = {};
      Object.keys(prev).forEach((cat) => {
        cleared[cat] = prev[cat].map((t) => ({ ...t, done: false }));
      });
      return cleared;
    });
  }, []);

  const hardReset = useCallback(() => {
    ["preset", "notes", "checklist", "collapsed", "contentFilters", "version"].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem("version", DATA_VERSION);
    setPreset("default");
    setContentFilters(buildContentFilters());
    setNotes("");
    setFocusMode(false);
    setTasks(buildTasks(DATA));
    setCollapsed(buildCollapsed(DATA));
  }, []);

  const toggleCollapse = useCallback((cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const allTasks = Object.values(tasks ?? {}).flat();
  const doneTasks = allTasks.filter((t) => t.done).length;
  const totalTasks = allTasks.length;
  const percent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const renderTextWithLinks = (text) => {
    const regex = /(\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;
    return text.split(regex).map((part, i) => {
      if (!part) return null;
      if (part.startsWith("*") && part.endsWith("*")) {
        return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(1, -1)}</strong>;
      }
      const match = part.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      if (match) {
        const [, label, url] = match;
        return (
          <a key={i} href={url} target="_blank" rel="noreferrer" className="content-link">
            {label}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`app-root ${dark ? "dark" : ""}`}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div className="header-row">
          <div style={{ flex: "1 1 320px" }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "inherit" }}>Чек-лист проверки</h1>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted-color, #555)" }}>
              {doneTasks}/{totalTasks} ({percent}%)
            </div>
          </div>
          
          <div className="header-controls">
            <div className="btn-group" style={{ justifyContent: isMobile ? "center" : "flex-end" }}>
              <button className="btn" onClick={() => setDark((v) => !v)}>Тема</button>
              
              <div className="select-wrapper">
                <select
                  className="select-input"
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                >
                  {Object.keys(PRESETS).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span className="select-chevron">▼</span>
              </div>

              <button className="btn" onClick={resetAll}>Сброс</button>
              <button className="btn" onClick={() => setFocusMode((v) => !v)}>
                {focusMode ? "Фокус: ON" : "Фокус: OFF"}
              </button>
              <button className="btn" style={{ color: "red" }} onClick={hardReset}>RESET</button>
            </div>
            
            <div className="filters-section" style={{ alignItems: isMobile ? "center" : "flex-end" }}>
              <div className="filters-label">Контент</div>
              <div className="filters-row" style={{ justifyContent: isMobile ? "center" : "flex-end" }}>
                {Object.entries(CONTENT_FILTERS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setContentFilters((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`filter-chip ${contentFilters[key] ? "active" : ""}`}
                  >
                    {contentFilters[key] ? "✓ " : ""}{item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {Object.keys(tasks).map((cat) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div className="category-header" onClick={() => toggleCollapse(cat)}>
              <span style={{ fontSize: 16 }}>{collapsed[cat] ? "▶" : "▼"}</span>
              <span>{cat}</span>
              <span className="progress-badge">
                {tasks[cat].filter((t) => t.done).length}/{tasks[cat].length}{" "}
                {tasks[cat].every((t) => t.done) ? " ✓" : ""}
              </span>
            </div>
            
            {!collapsed[cat] && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks[cat].map((task, i) => {
                  if ((cat === "Таблицы" && !contentFilters.tables) || (task.feature && !contentFilters[task.feature])) return null;
                  return (
                    <label className="task-card" style={{ display: focusMode && task.done ? "none" : "flex" }}>
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={task.done}
                        onChange={() => toggle(cat, i)}
                      />
                      <div className={`task-content ${task.done ? "task-done" : ""}`}>
                        <div className="task-text">{renderTextWithLinks(task.text)}</div>
                        {task.links?.length > 0 && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            {task.links.map((link) => (
                              <span key={link.url} style={{ marginRight: 4 }}>
                                {renderTextWithLinks(`[${link.label}](${link.url})`)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="notes-container">
        <div className={`notes-window-wrapper ${notesOpen ? "visible" : ""}`}>
          {notesOpen && (
            <div style={{ marginBottom: 10 }}>
              <div className="notes-header">Заметки</div>
              <div className="notes-actions">
                <button
                  onClick={() => setNotes((prev) => (prev.trim() ? prev : NOTES_TEMPLATE))}
                  className="notes-btn"
                >
                  Вставить шаблон
                </button>
                <button
                  onClick={() => setNotes("")}
                  className="notes-btn notes-btn-clear"
                >
                  Очистить
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Записывайте мысли по ходу проверки..."
                className="notes-textarea"
              />
            </div>
          )}
        </div>
        <button className="notes-fab" onClick={() => setNotesOpen((v) => !v)}>
          ✍️
        </button>
      </div>
    </div>
  );
}