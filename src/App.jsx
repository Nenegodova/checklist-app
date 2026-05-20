import { useEffect, useState } from "react";

const DATA_VERSION = "1.0";

const LINKS = {
  "Методички":
    "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994"
};

const DATA = {
  "Админка": [
    "Проверить подзаголовок, слаг, редакции, теги, потоки, формат, вопрос к читателям, нож (в тюнах), мету, ог⁠-⁠описание, краткий заг или краткое описание",
    "Ог⁠-⁠заг = заголовок статьи",
    "Проверить скрытие",
    "Размер обложки, подпись к обложке в нужном месте (под облогой/в подвале), актуальность текста, 18+ не обрезается на ОГ",
    "В вопросе в комментах стоит двоеточие",
    "Проверить автора обложки или источники",
    "Иноагенты и прочие враги в подвале",
    "*В сравняторе, вещах и тестах* тег noads",
    "*В дневниках трат* нажата кнопка из сообщества",
    "*В вещах* напоминание о пересчете цен",
    "*В инвесте* заполнена выдержка и тикер"
  ],

  "Текст": [
    "Проверить метку разметка, если есть доп. авторы",
    "Подпись автора с маленькой буквы",
    "Лид на месте, в конце точка",
    "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точказапятая кроме последней",
    "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать",
    "Склейки в тексте",
    "После эмодзи в загах пробел",
    "Предлог, точка, восклицательный, вопросительный знак, двоеточие в ссылках, запятые вне ссылок",
    "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с запятой в жире/марке",
    "Точки *в сервисных плашках* отсутствуют",
    "Ссылки работают, без и с впн",
    "В нобр нет лишних пробелов",
    "Нет пустых атрибутов",
    "Ютм метки отсутствуют",
    "У первого валютного фичера тултип",
    "У всех тултипов правильный align",
    "Тултип не стоит рядом с ссылкой",
    "Проверить списки: болды с точказапятыми с маленькой буквы, цифры с большой буквы и точки в конце",
    "У плашек с авторами стоит hl isbuble=true",
    "Опрос на месте, там все склеено",
    "Мягкий перенос в заге",
    "Верная плашка редакции",
    "Расставить поля если нужно",
    "Проверить фичеры, баннеры, этажи"
  ],

  "Таблицы": [
    "Десктоп работает корректно",
    "Мобильная работает корректно",
    "Красиво отрегулированы ширины",
    "Внутри склеено все что нужно",
    "Если нужно внутри стоят <br/>"
  ],

  "Фотки": [
    "Сверить с доком все картинки и подписи к ним",
    "Источники под фотками заменены на (с) кроме инфографики и стоит точка перед знаком",
    "Фоторамы нужного размера",
    "Скрины чистые, без артефактов, правильного размера, где нужно стоит bordered, соблюдены отступы",
    "Проверить bordered у видео"
  ],

  "Прочее": [
    "Методички",
    "Проверить комментарии на полях",
    "Проверить метку в кайтене об обновлении",
    "Проверить комментарии в кайтене",
    "В кайтен прикрепить ссылки на драфт и опенграф-картинку",
    "После выпуска проверить материал на главной",
    "*В сравняторе* после перевыпуска обновления прожать кнопку в чек⁠-⁠листе в кайтене"
  ]
};

export default function App() {
  const [dark, setDark] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const [notes, setNotes] = useState(() => {
    return localStorage.getItem("notes") || "";
  });

  const [notesOpen, setNotesOpen] = useState(false);

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
    if (saved) return JSON.parse(saved);

    const initial = {};
    Object.keys(DATA).forEach((cat) => {
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
        i === index ? { ...t, done: !t.done } : t
      );

      if (updated.every(t => t.done)) {
        setCollapsed(prev => ({ ...prev, [cat]: true }));
      }

      return { ...prev, [cat]: updated };
    });
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
  const bg = dark ? "#0f0f10" : "#f5f5f7";
  const card = dark ? "#18181b" : "#fff";
  const border = dark ? "#2a2a2e" : "#e5e7eb";
  const title = dark ? "#fff" : "#000";
  const muted = dark ? "#a1a1aa" : "#555";

  const btn = {
    padding: "6px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13
  };

  return (
    <div style={{ padding: 30, background: bg, color: textColor, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ margin: 0 }}>Чек-лист проверки</h1>
          <div>{doneTasks}/{totalTasks} ({percent}%)</div>
        </div>

        {Object.keys(tasks).map((cat) => (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div onClick={() => toggleCollapse(cat)} style={{ cursor: "pointer", fontWeight: 600 }}>
              {collapsed[cat] ? "▶" : "▼"} {cat}
            </div>

            {!collapsed[cat] && (
              <div>
                {tasks[cat].map((task, i) => (
                  <div key={i} style={{ padding: 6 }}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggle(cat, i)}
                    />
                    <span style={{ marginLeft: 8, textDecoration: task.done ? "line-through" : "none" }}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* FLOATING NOTES BUTTON */}
        <button
          onClick={() => setNotesOpen(true)}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "#2563eb",
            color: "white",
            fontSize: 22,
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}
        >
          📝
        </button>

        {/* NOTES MODAL */}
        {notesOpen && (
          <div
            onClick={() => setNotesOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "90%",
                maxWidth: 500,
                padding: 16,
                borderRadius: 12,
                background: card
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 10 }}>
                Заметки
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Заметки по ходу проверки..."
                style={{
                  width: "100%",
                  minHeight: 200,
                  padding: 10
                }}
              />

              <button onClick={() => setNotesOpen(false)} style={{ marginTop: 10, ...btn }}>
                Закрыть
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}