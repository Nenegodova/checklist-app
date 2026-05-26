import { useEffect, useState } from "react";

const DATA_VERSION = "1.1";

const PRESETS = {
  default: {},

  invest: {
    "Админка": [
      "Заполнена выдержка",
      "Заполнен тикер"
    ]
  },

  shopping: {
    "Админка": [
    "Напоминание о пересчете цен",
    "Тег noads"
    ]
  },

  tests: {
    "Текст": [
      "В мини-тестах автор и подпись стоят перед лидом"
    ],

    "Админка": [
      "В подвале больших тестов прописаны авторы и источники",
      "Тег noads",
      "В больших тестах под обложкой указан иллюстратор"
    ]
  },

  compare: {
    "Админка": [
      "Тег noads"
    ]
  },

  spending: {
    "Прочее": [
      "Нажата кнопка из сообщества"
    ]
  }
};

const DATA = {
  "Админка": [
    "Проверить подзаголовок, слаг, редакции, теги, потоки, формат, вопрос к читателям, нож (в тюнах), мету, ог⁠-⁠описание, краткий заг или краткое описание",
    "Ог⁠-⁠заг = заголовок статьи",
    "Проверить скрытие",
    "Размер обложки, подпись к обложке в нужном месте (под обложкой/в подвале), актуальность текста, 18+ не обрезается на ОГ",
    "Если в затравке отсутствует знак вопроса, то стоит двоеточие",
    "Проверить автора обложки или источники",
    "Иноагенты и прочие враги в подвале"
  ],

  "Текст": [
    "Проверить метку разметка, если есть доп. авторы",
    "Подпись автора с маленькой буквы",
    "Лид на месте, в конце точка",
    "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точказапятая кроме последней",
    "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать",
    "Внутри склеяны *&nbsp;* слова с частицами бы, же, ли, числа, которые идут после того, что считаем (минут 15, iPhone 16), аббревиатуры-дополнения (страны ЕС, ставка ЦБ)",
    "После эмодзи в загах пробел",
    "Предлог, точка, восклицательный, вопросительный знак, двоеточие в ссылках, запятые вне ссылок",
    "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с запятой в жире/марке",
    "Точки *в сервисных плашках* отсутствуют",
    "Ссылки работают, без и с впн",
    "Между <nobr></nobr> нет лишних пробелов",
    "Нет пустых атрибутов",
    "Ютм метки отсутствуют",
    "У первого валютного фичера тултип",
    "У всех тултипов правильный align",
    "Тултип не стоит рядом с ссылкой",
    "Проверить списки: болды с точказапятыми с маленькой буквы, цифры с большой буквы и точки в конце",
    "У плашек с авторами стоит hl isbuble=true",
    "Опрос на месте, там все склеено",
    "Верная плашка редакции",
    {
  text: "Мягкий перенос в заге",
  links: [
    {
      label: "Символы",
      url: "https://symbl.cc/ru/00AD/"
    },
    {
      label: "Правила",
      url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe"
    }
  ]
},
    "Расставить поля если нужно",
    "Проверить фичеры, баннеры, этажи"
  ],

  "Таблицы": [
    "Десктоп работает корректно",
    "Красиво отрегулированы ширины",
    "Выравнивание по левому краю если: числа не сравниваются между собой, а используются как обозначение или порядковый номер, в колонке есть диапазоны, в колонке смешаны разные единицы измерения, в колонке используются валютные фичеры (в том числе есть ячейки с ним, а есть без него), в части ячеек есть дополнительные слова или символы, в некоторых ячейках нет числовых значений",
    "Если нужно внутри стоят <br/> и •"
  ],

  "Картинки": [
    "Сверить с доком все картинки и подписи к ним",
    "Источники под фотками заменены на © кроме инфографики и стоит точка перед знаком",
    "Фоторамы нужного размера",
    "Скрины чистые, без артефактов, правильного размера, где нужно стоит bordered, соблюдены отступы",
    "Проверить необходимость bordered у видео"
  ],

"Прочее": [
  {
    text: "",
    links: [
      {
        label: "Методички",
        url: "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994"
      }
    ]
  },

  "Проверить метку в кайтене об обновлении",
  "Проверить комментарии в кайтене",
  "В кайтен прикрепить ссылки на драфт и опенграф-картинку",
  "После выпуска проверить материал на главной"
]
};

export default function App() {

const [dark, setDark] =
  useState(false);

const [preset, setPreset] =
  useState(() => {

    return (
      localStorage.getItem(
        "preset"
      ) || "default"

    );

  });

const [focusMode, setFocusMode] =
  useState(false);

const [notes, setNotes] =
  useState(() => {

    return (
      localStorage.getItem(
        "notes"
      ) || ""

    );

  });

const [notesOpen, setNotesOpen] =
  useState(false);


const buildData = () => {

  const result =
    JSON.parse(
      JSON.stringify(DATA)
    );

  const presetData =
    PRESETS[preset];

  if (presetData) {

    Object.keys(
      presetData
    ).forEach((category) => {

      if (!result[category]) {
        result[category] = [];
      }

      result[category] = [
        ...result[category],
        ...presetData[category]
      ];

    });

  }

  return result;
};


const [tasks, setTasks] =
  useState(() => {

    const savedVersion =
      localStorage.getItem(
        "version"
      );

    const saved =
      localStorage.getItem(
        "checklist"
      );

    if (
      savedVersion !==
      DATA_VERSION
    ) {

      localStorage.removeItem(
        "checklist"
      );

      localStorage.removeItem(
        "collapsed"
      );

      localStorage.setItem(
        "version",
        DATA_VERSION
      );

    }

    if (saved) {

      return JSON.parse(
        saved
      );

    }

    const initial = {};

    const currentData =
      buildData();

    Object.keys(
      currentData
    ).forEach((cat) => {

      initial[cat] =
        currentData[cat]
        .map((t) => ({

          text:
            typeof t ===
            "string"
              ? t
              : t.text,

          links:
            typeof t ===
            "string"
              ? []
              : t.links || [],

          done: false

        }));

    });

    return initial;

  });

  useEffect(() => {

  localStorage.setItem(
    "preset",
    preset
  );

}, [preset]);


useEffect(() => {

  const initial = {};
  const currentData = buildData();

  Object.keys(currentData).forEach((cat) => {

    initial[cat] =
      currentData[cat]
      .map((t) => ({
        text:
          typeof t === "string"
            ? t
            : t.text,

        links:
          typeof t === "string"
            ? []
            : t.links || [],

        done: false
      }));

  });

  setTasks(initial);

}, [preset]);

useEffect(() => {

  const collapsedInitial = {};

  Object.keys(
    buildData()
  ).forEach((cat) => {

    collapsedInitial[cat] = true;

  });

  setCollapsed(
    collapsedInitial
  );

}, [preset]);




 const [collapsed, setCollapsed] = useState(() => {
  const saved = localStorage.getItem("collapsed");

  if (saved) return JSON.parse(saved);

  // все категории закрыты по умолчанию
const initial = {};
Object.keys(buildData()).forEach((cat) => {
  initial[cat] = true;
});

  return initial;
});

  useEffect(() => {
    localStorage.setItem("checklist", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
  }, [collapsed]);
  useEffect(() => {
  localStorage.setItem("notes", notes);
}, [notes]);

  const toggle = (cat, index) => {
  setTasks((prev) => {

    const updated = prev[cat].map((t, i) =>
      i === index
        ? { ...t, done: !t.done }
        : t
    );

    const completed =
      updated.every(t => t.done);

    if (completed) {
      setCollapsed(prevCollapsed => ({
        ...prevCollapsed,
        [cat]: true
      }));
    }

    return {
      ...prev,
      [cat]: updated
    };
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

  localStorage.removeItem("checklist");
  localStorage.removeItem("collapsed");
  localStorage.removeItem("notes");
  localStorage.removeItem("preset");
  localStorage.removeItem("version");

  setNotes("");
  setPreset("default");

  const currentData = JSON.parse(
    JSON.stringify(DATA)
  );

  const initial = {};

  Object.keys(currentData).forEach((cat) => {

    initial[cat] =
      currentData[cat].map((t) => ({

        text:
          typeof t === "string"
            ? t
            : t.text,

        links:
          typeof t === "string"
            ? []
            : t.links || [],

        done: false

      }));

  });

  setTasks(initial);

  const collapsedInitial = {};

  Object.keys(currentData).forEach((cat) => {
    collapsedInitial[cat] = true;
  });

  setCollapsed(collapsedInitial);

};

  const toggleCollapse = (cat) => {
    setCollapsed((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const allTasks = Object.values(tasks).flat();
  const doneTasks = allTasks.filter(t => t.done).length;
  const totalTasks = allTasks.length;
  const percent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

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

  {task.links?.length > 0 && (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginTop: 8,
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
            background: dark
              ? "#27272a"
              : "#eef2f7",
            color: dark
              ? "#93c5fd"
              : "#2563eb",
            border: `1px solid ${
              dark
                ? "#3f3f46"
                : "#d1d5db"
            }`
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
  







