import { useEffect, useState, useMemo } from "react";

const DATA_VERSION = "1.1";

const NOTES_TEMPLATES = {
  empty: "",

  default:
`Вопросы к редакции:

—

Вопросы к выпускающему:

—

Блокеры:

—

Фоторед:

—`,

  tests:
`Проверить:

—

Замечания по тесту:

—

Блокеры:

—`,

  invest:
`Тикер:

—

Выдержка:

—

Замечания:

—`,

  shopping:
`Пересчет цен:

—

Теги:

—

Замечания:

—`,

  compare:
`Что сравнить:

—

Замечания:

—`
};

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
      { text: "Напоминание о пересчете цен" },
      { text: "Тег noads" }
    ]
  },

  tests: {
    "Текст": [
      { text: "В мини-тестах автор и подпись стоят перед лидом" }
    ],

    "Админка": [
      { text: "В подвале больших тестов прописаны авторы и источники" },
      { text: "Тег noads" },
      { text: "В больших тестах под обложкой указан иллюстратор" }
    ],

    "Прочее": [
      {
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
    "Админка": [
      { text: "Тег noads" }
    ]
  },

  spending: {
    "Админка": [
      { text: "Нажата кнопка из сообщества" }
    ]
  }
};

const DATA = {
  "Админка": [
    { text: "Проверить подзаголовок, слаг, редакции, теги, потоки, формат, вопрос к читателям, нож (в тюнах), мету, ог-описание, краткий заг или краткое описание" },
    { text: "Ог-заг = заголовок статьи" },
    { text: "Проверить скрытие" },
    { text: "Размер обложки, подпись к обложке в нужном месте (под обложкой/в подвале), актуальность текста, 18+ не обрезается на ОГ" },
    { text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие" },
    { text: "Проверить автора обложки или источники" },
    { text: "Иноагенты и прочие враги в подвале" }
  ],

  "Текст": [
    { text: "Проверить метку разметка, если есть доп. авторы" },
    { text: "Подпись автора с маленькой буквы" },
    { text: "Лид на месте, в конце точка" },
    { text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точказапятая кроме последней" },
    { text: "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать" },
    { text: "Внутри склеяны *&nbsp;* слова с частицами бы, же, ли, числа, которые идут после того, что считаем (минут 15, iPhone 16), аббревиатуры-дополнения (страны ЕС, ставка ЦБ)" },
    { text: "После эмодзи в загах пробел" },
    { text: "Предлог, точка, восклицательный, вопросительный знак, двоеточие в ссылках, запятые вне ссылок" },
    { text: "Точки в сервисных плашках отсутствуют" },
    { text: "Ссылки работают, без и с впн" },
    { text: "Между <nobr></nobr> нет лишних пробелов" },
    { text: "Нет пустых атрибутов" },
    { text: "Ютм метки отсутствуют" },
    { text: "У первого валютного фичера тултип" },
    { text: "У всех тултипов правильный align" },
    { text: "Тултип не стоит рядом с ссылкой" },
    { text: "Проверить списки: болды с точказапятыми с маленькой буквы, цифры с большой буквы и точки" },
    { text: "У плашек с авторами стоит hl isbubble=true" },
    { text: "Опрос на месте, там все склеено" },
    { text: "Верная плашка редакции" },
    {
      text: "Мягкий перенос в заге",
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
    { text: "Выравнивание по левому краю если: числа не сравниваются между собой, а используются как обозначение или порядковый номер, в колонке есть диапазоны, в колонке смешаны разные единицы измерения, в колонке используются валютные фичеры (в том числе есть ячейки с ним, а есть без него), в части ячеек есть дополнительные слова или символы, в некоторых ячейках нет числовых значений" },
    { text: "Если нужно внутри стоят <br/> и •" }
  ],

  "Картинки": [
    { text: "Сверить с доком все картинки и подписи к ним" },
    { text: "Источники под фотками заменены на © кроме инфографики" },
    { text: "Фоторамы нужного размера" },
    { text: "Скрины чистые" },
    { text: "Проверить необходимость bordered у видео" }
  ],

  "Прочее": [
    { text: "Проверить метку в кайтене об обновлении" },
    { text: "Проверить комментарии в кайтене" },
    { text: "В кайтен прикрепить ссылки на драфт и опенграф-картинку" },
    { text: "После выпуска проверить материал на главной" },
     {
      links: [
        {
          label: "Методички общие",
          url: "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994"
        }
      ]
    },
  ]
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
      text: typeof t === "string"
        ? t
        : t.text,

      links: typeof t === "string"
        ? []
        : t.links || [],

      done: false
    }));
  });

  return initial;
};

export default function App() {
  const [dark, setDark] = useState(false);

  const [preset, setPreset] = useState(() => {
    return localStorage.getItem("preset") || "default";
  });

  const [focusMode, setFocusMode] = useState(false);

const [noteTemplate, setNoteTemplate] = useState(
  () => localStorage.getItem("noteTemplate") || "empty"
);

const [notesByTemplate, setNotesByTemplate] =
useState(() => {
  const saved =
    localStorage.getItem("notesByTemplate");

  return saved
    ? JSON.parse(saved)
    : Object.fromEntries(
        Object.keys(NOTES_TEMPLATES)
          .map((key) => [
            key,
            NOTES_TEMPLATES[key]
          ])
      );
});

  const [notesOpen, setNotesOpen] = useState(false);

  const currentData = useMemo(() => {
    const result = JSON.parse(JSON.stringify(DATA));
    const presetData = PRESETS[preset];

    if (presetData) {
      Object.keys(presetData).forEach((cat) => {
        if (!result[cat]) result[cat] = [];
        result[cat] = [...result[cat], ...presetData[cat]];
      });
    }

    return result;
  }, [preset]);

const [tasks, setTasks] = useState(() => {
  const savedVersion = localStorage.getItem("version");
  const saved = localStorage.getItem("checklist");

  if (savedVersion !== DATA_VERSION) {
    localStorage.removeItem("checklist");
    localStorage.removeItem("collapsed");
    localStorage.setItem("version", DATA_VERSION);
  }

  if (saved) {
    return JSON.parse(saved);
  }

  return buildTasks(currentData);
});

const [collapsed, setCollapsed] = useState(() => {
  const saved =
    localStorage.getItem("collapsed");

  if (saved) {
    return JSON.parse(saved);
  }

  return buildCollapsed(currentData);
});
  // sync preset
  useEffect(() => {
    localStorage.setItem("preset", preset);
  }, [preset]);

  // rebuild tasks safely
  useEffect(() => {
    setTasks((prev) => {
      const next = {};

      Object.keys(currentData).forEach((cat) => {
        next[cat] = currentData[cat].map((t) => {
          const text = typeof t === "string" ? t : t.text;
          const links = typeof t === "string" ? [] : t.links || [];

          const old = prev?.[cat]?.find((x) => x.text === text);

          return {
            text,
            links,
            done: old?.done ?? false
          };
        });
      });

      return next;
    });

    setCollapsed((prev) => buildCollapsed(currentData, prev));
  }, [currentData]);

  useEffect(() => {
    localStorage.setItem("checklist", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);
useEffect(() => {
  localStorage.setItem(
    "notesByTemplate",
    JSON.stringify(notesByTemplate)
  );
}, [notesByTemplate]);

useEffect(() => {
  localStorage.setItem(
    "noteTemplate",
    noteTemplate
  );
}, [noteTemplate]);


const toggle = (cat, index) => {
  setTasks((prev) => {
    const updated = prev[cat].map((t, i) =>
      i === index
        ? { ...t, done: !t.done }
        : t
    );

    const nextTasks = {
      ...prev,
      [cat]: updated
    };

    // если категория закончилась
    if (updated.every((t) => t.done)) {

      setCollapsed((old) => {
        const next = {
          ...old,
          [cat]: true
        };

        const categories =
          Object.keys(nextTasks);

        const currentIndex =
          categories.indexOf(cat);

        for (
          let i = currentIndex + 1;
          i < categories.length;
          i++
        ) {
          const nextCat =
            categories[i];

          const hasUndone =
            nextTasks[nextCat]
              .some((t) => !t.done);

          if (hasUndone) {
            next[nextCat] = false;
            break;
          }
        }

        return next;
      });
    }

    return nextTasks;
  });
};

  const resetAll = () => {
    const cleared = {};
    Object.keys(tasks).forEach((cat) => {
      cleared[cat] = tasks[cat].map((t) => ({ ...t, done: false }));
    });
    setTasks(cleared);
  };

const hardReset = () => {
  [
    "preset",
    "notes",
    "checklist",
    "collapsed",
    "version"
  ].forEach((key) => {
    localStorage.removeItem(key);
  });

  localStorage.setItem(
    "version",
    DATA_VERSION
  );

  setPreset("default");
  setNotes("");

  const cleanData = buildTasks(DATA);

  setTasks(cleanData);
  setCollapsed(
    buildCollapsed(DATA)
  );

  setFocusMode(false);
};

  const toggleCollapse = (cat) => {
    setCollapsed((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const allTasks = Object.values(tasks ?? {}).flat();
  const doneTasks = allTasks.filter((t) => t.done).length;
  const totalTasks = allTasks.length;
  const percent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

 
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

  cursor: "pointer",
  transition: "all 0.15s ease",
  boxShadow: "none",
  outline: "none"
};

const makeControl = (dark) => ({
  ...controlBase,
  border: `1px solid ${dark ? "#2a2a2e" : "#d1d5db"}`,
  background: dark ? "#18181b" : "#ffffff",
  color: dark ? "#e8e8ea" : "#111827"
});

const btn = makeControl(dark);

 const renderTextWithLinks = (text) => {
  const regex =
    /(\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;

  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // жирный
    if (
      part.startsWith("*") &&
      part.endsWith("*")
    ) {
      return (
        <strong
          key={i}
          style={{ fontWeight: 700 }}
        >
          {part.slice(1, -1)}
        </strong>
      );
    }

    // ссылка-кнопка
    const match = part.match(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/
    );

    if (match) {
      const [, label, url] = match;

      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 8px",
            marginLeft: 6,
            borderRadius: 8,
            background: dark
              ? "#33334b"
              : "#e8e8ea",
            color: dark
              ? "#7ab7ff"
              : "#2563eb",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 500
          }}
        >
          {label}
        </a>
      );
    }

    return (
      <span key={i}>
        {part}
      </span>
    );
  });
};

const ui = {
  categoryTitle: {
    cursor: "pointer",
    marginBottom: 12,
    fontSize: 15,
    fontWeight: 600,
    color: category,
    display: "flex",
    alignItems: "center",
    gap: 16
  },

 card: {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "10px 12px",
  border: `1px solid ${border}`,
  background: card,
  textAlign: "left",
  borderRadius: 10,
  transition: "all 0.15s ease",

  boxShadow: dark
    ? "0 1px 2px rgba(0,0,0,0.3)"
    : "0 1px 2px rgba(0,0,0,0.05)"
},

 taskText: {
  flex: 1,
  fontSize: 13,
  lineHeight: "18px",
  color: textColor,
  textDecoration: "none"
}
};

  return (
  <>
  <div
    className={dark ? "dark" : ""}
    style={{
      padding: 30,
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial",
      background: bg,
      color: textColor
    }}
  >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>



        {/* HEADER FIXED */}
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
            
            
<div
  style={{
    position: "relative"
  }}
>
  <select
    value={preset}
    onChange={(e) => {
      localStorage.removeItem("checklist");
      localStorage.removeItem("collapsed");
      setPreset(e.target.value);
    }}
    style={{
      height: 34,
      minWidth: 140,
      padding: "0 36px 0 12px",

      borderRadius: 10,
      border: `1px solid ${dark ? "#2a2a2e" : "#d1d5db"}`,

      background: dark
        ? "#18181b"
        : "#ffffff",

      color: dark
        ? "#e8e8ea"
        : "#111827",

      fontSize: 13,
      cursor: "pointer",
      outline: "none",

      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none"
    }}
  >
    <option value="default">
      Обычный
    </option>

    <option value="invest">
      Инвест
    </option>

    <option value="shopping">
      Шопинг
    </option>

    <option value="tests">
      Тест
    </option>

    <option value="compare">
      Сравнятор
    </option>

    <option value="spending">
      Дневник трат
    </option>
  </select>

  <span
    style={{
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",

      pointerEvents: "none",

      fontSize: 10,
      color: dark
        ? "#a1a1aa"
        : "#666"
    }}
  >
    ▼
  </span>
</div>
            <button style={btn} onClick={resetAll}>Сброс</button>
            <button style={btn} onClick={() => setFocusMode(v => !v)}>
  {focusMode ? "Фокус: ON" : "Фокус: OFF"}
</button>
            <button style={{ ...btn, color: "red" }} onClick={hardReset}>
              RESET
            </button>
          </div>
        </div>




        {/* LIST */}
        {Object.keys(tasks).map((cat) => (
          <div key={cat} style={{ marginBottom: 20 }}>
<div
  onClick={() => toggleCollapse(cat)}
  style={{
    ...ui.categoryTitle,
    display: "flex",
    alignItems: "center",
    gap: 10
  }}
>
  <span style={{ fontSize: 16 }}>
    {collapsed[cat] ? "▶" : "▼"}
  </span>

  <span>{cat}</span>

 <span
  style={{
    fontSize: 12,
    opacity: 0.9,
    padding: "2px 8px",
    borderRadius: 999,
    background: dark ? "#2a2a2e" : "#e5e7eb",
    minWidth: 42,
    textAlign: "center"
  }}
>
  {tasks[cat].filter(t => t.done).length}/{tasks[cat].length}
  {tasks[cat].every(t => t.done) ? " ✓" : ""}
</span>
</div>




            {!collapsed[cat] && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks[cat].map((task, i) => (
                  <label
  key={i}
  className="task-card"
  style={{
    ...ui.card,
    display: focusMode && task.done ? "none" : "flex"
  }}
>
                    <input
  type="checkbox"
  checked={task.done}
  onChange={() => toggle(cat, i)}
style={{
  width: 16,
  height: 16,
  marginTop: 2,
  accentColor: dark ? "#3f3f46" : "#6b7280",
  cursor: "pointer",
  flexShrink: 0
}}
/>
<div
  style={{
    flex: 1,
    opacity: task.done ? 0.5 : 1
  }}
>
{task.text && (
  <div
    style={{
      ...ui.taskText,
      textDecoration: task.done
        ? "line-through"
        : "none"
    }}
  >
    {renderTextWithLinks(task.text)}
  </div>
)}

  {task.links?.length > 0 && (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginTop: task.text ? 8 : 0,
        flexWrap: "wrap"
      }}
    >
      {task.links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
            background: dark ? "#27272a" : "#eef2f7",
            color: dark ? "#93c5fd" : "#2563eb",
            border: `1px solid ${dark ? "#3f3f46" : "#d1d5db"}`
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  )}
</div>
                  </label>


                ))}
              </div>
            )}

          </div>
        ))}

      

            </div>
    </div>

   {/* FLOATING NOTES */}
<div
  style={{
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 999
  }}
>
  {notesOpen && (
    <div
      style={{
        width: 320,
        marginBottom: 12,
        padding: 16,
        borderRadius: 18,
        border: `1px solid ${border}`,
        background: card,
        boxShadow: dark
          ? "0 12px 40px rgba(0,0,0,0.45)"
          : "0 12px 30px rgba(0,0,0,0.12)"
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 10,
          color: title,
          fontSize: 15
        }}
      >
        Заметки
      </div>


<div
  style={{
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 12
  }}
>
  {Object.keys(NOTES_TEMPLATES).map((key) => (
    <button
      key={key}
      onClick={() => {
        setNoteTemplate(key);
        setNotes(
          NOTES_TEMPLATES[key]
        );
      }}
      style={{
        border: "none",
        cursor: "pointer",

        padding: "6px 10px",

        borderRadius: 999,

        background:
          noteTemplate === key
            ? "#6b7280"
            : dark
            ? "#27272a"
            : "#e5e7eb",

        color:
          noteTemplate === key
            ? "#fff"
            : textColor,

        fontSize: 12,

        transition:
          "all .15s ease"
      }}
    >
      {{
        empty: "Пусто",
        default: "База",
        tests: "Тест",
        invest: "Инвест",
        shopping: "Шопинг",
        compare: "Сравнятор"
      }[key]}
    </button>
  ))}
  
</div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Заметки по ходу проверки: вопросы, правки и всё, что ​не хочется потерять — можно записывать сюда, чтобы не держать в голове"
        style={{
          width: "100%",
          height: 180,
          padding: 12,
          borderRadius: 12,
          border: `1px solid ${border}`,
          background: dark ? "#111" : "#fff",
          color: textColor,
          fontSize: 14,
          lineHeight: "20px",
          resize: "none",
          outline: "none",
          boxSizing: "border-box"
        }}
      />
    </div>
  )}


  <button
    onClick={() => setNotesOpen(v => !v)}
    style={{
      width: 58,
      height: 58,
      borderRadius: "50%",
      border: "none",
      background: "#c0c0c8",
      color: "#fff",
      fontSize: 22,
      cursor: "pointer",
      boxShadow: "0 8px 24px rgba(112, 114, 118, 0.35)"
    }}
  >
    ✍️
  </button>
</div>

</>
);
}
  




