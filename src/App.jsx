import { useEffect, useState, useMemo, useCallback } from "react";

const DATA_VERSION = "1.1";
const NOTES_TEMPLATE =
`Вопросы к редакции:
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
    "Админка": [
      { text: "Заполнено краткое описание" },
      { text: "Заполнен тикер" },
    ],
  },
  shopping: {
    "Админка": [
      { text: "В подвале стоит: Цены действительны на момент публикации" },
      { _sortOrder: 3, text: "Тег noads" },
    ],
    "Текст": [
      { text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точка, кроме последней, отбиты <br/>" },
    ],
  },
  tests: {
    "Текст": [
      { text: "В мини-тестах автор и подпись стоят перед лидом" },
      { _sortOrder: 6, text: "Внутри конфига есть все необходимые склейки" },
    ],
    "Админка": [
      { text: "Проверить автора обложки или источники" },
      { text: "Тег *noadscalctest*" },
      { text: "В больших тестах под обложкой указан иллюстратор" },
    ],
    "Прочее": [
      { text: "В кайтене прикреплены ссылки на админку и конфиг" },
      { links: [{ label: "Методичка тесты", url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c" }] },
    ],
  },
  compare: { "Админка": [{ text: "Тег noads" }] },
  spending: {
    "Текст": [
      { text: "В начале статьи стоит panel с абзацами *p grade=\"secondary\"*" },
      { text: "У авторов стоят анонимные аватарки anonym_male у мужчин и anonym_female у женщин, автор стоит после оглавления" },
      { text: "Траты обозначены *class=\"negative\"*" },
      { text: "Доходы обозначены *class=\"positive\"*" },
      { text: "Все заголовки в дневниках трат кроме заголовков дней *h2 level=\"2\"*" },
    ],
    "Админка": [
      { text: "Нажата кнопка из сообщества" },
      { text: "Подпись к обложке: Фотография — Ксения Михайлова" },
    ],
  },
  cd: {
    "Админка": [
      { _sortOrder: 1, text: "В классических ЧД нет подзаг" },
      { _sortOrder: 2, text: "В подборке ЧД есть подзаг" },
      { text: "Обложка с эмодзи с типом мейна «мини над заголовком»" },
      { _sortOrder: 3, text: "Редакция Что делать + тематическая" },
      { text: "Нажаты кнопки из сообщества и выбор редакции" },
      { text: "Обязательно указываем краткое описание. В это поле дублируем текст из ог-описания" },
      { text: "В реальных вопросах проверяем наличие технического *тега noadswhattodo* (скрывает некоторые рекламные баннеры). Если его нет, то добавляем. В выдуманных проставляем тег вместе с другими. Если в статье присутствуют фичеры (калькуляторы, тесты), то добавляем еще один технический тег: *feature-out.* Для опросов этот тег не нужен" },
      { text: "В подборке ЧД основной заг начинается со слов «Что делать, если:..»" },
      { text: "В подборке ЧД url статьи всегда начинается с префикса «ask-»" },
      { text: "В классических ЧД цвет фона для обложек #2c2c2c" },
      { text: "В подборке ЧД на обложке ОГ по три эмодзи" },
    ],
    "Текст": [
      { _sortOrder: 0, text: "В классических ЧД нет лида" },
      { _sortOrder: 1, text: "В подборке ЧД есть лид" },
      { text: "Есть автор вопроса и вопрос в плашке с *isbuble=\"true\"*" },
      { _sortOrder: 2, text: "Есть автор ответа" },
      { _sortOrder: 3, text: "В классических ЧД написание автора вопроса «спросил в Сообществе»/«спросила в Сообществе»" },
      { _sortOrder: 4, text: "В классических ЧД заголовки *h2 level=\"2\"*" },
      { _sortOrder: 5, text: "В подборке ЧД заголовки *h2*" },
      { _sortOrder: 6, text: "В подборке ЧД у каждого вопроса стоит бирка с эмодзи" },
      { text: "Если в конце статьи стоит список статей: вводное предложение выделяем болдом, для вводного предложения и списка используем шифт с *p grade=\"large\"*" },
      { _sortOrder: 7, text: "В микро ЧД ответ на вопрос в плашке" },
      { text: "В микро ЧД есть utm-метки у ссылок на внутренние статьи" },
      { _sortOrder: 8, text: "В микро ЧД автор ответа с подписью «нашел ответ»/«нашла ответ»" },
    ],
    "Выпуск": [
      { text: "Если материал сверстан в старом вопросе автора и нужно выпустить с новым url, то обязательно после публикации нужно настроить редирект" },
      { text: "В случае, когда после выпуска меняется обложка, пишем в тематическом чате соответствующей редакции и чате «Т–Ж + соцсети», что поменялась обложка, прикладываем ссылку на статью и новую обложку" },
      { text: "Проверить комментарии редактора на наличие нового url. Если комментария нет, то выпускаем со старым url и редирект делать не нужно" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка ЧД", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
    ],
  },
  shorts: {
    "Админка": [
      { _sortOrder: 2, text: "Проставлен *тег noadsshort*" },
      { text: "Среди потоков добавлены «Шорты», но не основным потоком" },
      { text: "Нажата кнопка из сообщества и выбор редакции если вторая редакция UGC" },
      { text: "Обложка внутри статьи отсутствует" },
      { text: "Источник фото в подвале" },
    ],
    "Текст": [
      { _sortOrder: 4, text: "Подводка размещается в теге *p grade=\"secondary\"*, если она слишком длинная, то часть скрывается под кат" },
      { _sortOrder: 1, text: "Оглавление стоит перед карточками-тайлами" },
      { text: "У текста внутри шортов *grade=\"medium\"*" },
      { _sortOrder: 3, text: "В заголовке нет эмодзи, если в карточке есть картинка" },
      { text: "Для картинки-обтравки добавлен атрибут *image_style=\"picture\"*" },
      { text: "В последней карточке, если это не рассылка, добавлена иконка потока или Telegram, в заголовке этой карточки нет эмодзи. В шортах иконки со скруглёнными углами" },
      { text: "Проверить у ссылки на курс наличие хвоста, если его нет, запросить у редактора" },
      { text: "Проверить у ссылки на анкету наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_anketa, вместо стандартного. Исключение — анкеты спорта" },
      { text: "Проверить у ссылки на статью или поток наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_button" },
      { text: "Дискрипшн находится внутри *<tiles></tiles>* и тега *p grade=\"small\"*." },
      { text: "В дискрипшен под последней карточкой вынесена информация об актуальности цен и ценах в валюте (поскольку не используем тултипы), источниках данных, метках об иноагентах и т. д." },
      { text: "У списка в конце шортов *p grade=\"secondary\"*" },
      { text: "Список в конце шортов из 3–4 ссылок выстроен «лесенкой» если позволяет смысл. Вводное предложение — без жирного выделения" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка шорты", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
    ],
  },
  ugc: {
    "Админка": [{ text: "Нажата кнопка из сообщества" }],
    "Текст": [
      {
        _sortOrder: 2,
        links: [{ label: "В текст добавлена актуальная плашка сообщества", url: "https://docs.google.com/document/d/1U_YBVur4Rtjv5jEMY1Xas9Rr4TxdvenLlIBFbVxIBjg/edit?tab=t.0" }],
      },
    ],
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
    { text: "Внутри *<nobr></nobr>* стоят диапазоны чисел, составные наречия, °C, пишущиеся через дефис слова (до 4 символов от дефиса), числа, которые идут после того, что считаем (минут 15, iPhone 16), аббревиатуры-дополнения (страны ЕС, ставка ЦБ, Витамин C)" },
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
    { text: "Выравнивание по левому краю если: числа не сравниваются между собой, а используются как обозначение или порядковый номер, в колонке есть диапазоны, в колонке смешаны разные единицы измерения, в колонке используются валютные фичеры (в том числе есть ячейки с ним, а есть без него), в части ячеек есть дополнительные слова или символы, в некоторых ячейках нет числовых значений" },
    { text: "Списки: пункты лежат внутри одной ячейки, вначале пункта стоит •, после буллита стоит пробел, каждый пункт с большой буквы, в конце пунктов нет знаков препинания, пункты разделяются <br/>" },
    { text: "Если в таблице есть цены, то строки нужно отсортировать по убыванию цен (от большего к меньшему)" },
  ],
  "Картинки": [
    { text: "Источники под фотками заменены на ©", feature: "images" },
    { text: "Скрины ретиновые и чистые, текст читаем, соблюдены поля, проставлен *prop=\"bordered\"* если фон сливается с фоном страницы", feature: "screenshots" },
    { text: "Проверить необходимость *prop=\"bordered\"* у видео", feature: "images" },
    { text: "Для инфографики проставлен *prop=\"bordered rounded\"*", feature: "infographic" },
    { text: "В подписе к инфографике есть Источник: ", feature: "infographic" },
    { text: "Проверить в кайтене наличие комментария от фотореда о размере картинок или фоторам", feature: "images" },
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

    if (presetData) {
      Object.keys(presetData).forEach((cat) => {
        if (!result[cat]) result[cat] = [];
        const baseItems = result[cat].map((item, i) => ({ ...item, _sortOrder: item._sortOrder ?? i }));
        const presetItems = presetData[cat].map((item) => ({ ...item, _sortOrder: item._sortOrder ?? 9999 }));
        result[cat] = [...baseItems, ...presetItems].sort((a, b) => (a._sortOrder ?? Infinity) - (b._sortOrder ?? Infinity));
      });
    } else {
      Object.keys(result).forEach((cat) => {
        result[cat] = result[cat]
          .map((item, i) => ({ ...item, _sortOrder: item._sortOrder ?? i }))
          .sort((a, b) => (a._sortOrder ?? Infinity) - (b._sortOrder ?? Infinity));
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
      return buildTasks(currentData);
    }
    return saved || buildTasks(currentData);
  });

  const [collapsed, setCollapsed] = useState(() => readStorageJSON("collapsed") || buildCollapsed(currentData));

  // Safe localStorage sync
  useEffect(() => {
    localStorage.setItem("preset", preset);
    localStorage.setItem("contentFilters", JSON.stringify(contentFilters));
    localStorage.setItem("checklist", JSON.stringify(tasks));
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
    localStorage.setItem("notes", notes);
  }, [preset, contentFilters, tasks, collapsed, notes]);

  // Rebuild tasks on data/preset change without losing state
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

  const textColor = dark ? "#e8e8ea" : "#111";
  const mutedColor = dark ? "#a1a1aa" : "#555";
  const card = dark ? "#1A1D21" : "#ffffff";
  const border = dark ? "#2F343C" : "#E5E7EB";
  const bg = dark ? "#111315" : "#F6F7F9";
  const title = dark ? "#FFFFFF" : "#111827";
  const category = dark ? "#F3F4F6" : "#111827";

  const controlBase = {
    height: 34, padding: "6px 12px", borderRadius: 10, fontSize: 13, lineHeight: "20px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.15s ease", boxShadow: "none", outline: "none",
  };
  const makeControl = (isDark) => ({
    ...controlBase, border: `1px solid ${isDark ? "#2a2a2e" : "#d1d5db"}`,
    background: isDark ? "#1A1D21" : "#ffffff", color: isDark ? "#e8e8ea" : "#111827",
  });
  const btn = makeControl(dark);

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
          <a key={i} href={url} target="_blank" rel="noreferrer"
             style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", marginLeft: 6,
               borderRadius: 8, background: dark ? "#33334b" : "#e8e8ea", color: dark ? "#7ab7ff" : "#2563eb",
               textDecoration: "none", fontSize: 13, fontWeight: 500 }}
          >{label}</a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const ui = {
    categoryTitle: { cursor: "pointer", marginBottom: 12, fontSize: 15, fontWeight: 600, color: category, display: "flex", alignItems: "center", gap: 16 },
    card: { display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 18px", border: `1px solid ${border}`, background: card, textAlign: "left", borderRadius: 18, transition: "all 0.15s ease", boxShadow: dark ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)" },
    taskText: { flex: 1, fontSize: 13, lineHeight: "18px", color: textColor, textDecoration: "none" },
  };

  return (
    <div className={dark ? "dark" : ""} style={{ padding: 30, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial", background: bg, color: textColor }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
          <div style={{ flex: "1 1 320px" }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: title }}>Чек-лист проверки</h1>
            <div style={{ marginTop: 6, fontSize: 13, color: mutedColor }}>{doneTasks}/{totalTasks} ({percent}%)</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, marginLeft: "auto", flex: "0 1 520px" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-end", width: "100%" }}>
              <button style={btn} onClick={() => setDark((v) => !v)}>Тема</button>
              <div style={{ position: "relative" }}>
                <select value={preset} onChange={(e) => { localStorage.removeItem("checklist"); localStorage.removeItem("collapsed"); setPreset(e.target.value); }}
                  style={{ height: 34, minWidth: 140, padding: "0 36px 0 12px", borderRadius: 10, border: `1px solid ${dark ? "#2a2a2e" : "#d1d5db"}`, background: dark ? "#18181b" : "#ffffff", color: dark ? "#e8e8ea" : "#111827", fontSize: 13, cursor: "pointer", outline: "none", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}>
                  <option value="default">Обычный</option><option value="invest">Инвест</option><option value="shopping">Шопинг</option><option value="tests">Тест</option><option value="compare">Сравнятор</option><option value="spending">Дневник трат</option><option value="cd">ЧД</option><option value="shorts">Шорты</option><option value="ugc">UGC</option>
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: dark ? "#a1a1aa" : "#666" }}>▼</span>
              </div>
              <button style={btn} onClick={resetAll}>Сброс</button>
              <button style={btn} onClick={() => setFocusMode((v) => !v)}>{focusMode ? "Фокус: ON" : "Фокус: OFF"}</button>
              <button style={{ ...btn, color: "red" }} onClick={hardReset}>RESET</button>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-end", width: "100%" }}>
              <div style={{ width: "100%", fontSize: 12, fontWeight: 600, color: mutedColor, marginBottom: 6, textAlign: "center" }}>Контент</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: isMobile ? "center" : "flex-end" }}>
                {Object.entries(CONTENT_FILTERS).map(([key, item]) => (
                  <button key={key} type="button" onClick={() => setContentFilters((prev) => ({ ...prev, [key]: !prev[key] }))}
                    style={{ ...btn, height: 28, padding: "4px 10px", fontSize: 12, background: contentFilters[key] ? "#FFDD2D" : dark ? "#1A1D21" : "#fff", color: contentFilters[key] ? "#111" : textColor, border: contentFilters[key] ? "1px solid #FFDD2D" : `1px solid ${border}`, fontWeight: contentFilters[key] ? 600 : 400 }}>
                    {contentFilters[key] ? "✓ " : ""}{item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {Object.keys(tasks).map((cat) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div onClick={() => toggleCollapse(cat)} style={{ ...ui.categoryTitle, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{collapsed[cat] ? "▶" : "▼"}</span>
              <span>{cat}</span>
              <span style={{ fontSize: 12, opacity: 0.9, padding: "2px 8px", borderRadius: 999, background: dark ? "#2a2a2e" : "#e5e7eb", minWidth: 42, textAlign: "center" }}>
                {tasks[cat].filter((t) => t.done).length}/{tasks[cat].length} {tasks[cat].every((t) => t.done) ? " ✓" : ""}
              </span>
            </div>
            {!collapsed[cat] && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks[cat].map((task, i) => {
                  if ((cat === "Таблицы" && !contentFilters.tables) || (task.feature && !contentFilters[task.feature])) return null;
                  return (
                    <label key={`${cat}-${i}`} className="task-card" style={{ ...ui.card, display: focusMode && task.done ? "none" : "flex" }}>
                      <input type="checkbox" checked={task.done} onChange={() => toggle(cat, i)} aria-label={task.text}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: dark ? "#3f3f46" : "#6b7280", cursor: "pointer", flexShrink: 0 }} />
                      <div style={{ flex: 1, opacity: task.done ? 0.5 : 1 }}>
                        {task.text && <div style={{ ...ui.taskText, textDecoration: task.done ? "line-through" : "none" }}>{renderTextWithLinks(task.text)}</div>}
                        {task.links?.length > 0 && (
                          <div style={{ display: "flex", gap: 8, marginTop: task.text ? 8 : 0, flexWrap: "wrap" }}>
                            {task.links.map((link) => (
                              <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
                                style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, textDecoration: "none", background: dark ? "#27272a" : "#eef2f7", color: dark ? "#93c5fd" : "#2563eb", border: `1px solid ${dark ? "#3f3f46" : "#d1d5db"}` }}>{link.label}</a>
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

      <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 999 }}>
        {notesOpen && (
          <div style={{ width: 320, marginBottom: 12, padding: 16, borderRadius: 18, border: `1px solid ${border}`, background: card, boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.45)" : "0 12px 30px rgba(0,0,0,0.12)" }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: title, fontSize: 15 }}>Заметки</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={() => setNotes((prev) => prev.trim() ? prev : NOTES_TEMPLATE)}
                style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: dark ? "#27272a" : "#eef2f7", color: textColor, fontSize: 12, cursor: "pointer" }}>Вставить шаблон</button>
              <button onClick={() => setNotes("")}
                style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: dark ? "#3a1f1f" : "#fee2e2", color: dark ? "#fca5a5" : "#991b1b", fontSize: 12, cursor: "pointer" }}>Очистить</button>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Заметки по ходу проверки: вопросы, правки и всё, что не хочется потерять — можно записывать сюда, чтобы не держать в голове"
              style={{ width: "100%", height: 180, padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: dark ? "#111" : "#fff", color: textColor, fontSize: 14, lineHeight: "20px", resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        <button onClick={() => setNotesOpen((v) => !v)}
          style={{ width: 58, height: 58, borderRadius: "50%", border: "none", background: "#FFDD2D", color: "#111", boxShadow: "0 12px 32px rgba(255,221,45,.35)", fontSize: 22, cursor: "pointer" }}>✍️</button>
      </div>
    </div>
  );
}