import { useEffect, useState, useMemo, useCallback, useLayoutEffect } from "react";

const DATA_VERSION = "1.2";
const NOTES_TEMPLATE = `Вопросы к редакции:
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
  prodcard: { label: "Карточки товаров", default: true },
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
      { _sortOrder: 6, text: "Заполнено краткое описание" },
      { _sortOrder: 3, text: "Заполнен тикер" },
    ],
  },
  shopping: {
    "Админка": [
      { _sortOrder: 4, text: "В подвале стоит: Цены действительны на момент публикации" },
      { _sortOrder: 3, text: "Тег noads" },
    ],
    "Текст": [
      { _sortOrder: 17, text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точка, кроме последней, отбиты <br/>" },
    ],
  },
  tests: {
    "Текст": [
      { _sortOrder: 0, text: "В мини⁠-⁠тестах автор и подпись стоят перед лидом" },
      { _sortOrder: 6, text: "Внутри конфига есть все необходимые склейки" },
    ],
    "Админка": [
      { _sortOrder: 3, text: "Проверить автора обложки или источники" },
      { _sortOrder: 2, text: "Тег _noadscalctest_" },
      { _sortOrder: 3, text: "В больших тестах под обложкой указан иллюстратор" },
    ],
    "Прочее": [
      { text: "В кайтене прикреплены ссылки на админку и конфиг" },
      { links: [{ label: "Методичка тесты", url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c" }] },
    ],
  },
  compare: { "Админка": [{ _sortOrder: 3, text: "Тег noads" }] },
  spending: {
    "Текст": [
      { _sortOrder: 1, text: "В начале статьи стоит плашка panel с абзацами _p grade=\"secondary\"_" },
      { _sortOrder: 1, text: "У авторов стоят анонимные аватарки anonym_male у мужчин и anonym_female у женщин, автор стоит после оглавления" },
      { _sortOrder: 7, text: "Траты обозначены _class=\"negative\"_" },
      { _sortOrder: 7, text: "Доходы обозначены _class=\"positive\"_" },
      { _sortOrder: 2, text: "Все заголовки в дневниках трат кроме заголовков дней _h2 level=\"2\"_" },
    ],
    "Админка": [
      { _sortOrder: 4, text: "Нажата кнопка из сообщества" },
      { _sortOrder: 5, text: "Подпись к обложке: Фотография — Ксения Михайлова" },
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
      { _sortOrder: 6, text: "В реальных вопросах проверяем наличие технического _тега noadswhattodo._ В выдуманных проставляем тег вместе с другими. Если в статье присутствуют фичеры (калькуляторы, тесты), то добавляем еще один технический тег: _feature⁠-⁠out._ Для опросов этот тег не нужен" },
      { _sortOrder: 0, text: "В подборке ЧД основной заг начинается с о слов «Что делать, если:..»" },
      { _sortOrder: 0, text: "В подборке ЧД url статьи всегда начинается с префикса «ask⁠-»" },
      { _sortOrder: 5, text: "В классических ЧД цвет фона для обложек #2c2c2c" },
    ],
    "Текст": [
      { _sortOrder: 0, text: "В классических ЧД нет лида" },
      { _sortOrder: 1, text: "В подборке ЧД есть лид" },
      { text: "Есть автор вопроса и вопрос в плашке с _isbuble=\"true\"_" },
      { _sortOrder: 2, text: "Есть автор ответа" },
      { _sortOrder: 3, text: "В классических ЧД написание автора вопроса «спросил в Сообществе»/«спросила в Сообществе»" },
      { _sortOrder: 3, text: "У автора вопроса стоит _additional_" },
      { _sortOrder: 5, text: "Проверить бирки над заголовками в Подборках ЧД" },
      { _sortOrder: 6, text: "В подборке ЧД у каждого вопроса стоит бирка с эмодзи" },
      { text: "Если в конце статьи стоит список статей: вводное предложение выделяем болдом, для вводного предложения и списка используем шифт с _p grade=\"large\"_" },
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
      { _sortOrder: 2, text: "Проставлен _тег noadsshort_" },
      { _sortOrder: 2, text: "Среди потоков добавлены «Шорты», но не основным потоком" },
      { _sortOrder: 2, text: "Нажата кнопка из сообщества и выбор редакции если вторая редакция UGC" },
      { _sortOrder: 3, text: "Обложка внутри статьи отсутствует" },
      { _sortOrder: 3, text: "Источник фото в подвале" },
    ],
    "Текст": [
      { _sortOrder: 4, text: "Подводка размещается в теге _p grade=\"secondary\"_, если она слишком длинная, то часть скрывается под кат" },
      { _sortOrder: 1, text: "Оглавление стоит перед карточками-тайлами" },
      { text: "У текста внутри шортов _grade=\"medium\"_" },
      { _sortOrder: 3, text: "В заголовке нет эмодзи, если в карточке есть картинка" },
      { text: "Для картинки-обтравки добавлен атрибут _image_style=\"picture\"_" },
      { text: "В последней карточке, если это не рассылка, добавлена иконка потока или Telegram, в заголовке этой карточки нет эмодзи. В шортах иконки со скруглёнными углами" },
      { text: "Проверить у ссылки на курс наличие хвоста, если его нет, запросить у редактора" },
      { text: "Проверить у ссылки на анкету наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_ankета, вместо стандартного. Исключение — анкеты спорта" },
      { text: "Проверить у ссылки на статью или поток наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_button" },
      { text: "Дискрипшн находится внутри _<tiles></tiles>_ и тега _p grade=\"small\"_." },
      { text: "В дискрипшен под последней карточкой вынесена информация об актуальности цен и ценах в валюте (поскольку не используем тултипы), источниках данных, метках об иноагентах и т. д." },
      { text: "У списка в конце шортов _p grade=\"secondary\"_" },
      { text: "Список в конце шортов из 3–4 ссылок выстроен «лесенкой» если позволяет смысл. Вводное предложение — без жирного выделения" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка шорты", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
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
  shorts: { "Текст": ["tooltip-link", "currency-tooltip", "lists-style", "utm"] },
};

const DATA = {
  "Админка": [
    { text: "Проверить, что коллеги закрыли вкладку с визивигом" },
    { text: "Перенести мету из комментария в кайтене в админку" },
    { text: "Ог⁠⁠-⁠⁠заг = заголовок статьи, ОГ-описание на месте" },
    { text: "Проверить скрытие" },
    { _sortOrder: 4, text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие" },
    { _sortOrder: 4, text: "Проверить формат" },
    { id: "cover-type", text: "Проверить тип обложки, кредит к обложке в нужном месте (под обложкой/в подвале), наличие бирки на ОГ, текст на ОГ оттипирован (проставлены склейки)" },
    { id: "credit", text: "Проверить автора обложки или источники" },
    { links: [{ label: "Иноагенты и прочие враги в подвале", url: "https://tinkoffjournal.kaiten.ru/documents/d/05e4af49-d4af-433d-a183-528ac0d4da1a" }] },
    { _sortOrder: 9999, text: "Мягкий перенос в заге", links: [{ label: "Символы", url: "https://symbl.cc/ru/00AD/" }, { label: "Правила", url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe" }] },
  ],
  "Текст": [
    { text: "Подпись автора с маленькой буквы" },
    { id: "lead", text: "Лид на месте, в конце точка" },
    { text: "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать" },
    { id: "heading-levels", text: "Везде проставлены верные уровни заголовков (*h2*, _h2 level=\"2\"_, _h3_ для плашек)" },
    { text: "Проверить бирки над заголовками" },
    { text: "Внутри _<nobr></nobr>_ склеены слова с частицами бы, же, ли, стоят диапазоны чисел, составные наречия, °C, пишущиеся через дефис слова (до 4 символов от дефиса), числа, которые идут после слов, к которым они относятся (минут 15, iPhone 16), аббревиатуры-дополнения (страны ЕС, ставка ЦБ, Витамин C, короткие слова (уж, ЖК, ИП))" },
    { text: "После эмодзи стоит пробел" },
    { text: "Поправить типографирование: м², а не м2, 1/2, а не ½" },
    { text: "Предлог, точка, восклицательный и вопросительный знаки, двоеточие в ссылках, запятые вне ссылок" },
    { text: "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с запятой в жире/марке" },
    { text: "У карточек товаров есть картинка и название товара", feature: "prodcard" },
    { text: "У карточек-сеток отсутствует описние и бирка", feature: "prodcard" },
    { text: "Внутри тега _<price>_ обязательно прописана цена товара. Знаки препинания внутрь тега _<price>_ включаются по правилу ссылок (. ! ? :)", feature: "prodcard" },
    { text: "Если тег _<price>_ стоит посреди текста, то скрываем название магазина через атрибут _shop-hide=\"true\"_", feature: "prodcard" },
    { text: "У сервисных плашек в последнем предложении отсутствует точка" },
    { text: "В ссылке шаблона гугл⁠-⁠дока для копирования _/edit_ заменен на _/copy_." },
    { text: "Нет пустых атрибутов" },
    { id: "utm", text: "UTM метки отсутствуют" },
    { id: "currency-tooltip", text: "У первого валютного фичера тултип: Суммы в рублях пересчитываются по актуальному курсу раз в день" },
    { id: "tooltip-link", text: "Тултип не стоит рядом с ссылкой" },
    { id: "lists-style", text: "Списки с цифрами и кастомные — с большой буквы, в конце точки. Список с буллитами — с маленькой буквы, в конце точка, запятые (точка с запятой, точказапятые?)" },
    { text: "У плашек с авторами стоит _<bubble>_" },
    { text: "Опрос на месте, в нем все склеено, эмодзи отображается корректно", feature: "poll" },
    { id: "editor-badge", text: "Верная плашка редакции" },
    { text: "Расставить поля если нужно, они не должны стоять рядом с баннерами, анкетами, картинками и таблицами" },
    { text: "Проверить виджеты, фичеры, баннеры, этажи, кат" },
  ],
  "Таблицы": [
    { text: "У таблицы есть заголовок" },
    { text: "Проверить _table sticky-header=\"true\"_ у таблиц с thead" },
    { text: "Красиво отрегулированы ширины" },
    { text: "Выравнивание по левому краю если: числа не сравниваются между собой, а используются как обозначение или порядковый номер, в колонке есть диапазоны, в колонке смешаны разные единицы измерения, в колонке используются валютные фичеры (в том числе есть ячейки с ним, а есть без него), в части ячеек нет числовых значений" },
    { text: "Списки: пункты лежат внутри одной ячейки, вначале пункта стоит •, после буллита стоит пробел, каждый пункт с большой буквы, в конце пунктов нет знаков препинания, пункты разделяются <br/>" },
    { text: "Если в таблице есть цены, то строки нужно отсортировать по убыванию цен" },
  ],
  "Картинки": [
    { text: "Источники под фотками заменены на ©", feature: "images" },
    { text: "Скрины ретиновые и чистые, текст читаем, соблюдены поля, проставлен _prop=\"bordered\"_ если фон сливается с фоном страницы", feature: "screenshots" },
    { text: "Проверить необходимость _prop=\"bordered\"_ у видео", feature: "images" },
    { text: "Для инфографики проставлен _prop=\"bordered rounded\"_", feature: "infographic" },
    { text: "Если у инфографики есть подпись, то указан кредит Источник: ", feature: "infographic" },
    { text: "Проверить в кайтене наличие комментария от фотореда о размере картинок или фоторам", feature: "images" },
    { text: "Проверить есть ли засветы или вотермарки на картинках от фотореда", feature: "images" },
    { text: "При необходимости заблюрены все персональные данные", feature: "images" },
  ],
  "Выпуск": [
    { text: "Проверить метку разметка, если есть доп. авторы" },
    { text: "Проверить комментарии в кайтене" },
    { text: "В кайтен прикрепить ссылку на материал после выпуска и опенграф-картинку" },
    { text: "При отложенной публикации в катен прикреплена ссылка на материал, проставлено время выпуска" },
    { text: "После выпуска проверить материал на главной" },
  ],
  "Прочее": [
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
  // Исправлено регулярное выражение для корректной работы в JS
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
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
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

  const [preset, setPreset] = useState(() => localStorage.getItem("preset") || "default");
  const [contentFilters, setContentFilters] = useState(() => readStorageJSON("contentFilters") || buildContentFilters());
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem("notes") || "");
  const [notesOpen, setNotesOpen] = useState(false);

  // Новые состояния для фона
  const [bgImage, setBgImage] = useState(() => {
    try { return localStorage.getItem("bgImage") || ""; } catch { return ""; }
  });
  const [bgOverlay, setBgOverlay] = useState(() => {
    try { return parseFloat(localStorage.getItem("bgOverlay") || "0.6"); } catch { return 0.6; }
  });

  useLayoutEffect(() => {
    document.documentElement.className = dark ? "dark" : "";
    const currentValue = localStorage.getItem("dark");
    if (currentValue !== String(dark)) {
      localStorage.setItem("dark", String(dark));
    }
  }, [dark]);

  const currentData = useMemo(() => {
    const clone = typeof structuredClone === "function" ? structuredClone(DATA) : JSON.parse(JSON.stringify(DATA));
    const presetData = PRESETS[preset];
    if (presetData) {
      Object.keys(presetData).forEach((cat) => {
        if (!clone[cat]) clone[cat] = [];
        const baseItems = clone[cat].map((item, i) => ({ ...item, _sortOrder: item._sortOrder ?? i }));
        const presetItems = presetData[cat].map((item) => ({ ...item, _sortOrder: item._sortOrder ?? 9999 }));
        clone[cat] = [...baseItems, ...presetItems].sort((a, b) => (a._sortOrder ?? Infinity) - (b._sortOrder ?? Infinity));
      });
    } else {
      Object.keys(clone).forEach((cat) => {
        clone[cat] = clone[cat]
          .map((item, i) => ({ ...item, _sortOrder: item._sortOrder ?? i }))
          .sort((a, b) => (a._sortOrder ?? Infinity) - (b._sortOrder ?? Infinity));
      });
    }
    const excludes = PRESET_EXCLUDES[preset];
    if (excludes) {
      Object.entries(excludes).forEach(([cat, ids]) => {
        if (!clone[cat]) return;
        clone[cat] = clone[cat].filter((item) => {
          const itemId = item.id || item.text;
          return !ids.includes(itemId);
        });
      });
    }
    return clone;
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

  useEffect(() => {
    localStorage.setItem("contentFilters", JSON.stringify(contentFilters));
    localStorage.setItem("checklist", JSON.stringify(tasks));
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
    localStorage.setItem("notes", notes);
    localStorage.setItem("bgImage", bgImage || "");
    localStorage.setItem("bgOverlay", String(bgOverlay));
  }, [contentFilters, tasks, collapsed, notes, bgImage, bgOverlay]);

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
      return { ...prev, [cat]: updated };
    });
  }, []);

  useLayoutEffect(() => {
    setCollapsed((prev) => {
      let next = { ...prev };
      const cats = Object.keys(tasks);
      const lastDoneCat = [...cats].reverse().find((cat) => tasks[cat]?.every((t) => t.done));
      if (lastDoneCat) {
        next[lastDoneCat] = true;
        const idx = cats.indexOf(lastDoneCat);
        for (let i = idx + 1; i < cats.length; i++) {
          if (tasks[cats[i]]?.some((t) => !t.done)) {
            next[cats[i]] = false;
            break;
          }
        }
      }
      return next;
    });
  }, [tasks]);

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
    ["preset", "notes", "checklist", "collapsed", "contentFilters", "version", "dark", "bgImage", "bgOverlay"].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem("version", DATA_VERSION);
    setPreset("default");
    setContentFilters(buildContentFilters());
    setNotes("");
    setFocusMode(false);
    setDark(false);
    setBgImage("");
    setBgOverlay(0.6);
    setTasks(buildTasks(DATA));
    setCollapsed(buildCollapsed(DATA));
  }, []);

  const toggleCollapse = useCallback((cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  // Загрузка фонового изображения
  const handleBgFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Файл слишком большой (макс. 4 МБ для localStorage).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setBgImage(ev.target.result);
        localStorage.setItem("bgImage", ev.target.result);
      } catch {
        alert("Не удалось сохранить: превышен лимит localStorage.");
        setBgImage("");
      }
    };
    reader.readAsDataURL(file);
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
  const ui = {
    categoryTitle: { cursor: "pointer", marginBottom: 12, fontSize: 15, fontWeight: 600, color: category, display: "flex", alignItems: "center", gap: 16 },
    card: { display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 18px", border: `1px solid ${border}`, background: card, textAlign: "left", borderRadius: 18, transition: "all 0.15s ease", boxShadow: dark ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)" },
    taskText: { flex: 1, fontSize: 13, lineHeight: "18px", color: textColor, textDecoration: "none" },
  };

  return (
    <div 
      style={{
        padding: 30, 
        minHeight: "100vh", 
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial", 
        color: textColor,
        background: bgImage ? "transparent" : bg,
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
        transition: "background 0.3s ease",
      }}
    >
      {/* Слой читаемости поверх картинки */}
      {bgImage && (
        <div 
          style={{
            position: "absolute",
            inset: 0,
            background: dark 
              ? `rgba(0, 0, 0, ${bgOverlay})` 
              : `rgba(255, 255, 255, ${1 - bgOverlay})`,
            pointerEvents: "none",
            zIndex: -1,
            transition: "background 0.3s ease",
          }} 
        />
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <style>{`
          body, html { margin: 0 !important; padding: 0 !important; }
        `}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
          <div style={{ flex: "1 1 320px", textAlign: "center" }}>
            <h1 style={{ margin: 0, padding: 0, fontSize: 28, fontWeight: 700, color: title, lineHeight: 1.2 }}>Чек-лист проверки</h1>
            <div style={{ marginTop: 8, fontSize: 13, color: mutedColor, lineHeight: 1.5 }}>{doneTasks}/{totalTasks} ({percent}%)</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, marginLeft: "auto", flex: "0 1 520px" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-end", width: "100%" }}>
              <button type="button" style={btn} onClick={() => setDark((v) => !v)}>
                {dark ? "☀️" : "🌙"}
              </button>
              <div style={{ position: "relative" }}>
                <select value={preset} onChange={(e) => { localStorage.removeItem("checklist"); localStorage.removeItem("collapsed"); setPreset(e.target.value); }}
                  style={{ height: 34, minWidth: 140, padding: "0 36px 0 12px", borderRadius: 10, border: `1px solid ${dark ? "#2a2a2e" : "#d1d5db"}`, background: dark ? "#18181b" : "#ffffff", color: dark ? "#e8e8ea" : "#111827", fontSize: 13, cursor: "pointer", outline: "none", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}>
                  <option value="default">Обычный</option><option value="invest">Инвест</option><option value="shopping">Шопинг</option><option value="tests">Тест</option><option value="compare">Сравнятор</option><option value="spending">Дневник трат</option><option value="cd">ЧД</option><option value="shorts">Шорты</option><option value="ugc">UGC</option>
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: dark ? "#a1a1aa" : "#666" }}>▼</span>
              </div>
              <button type="button" style={btn} onClick={resetAll}>Сброс</button>
              <button type="button" style={btn} onClick={() => setFocusMode((v) => !v)}>{focusMode ? "Фокус: ON" : "Фокус: OFF"}</button>
              <button type="button" style={{ ...btn, color: "red" }} onClick={hardReset}>RESET</button>
            </div>

            {/* Управление фоном */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-end", width: "100%" }}>
              <span style={{ fontSize: 12, color: mutedColor, minWidth: 70 }}>Фон:</span>
              <button 
                type="button" 
                style={{ ...btn, fontSize: 12, padding: "4px 10px" }}
                onClick={() => document.getElementById("bg-file-input").click()}
              >
                📁 Загрузить
              </button>
              <input 
                id="bg-file-input" 
                type="file" 
                accept="image/*" 
                style={{ display: "none" }} 
                onChange={handleBgFile} 
              />
              <button 
                type="button" 
                style={{ ...btn, fontSize: 12, padding: "4px 10px" }}
                onClick={() => { setBgImage(""); localStorage.removeItem("bgImage"); }}
                disabled={!bgImage}
              >
                🗑 Убрать
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={bgOverlay} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBgOverlay(val);
                  localStorage.setItem("bgOverlay", String(val));
                }}
                style={{ width: 80, cursor: "pointer", accentColor: dark ? "#7ab7ff" : "#2563eb" }}
                title="Прозрачность затемнения"
              />
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
