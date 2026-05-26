import { useEffect, useState, useMemo, useCallback } from "react";

/* ===================== CONSTANTS ===================== */

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
  compare: { "Админка": [{ text: "Тег noads" }] },
  spending: { "Прочее": [{ text: "Нажата кнопка из сообщества" }] }
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

/* ===================== HELPERS ===================== */

const buildCollapsed = (data, prev = {}) => {
  const next = {};
  Object.keys(data).forEach((cat) => {
    next[cat] = prev?.[cat] ?? true;
  });
  return next;
};

const buildData = (preset) => {
  const result = JSON.parse(JSON.stringify(DATA));
  const presetData = PRESETS[preset];

  if (presetData) {
    Object.keys(presetData).forEach((cat) => {
      if (!result[cat]) result[cat] = [];
      result[cat] = [...result[cat], ...presetData[cat]];
    });
  }

  return result;
};

/* ===================== APP ===================== */

export default function App() {
  const [dark, setDark] = useState(false);
  const [preset, setPreset] = useState(() => localStorage.getItem("preset") || "default");
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem("notes") || "");
  const [notesOpen, setNotesOpen] = useState(false);

  const currentData = useMemo(() => buildData(preset), [preset]);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("checklist");
    if (saved) return JSON.parse(saved);

    const data = buildData("default");
    const init = {};

    Object.keys(data).forEach((cat) => {
      init[cat] = data[cat].map((t) => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    });

    return init;
  });

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("collapsed");
    return saved ? JSON.parse(saved) : buildCollapsed(buildData(preset));
  });

  useEffect(() => localStorage.setItem("preset", preset), [preset]);
  useEffect(() => localStorage.setItem("checklist", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("collapsed", JSON.stringify(collapsed)), [collapsed]);
  useEffect(() => localStorage.setItem("notes", notes), [notes]);

  useEffect(() => {
    setTasks((prev) => {
      const next = {};
      Object.keys(currentData).forEach((cat) => {
        next[cat] = currentData[cat].map((t) => {
          const text = typeof t === "string" ? t : t.text;
          const links = typeof t === "string" ? [] : t.links || [];
          const old = prev?.[cat]?.find(x => x.text === text);
          return { text, links, done: old?.done ?? false };
        });
      });
      return next;
    });
  }, [preset, currentData]);

  const toggle = useCallback((cat, index) => {
    setTasks((prev) => {
      const updated = prev[cat].map((t, i) =>
        i === index ? { ...t, done: !t.done } : t
      );

      if (updated.every(t => t.done)) {
        setCollapsed((p) => ({ ...p, [cat]: true }));
      }

      return { ...prev, [cat]: updated };
    });
  }, []);

  const toggleCollapse = useCallback((cat) => {
    setCollapsed((p) => ({ ...p, [cat]: !p[cat] }));
  }, []);

  const resetAll = useCallback(() => {
    setTasks((prev) => {
      const next = {};
      Object.keys(prev).forEach((cat) => {
        next[cat] = prev[cat].map(t => ({ ...t, done: false }));
      });
      return next;
    });
  }, []);

  const allTasks = useMemo(() => Object.values(tasks).flat(), [tasks]);
  const done = allTasks.filter(t => t.done).length;
  const total = allTasks.length;

  const textColor = dark ? "#e8e8ea" : "#111";
  const bg = dark ? "#0f0f10" : "#f5f5f7";
  const card = dark ? "#18181b" : "#fff";
  const border = dark ? "#2a2a2e" : "#e5e7eb";

  return (
    <div style={{ padding: 30, minHeight: "100vh", background: bg, color: textColor }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>Чек-лист</h1>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setDark(v => !v)}>Тема</button>
            <button onClick={() => setFocusMode(v => !v)}>
              {focusMode ? "Фокус ON" : "Фокус OFF"}
            </button>
            <button onClick={resetAll}>Сброс</button>
          </div>
        </div>

        <div>{done}/{total}</div>

        {/* LIST */}
        {Object.keys(tasks).map((cat) => (
          <div key={cat} style={{ marginTop: 20 }}>
            <div onClick={() => toggleCollapse(cat)}>
              {cat}
            </div>

            {!collapsed[cat] && (
              <div>
                {tasks[cat].map((task, i) => (
                  <label
                    key={i}
                    style={{
                      display: focusMode && task.done ? "none" : "flex",
                      padding: 10,
                      border: `1px solid ${border}`,
                      background: card,
                      marginTop: 8
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggle(cat, i)}
                    />
                    <span style={{ marginLeft: 10 }}>
                      {task.text}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}