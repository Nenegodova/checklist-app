import { useEffect, useState } from "react";

const DATA_VERSION = "1.0";

const LINKS = {
  "Методичка":
    "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994"
};

const DATA = {
  "Админка": [
    "Проверить подзаголовок, слаг, редакции, теги, потоки, формат, вопрос к читателям, нож (в тюнах), мету, ог⁠-⁠описание, краткий заг или краткое описание",
    "Ог⁠-⁠заг = заголовок статьи",
    "Проверить скрытие",
    "Размер обложки, подпись к обложке в нужном месте (под облогой/в подвале), актуальность текста, 18+ не обрезается на ОГ",
    "В вопросе в комментах стоит двоеточие",
    "Проверить автора обложки или источники",
    "Иноагенты и прочие враги в подвале",
    "*В сравняторе и вещах* и тестах тег noads",
    "*В дневниках трат* нажата кнопка из сообщества",
    "*В вещах* напоминание о пересчете цен",
    "*В инвесте* заполнена выдержка и тикер"
  ],

  "Текст": [
    "Проверить метку разметка, если есть доп. авторы",
    "Подпись автора с маленькой буквы",
    "Лид на месте, в конце точка",
    "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точказапятая кроме последней",
    "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать",
    "Склейки в тексте",
    "После эмодзи в загах пробел",
    "Предлог, точка, восклицательный, вопросительный знак, двоеточие в ссылках, запятые вне ссылок",
    "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с запятой в жире/марке",
    "Точка в плашке *дневников трат* отсутствует",
    "Ссылки работают, без и с впн",
    "В нобр нет лишних пробелов",
    "Нет пустых атрибутов",
    "Ютм метки отсутствуют",
    "У первого валютного фичера тултип",
    "У всех тултипов правильный align",
    "Тултип не стоит рядом с ссылкой",
    "Проверить списки: болды с точказапятыми с маленькой буквы, цифры с большой буквы и точки в конце",
    "У плашек с авторами проставлен бабл",
    "Опрос на месте, там все склеено",
    "Мягкий перенос в заге",
    "Верная плашка редакции",
    "Расставить поля если нужно",
    "Проверить фичеры и баннеры, *этажи в недвиге*"
  ],

  "Таблицы": [
    "Десктоп работает корректно",
    "Мобильная работает корректно",
    "Красиво отрегулированы ширины",
    "Внутри склеено все что нужно",
    "Если нужно внутри стоят <br/>"
  ],

  "Фотки": [
    "Сверить с доком все картинки и подписи к ним",
    "Источники под фотками заменены на (с) кроме инфографики и стоит точка перед знаком",
    "Фоторамы нужного размера",
    "Скрины чистые, без артефактов, правильного размера, где нужно стоит bordered",
    "Проверить bordered у видео"
  ],

  "Прочее": [
    "Методичка",
    "Проверить комментарии на полях",
    "Проверить метку в кайтене об обновлении",
    "Проверить комментарии в кайтене",
    "В кайтен прикрепить ссылки на драфт и опенграф-картинку",
    "После выпуска проверить материал на главной",
    "*В сравняторе* после перевыпуска обновления прожать кнопку в чек⁠-⁠листе"
  ]
};

export default function App() {
  const [dark, setDark] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const [tasks, setTasks] = useState(() => {
    const savedVersion = localStorage.getItem("version");
    const saved = localStorage.getItem("checklist");

    if (savedVersion !== DATA_VERSION) {
      localStorage.removeItem("checklist");
      localStorage.removeItem("collapsed");
      localStorage.setItem("version", DATA_VERSION);
    }

    if (saved) return JSON.parse(saved);

    const initial = {};
    Object.keys(DATA).forEach((cat) => {
      initial[cat] = DATA[cat].map((t) => ({
        text: t,
        done: false
      }));
    });

    return initial;
  });

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("collapsed");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("checklist", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const toggle = (cat, index) => {
    setTasks((prev) => ({
      ...prev,
      [cat]: prev[cat].map((t, i) =>
        i === index ? { ...t, done: !t.done } : t
      )
    }));
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
    window.location.reload();
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

  const renderTextWithLinks = (text) => {
    const regex = /(\*[^*]+\*|https?:\/\/[^\s]+)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      const clean = part.replace(/[.,!?]/g, "");

      if (LINKS[clean]) {
        return (
          <a
            key={i}
            href={LINKS[clean]}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "2px 8px",
              marginRight: 4,
              borderRadius: 8,
              background: dark ? "#2a2a2e" : "#e8e8ea",
              color: dark ? "#7ab7ff" : "#2563eb",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500
            }}
          >
            {part}
          </a>
        );
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <strong key={i} style={{ fontWeight: 700 }}>
            {part.slice(1, -1)}
          </strong>
        );
      }

      return <span key={i}>{part}</span>;
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
    gap: 6
  },

  card: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    border: `1px solid ${border}`,
    background: card,
    textAlign: "left",
    borderRadius: 12,
    transition: "all 0.15s ease"
  },

  taskText: {
    flex: 1,
    fontSize: 14,
    lineHeight: "20px",
    color: textColor,
    textDecoration: "none"
  }
};

  return (
    <div style={{
      padding: 30,
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial",
      background: bg,
      color: textColor
    }}>
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
            <button style={btn} onClick={resetAll}>Сброс</button>
            <button style={btn} onClick={() => setFocusMode(v => !v)}>
              {focusMode ? "Фокус ON" : "Фокус OFF"}
            </button>
            <button style={{ ...btn, color: "red" }} onClick={hardReset}>
              RESET
            </button>
          </div>
        </div>

        {/* LIST */}
        {Object.keys(tasks).map((cat) => (
          <div key={cat} style={{ marginBottom: 20 }}>

            <div onClick={() => toggleCollapse(cat)} style={ui.categoryTitle}>
              {collapsed[cat] ? "▶" : "▼"} {cat}
            </div>

            {!collapsed[cat] && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks[cat].map((task, i) => (
                  <label
                    key={i}
                   style={{
  ...ui.card,
  display: focusMode && task.done ? "none" : "flex"
}}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggle(cat, i)}
                    />

                    <span style={{
  ...ui.taskText,
  textDecoration: task.done ? "line-through" : "none",
  opacity: task.done ? 0.5 : 1
}}>
                      {renderTextWithLinks(task.text)}
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

const btn = {
  padding: "6px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
  fontSize: 13
};

