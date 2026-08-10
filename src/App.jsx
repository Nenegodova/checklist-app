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

    "Выпуск": [
      { _sortOrder: 4, text: "После выпуска прикрепить в кайтене ссылку на материал и меин-картинку" },
  
    ],
  },
  cd: {
    "Админка": [
      { _sortOrder: 0, text: "В классических ЧД нет подзага" },
      { _sortOrder: 0, text: "В подборке ЧД есть подзаг" },
      { _sortOrder: 5, text: "Обложка с эмодзи с типом мейна «мини над заголовком»" },
      { _sortOrder: 4, text: "Редакция Что делать + тематическая" },
      { _sortOrder: 4, text: "Если вопрос уже существующий, то редакции Что делать + UGC" },
      { _sortOrder: 4, text: "Если вопрос уже существующий и нет метки «Обновляем сами», то сначала снимаем его с публикации" },
      { _sortOrder: 2, text: "Нажаты кнопки из сообщества и выбор редакции" },
      { _sortOrder: 6, text: "Обязательно указываем краткое описание. В это поле дублируем текст из ог⁠-⁠описания" },
      { _sortOrder: 2, text: "Если статья 18+, бирка 18+ должна быть обязательно у ина и аута" },
      { _sortOrder: 6, text: "В реальных вопросах проверяем наличие технического_ тега noadswhattodo. В выдуманных проставляем тег вместе с другими. Если в статье присутствуют фичеры (калькуляторы, тесты), то добавляем еще один технический тег: feature⁠-⁠out. Для опросов этот тег не нужен" },
      { _sortOrder: 0, text: "В подборке ЧД основной заг начинается с о слов «Что делать, если:..»" },
      { _sortOrder: 0, text: "В подборке ЧД url статьи всегда начинается с префикса «ask⁠-»" },
      { _sortOrder: 5, text: "В классических ЧД цвет фона для обложек #2c2c2c" },
    ],
    "Текст": [
      { _sortOrder: 0, text: "В классических ЧД нет лида" },
      { _sortOrder: 1, text: "В подборке ЧД есть лид" },
      { text: "Есть автор вопроса и вопрос в плашке с isbuble=\"true\"" },
      { _sortOrder: 2, text: "Есть автор ответа" },
      { _sortOrder: 3, text: "В классических ЧД написание автора вопроса «спросил в Сообществе»/«спросила в Сообществе»" },
      { _sortOrder: 3, text: "У автора вопроса стоит additional" },
      { _sortOrder: 5, text: "Проверить бирки над заголовками в Подборках ЧД" },
      { _sortOrder: 6, text: "В подборке ЧД у каждого вопроса стоит бирка с эмодзи" },
      { text: "Если в конце статьи стоит список статей: вводное предложение выделяем болдом, для вводного предложения и списка используем шифт с p grade=\"large\"" },
      { _sortOrder: 7, text: "В микро ЧД ответ на вопрос в плашке" },
      { text: "В микро ЧД есть utm⁠-⁠метки у с сылок на внутренние статьи" },
      { _sortOrder: 8, text: "В микро ЧД автор ответа с подписью «нашел ответ»/«нашла ответ»" },
    ],
    "Выпуск": [
      { _sortOrder: 1, text: "Если материал сверстан в старом вопросе автора и нужно выпустить с новым url, то обязательно после публикации нужно настроить редирект" },
      { sortOrder: 2, text: "В случае, когда после выпуска меняется обложка, пишем в тематическом чате соответствующей редакции и чате «Т–Ж + соцсети», что поменялась обложка, прикладываем ссылку на статью и новую обложку" },
      { sortOrder: 2, text: "В подборках, после выпуска статьи с вопросами скрыты вопросы от поисковиков" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка ЧД", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
    ],
  },
  shorts: {
    "Админка": [
      { _sortOrder: 2, text: "Проставлен тег noadsshort" },
      { _sortOrder: 2, text: "Среди потоков добавлены «Шорты», но не основным потоком" },
      { _sortOrder: 2, text: "Нажата кнопка из сообщества и выбор редакции если вторая редакция UGC" },
      { _sortOrder: 3, text: "Обложка внутри статьи отсутствует" },
      { _sortOrder: 3, text: "Источник фото в подвале" },
    ],
    "Текст": [
      { _sortOrder: 4, text: "Подводка размещается в теге p grade=\"secondary\", если она слишком длинная, то часть скрывается под кат" },
      { _sortOrder: 1, text: "Оглавление стоит перед карточками-тайлами" },
      { text: "У текста внутри шортов grade=\"medium\"" },
      { _sortOrder: 3, text: "В заголовке нет эмодзи, если в карточке есть картинка" },
      { text: "Для картинки-обтравки добавлен атрибут image_style=\"picture\"" },
      { text: "В последней карточке, если это не рассылка, добавлена иконка потока или Telegram, в заголовке этой карточки нет эмодзи. В шортах иконки со скруглёнными углами" },
      { text: "Проверить у ссылки на курс наличие хвоста, если его нет, запросить у редактора" },
      { text: "Проверить у ссылки на анкету наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_ankета, вместо стандартного. Исключение — анкеты спорта" },
      { text: "Проверить у ссылки на статью или поток наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_button" },
      { text: "Дискрипшн находится внутри <tiles></tiles> и тега p grade=\"small\"." },
      { text: "В дискрипшен под последней карточкой вынесена информация об актуальности цен и ценах в валюте (поскольку не используем тултипы), источниках данных, метках об иноагентах и т. д." },
      { text: "У списка в конце шортов p grade=\"secondary\"" },
      { text: "Список в конце шортов из 3–4 ссылок выстроен «лесенкой» если позволяет смысл. Вводное предложение — без жирного выделения" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка шорты", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
    ],
    "Картинки": [
      { _sortOrder: 2, text: "Для картинки-обтравки добавлен атрибут image_style=\"picture\"", feature: "images" },
    ],
  },
  ugc: {
    "Админка": [{ _sortOrder: 4, text: "Нажата кнопка из сообщества" }],
    "Текст": [
      {
        _sortOrder: 2,
        links: [{ label: "В текст добавлена актуальная плашка с ообщества", url: "https://docs.google.com/document/d/1U_YBVur4Rtjv5jEMY1Xas9Rr4TxdvenLlIBFbVxIBjg/edit?tab=t.0" }],
      },
    ],
  },
};
const PRESET_EXCLUDES = {
  cd: { "Текст": ["lead", "heading-levels", "editor-badge"], "Админка": ["cover-author", "cover-type", "utm", "credit"] },
  shorts: { "Текст": ["tooltip-link", "currency-tooltip", "lists-style", "utm", "shorts-alt-h2-p", "shorts-list-format"] },
  spending: { "Текст": ["lead", "spending-poll", "editor-badge", "spending-card", "shorts-alt-h2-p", "spending-shorts"] },
};
const DATA = {
  "Админка": [
      { _sortOrder: 0, text: "В заголовке проставлен мягкий перенос, если если он необходим", links: [{ label: "Символы", url: "https://symbl.cc/ru/00AD/" }, { label: "Правила", url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe" }, { label: "Методичка", url: "https://docs.google.com/document/d/1UBwfR7TE3rSBF4VnxmXUl7K0hjow-y5Jct4hG1QTIsI/edit?tab=t.0#heading=h.z33ybfin6ltb" }] },
    { text: "Проверить, что коллеги закрыли вкладку с визивигом" },
    { text: "Перенести мету из комментария в кайтене в админку" },
    { text: "Ог⁠⁠-⁠⁠заг = заголовок статьи, ОГ-описание на месте, текст на ОГ-картинке оттипографирован" },
    { text: "Нажать галочку скрыть из приложения банка, если материал 18+ (секс, алкоголь и т.д.)" },
    { _sortOrder: 4, text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие" },
    { links: [{ label: "Пометка про иноагентов/экстремистов в инфоблоке оформлена корректно", url: "https://tinkoffjournal.kaiten.ru/documents/d/05e4af49-d4af-433d-a183-528ac0d4da1a" }] },
  ],
  "Текст": [
    { text: "Подпись автора с маленькой буквы" },
    { id: "lead", text: "В начале статьи есть лид, в конце лида — знак окончания предложения (точка, вопросительный или восклицательный знак, многоточие)" },
    { text: "У заголовка оглавления нет знаков препинания в конце. Якорные ссылки в оглавлении ведут на нужные разделы" },
    { text: "У сервисных плашек заголовок <h3> с атрибутом level=\"3\" и в последнем предложении отсутствует точка" },
    { id: "heading-levels", text: "Везде проставлены верные уровни заголовков (h2, h2 level=\"2\", h3 для плашек)" },
    { text: "<nobr> стоит во всех кейсах из методички" },
    { text: "В коде статьи нет пустых атрибутов" },
    { text: "После эмодзи стоит пробел" },
    { text: "Поправить типографирование: м², а не м2, 1/2, а не ½" },
    { text: "Проверить ссылки: предлоги, точки, восклицательные, вопросительные знаки и двоеточия входят в ссылку, а запятые — нет" },
    { text: "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с запятой входят в <strong> и <mark>" },
    { text: "В ссылке шаблона гугл⁠-⁠дока для копирования /edit заменен на /copy." },
    { id: "utm", text: "Поиском по коду найдены и удалены оставшихся у ссылок метки /?ysclid и https://google.com/" },
    { id: "currency-tooltip", text: "У первого валютного фичера стоит тултип: \"Суммы в рублях пересчитываются по актуальному курсу раз в день\"" },
    { id: "tooltip-link", text: "Тултип не стоит рядом со ссылкой" },
    { id: "lists-style", text: "Проверить оформление списков: цифровые и кастомные — с большой буквы, в конце пунктов точки. Списки с буллитами — с маленькой буквы, в конце пунктов точка с запятой, у последнего пункта — точка" },
    { id: "spending-poll", text: "Опрос на месте, в нем предлоги приклеены к следующему слову, эмодзи отображаются корректно", feature: "poll" },
    { id: "editor-badge", text: "В конце материала стоит верная плашка телеграм-канала редакции" },
    { text: "Расставить поля, если нужно, они не стоят рядом с баннерами, анкетами, картинками и таблицами" },
    { text: "Все примечания редакторов в квадратных скобках, выделенные красным цветом, учтены: необходимые элементы добавлены и корректно отображаются, а служебные пометки удалены" },
    { id: "shorts-alt-h2-p", text: "В шортах заполнен alt=\"\", заголовок h2 level=\"3\", текст внутри  p grade=\"medium\"", feature: "shorts" },
    { id: "spending-card", text: "У карточек товаров есть картинка и название товара", feature: "prodcard" },
    { id: "spending-card", text: "У карточек-сеток отсутствует описание и бирка", feature: "prodcard" },
    { id: "spending-card", text: "Внутри тега <price> обязательно прописана цена товара. Знаки препинания внутрь тега <price> включаются по правилу ссылок (. ! ? :)", feature: "prodcard" },
    { id: "spending-card", text: "Если тег <price> стоит посреди текста, то скрываем название магазина через атрибут shop-hide=\"true\"", feature: "prodcard" },
    {
      text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точка, кроме последней, строчки отбиты <br/>", feature: "shorts",
      id: "shorts-list-format"
    },
  ],
  "Таблицы": [
    { text: "У таблицы есть заголовок" },
   { text: "У таблиц с <thead> есть атрибут sticky-header=\"true\"" },
    { text: "Красиво отрегулированы ширины: если текста много или колонок три и более, то их ширину можно растянуть. При этом ширина одной колонки не должна превышать 350 пикселей. Если текста мало, то колонки узкие" },
    { text: "Данные в ячейках выровнены по правилам", links: [{ label: "Методичка", url: "https://docs.google.com/document/d/1vUzQiyxHYyNmwbSonuSRvMOtjGmiTvuLn0gFNWlFzEI/edit?tab=t.0#heading=h.hqvrmuvld38v"  }]  },
    { text: "Списки в таблицах оформлены по правилам" , links: [{ label: "Методичка", url: "https://docs.google.com/document/d/1vUzQiyxHYyNmwbSonuSRvMOtjGmiTvuLn0gFNWlFzEI/edit?tab=t.0#heading=h.d9k5whxwvw7i"  }] },
    { text: "Если в таблице сравниваются числа, то строки отсортированы от большего к меньшему" },
  ],
  "Картинки": [
    { text: "Скрины ретиновые и без артефактов, текст читаем, соблюдены поля, проставлен prop=\"bordered\", если фон сливается с фоном страницы", feature: "screenshots" },
    { text: "Для инфографики проставлен prop=\"bordered rounded\"", feature: "infographic" },
    { text: "Если у инфографики есть подпись, то указан кредит \"Источник:\" ", feature: "infographic" },
    { text: "Проверить в кайтене наличие комментария от фотореда о размере картинок или фоторам", feature: "images" },
    { text: "Проверить, нет ли засветов или вотемармок на картинках от фотореда", feature: "images" },
    { text: "Если на скриншоте есть персональные данные, уточнить у редактора, нужно ли их заблюрить", feature: "images" },
    { text: "Проверить необходимость prop=\"bordered\" у видео", feature: "images" },
  ],
  "Выпуск": [
    { text: "Проверить наличие метки «Разметка» в карточке кайтена, если есть доп. авторы" },
    { text: "Проверить комментарии в кайтене на наличие правок от редакторов и замен от фоторедов" },
    { text: "После выпуска прикрепить в кайтене ссылку на материал и опенграф-картинку" },
    { text: "При отложенной публикации в кайтене прикреплена ссылка на материал, проставлено время выпуска в заголовке карточки и в сроке выпуска" },
    { text: "После выпуска проверить материал на главной: все ли в порядке с обложкой, по правилам ли стоят переносы в заголовке" },
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
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);
  return matches;
}
const renderTextWithLinks = (text, dark) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("*") && part.endsWith("*")) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(1, -1)}</strong>;
    }
    const match = part.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (match) {
      const [, label, url] = match;
      return (
        <a key={i} href={url} target="_blank" rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", padding: "2px 8px", marginLeft: 6,
            borderRadius: 8, background: dark ? "#33334b" : "#e8e8ea", color: dark ? "#7ab7ff" : "#2563eb",
            textDecoration: "none", fontSize: 13, fontWeight: 500
          }}
        >{label}</a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};
// --- Component ---
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

  const resetFilters = useCallback(() => {
    markSaving();
    setUndoState({ kind: "filters", contentFilters });
    setContentFilters(buildContentFilters());
    setToast({ message: "Фильтры сброшены", canUndo: true });
  }, [contentFilters, markSaving]);

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

  const clearMarks = useCallback(() => {
    markSaving();
    setUndoState({ kind: "marks", tasks });
    setTasks(buildTasks(currentData));
    setToast({ message: "Отметки сняты", canUndo: true });
  }, [currentData, markSaving, tasks]);

  const undoClear = useCallback(() => {
    if (!undoState) return;
    markSaving();
    if (undoState.kind === "marks") {
      setTasks(undoState.tasks);
      setToast({ message: "Отметки восстановлены", canUndo: false });
    } else {
      setContentFilters(undoState.contentFilters);
      setToast({ message: "Фильтры восстановлены", canUndo: false });
    }
    setUndoState(null);
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
  const filtersAreDefault = useMemo(
    () =>
      JSON.stringify(contentFilters) === JSON.stringify(buildContentFilters()),
    [contentFilters],
  );
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
      resetFilters={resetFilters}
      filtersAreDefault={filtersAreDefault}
      focusMode={focusMode}
      setFocusMode={setFocusMode}
      relevantTasks={relevantTasks}
      visibleTasks={visibleTasks}
      hiddenByFilters={hiddenByFilters}
      progress={{ done: doneTasks, total: totalTasks, percent }}
      clearMarks={clearMarks}
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
