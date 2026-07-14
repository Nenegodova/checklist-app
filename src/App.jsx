import { useEffect, useState, useMemo, useCallback, useLayoutEffect } from "react";

const DATA_VERSION = "1.1";
const NOTES_TEMPLATE =
`Вопросы к&nbsp;редакции:
—
Вопросы к&nbsp;выпускающему:
—
Поставить блокер:
—
Правки&nbsp;для&nbsp;фотореда/дизайнера:
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
      { text: "В&nbsp;подвале с&nbsp;тоит: Цены действительны&nbsp;на&nbsp;момент публикации" },
      { _sortOrder: 3, text: "Тег noads" },
    ],
    "Текст": [
      { text: "Список&nbsp;в&nbsp;шортах: первая с&nbsp;трочка с&nbsp;&nbsp;большой, с&nbsp;ледующие с&nbsp;&nbsp;маленькой, в&nbsp;конце каждой с&nbsp;трочки точка, кроме последней, отбиты <br/>" },
    ],
  },
  tests: {
    "Текст": [
      { text: "В&nbsp;мини⁠-⁠тестах автор и&nbsp;подпись с&nbsp;тоят перед&nbsp;лидом" },
      { _sortOrder: 6, text: "Внутри&nbsp;конфига есть все необходимые с&nbsp;клейки" },
    ],
    "Админка": [
      { text: "Проверить автора обложки или&nbsp;источники" },
      { text: "Тег *noadscalctest*" },
      { text: "В&nbsp;больших тестах под&nbsp;обложкой указан иллюстратор" },
    ],
    "Прочее": [
      { text: "В&nbsp;кайтене прикреплены с&nbsp;сылки&nbsp;на&nbsp;админку и&nbsp;конфиг" },
      { links: [{ label: "Методичка тесты", url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c" }] },
    ],
  },
  compare: { "Админка": [{ text: "Тег noads" }] },
  spending: {
    "Текст": [
      { text: "В&nbsp;начале с&nbsp;татьи с&nbsp;тоит panel&nbsp;с&nbsp;абзацами *p grade=\"secondary\"*" },
      { text: "У&nbsp;авторов с&nbsp;тоят анонимные аватарки anonym_male&nbsp;у&nbsp;мужчин и&nbsp;anonym_female&nbsp;у&nbsp;женщин, автор с&nbsp;тоит после&nbsp;оглавления" },
      { text: "Траты обозначены *class=\"negative\"*" },
      { text: "Доходы обозначены *class=\"positive\"*" },
      { text: "Все заголовки&nbsp;в&nbsp;дневниках трат кроме&nbsp;заголовков дней *h2 level=\"2\"*" },
    ],
    "Админка": [
      { text: "Нажата кнопка&nbsp;из&nbsp;сообщества" },
      { text: "Подпись к&nbsp;обложке: Фотография — Ксения Михайлова" },
    ],
  },
  cd: {
    "Админка": [
      { _sortOrder: 0, text: "В&nbsp;классических ЧД нет&nbsp;подзага" },
      { _sortOrder: 1, text: "В&nbsp;подборке ЧД есть&nbsp;подзаг" },
      { text: "Обложка&nbsp;с&nbsp;эмодзи&nbsp;с&nbsp;типом мейна «мини над&nbsp;заголовком»" },
      { _sortOrder: 3, text: "Редакция Что делать + тематическая" },
      { text: "Нажаты кнопки&nbsp;из&nbsp;сообщества и&nbsp;выбор редакции" },
      { text: "Обязательно указываем краткое описание. В&nbsp;это поле дублируем текст&nbsp;из&nbsp;ог⁠-⁠описания" },
      { text: "В&nbsp;реальных вопросах проверяем наличие технического *тега noadswhattodo* (скрывает некоторые рекламные баннеры). Если&nbsp;его нет, то добавляем. В&nbsp;выдуманных проставляем тег вместе&nbsp;с&nbsp;другими. Если&nbsp;в&nbsp;статье присутствуют фичеры (калькуляторы, тесты), то добавляем еще&nbsp;один технический тег: *feature⁠-⁠out.* Для&nbsp;опросов этот тег не&nbsp;нужен" },
      { _sortOrder: 2, text: "В&nbsp;подборке ЧД основной заг начинается с&nbsp;о&nbsp;слов «Что делать, если:..»" },
      { _sortOrder: 4, text: "В&nbsp;подборке ЧД url с&nbsp;татьи всегда начинается&nbsp;с&nbsp;префикса «ask⁠-»" },
      { text: "В&nbsp;классических ЧД цвет фона&nbsp;для&nbsp;обложек #2c2c2c" },
      { text: "В&nbsp;подборке ЧД на&nbsp;обложке ОГ по&nbsp;три эмодзи" },
    ],
    "Текст": [
      { _sortOrder: 0, text: "В&nbsp;классических ЧД нет&nbsp;лида" },
      { _sortOrder: 1, text: "В&nbsp;подборке ЧД есть&nbsp;лид" },
      { text: "Есть автор вопроса и&nbsp;вопрос в&nbsp;плашке с&nbsp; *isbuble=\"true\"*" },
      { _sortOrder: 2, text: "Есть автор ответа" },
      { _sortOrder: 3, text: "В&nbsp;классических ЧД написание автора вопроса «спросил&nbsp;в&nbsp;Сообществе»/«спросила&nbsp;в&nbsp;Сообществе»" },
      { _sortOrder: 4, text: "В&nbsp;классических ЧД заголовки *h2 level=\"2\"*" },
      { _sortOrder: 5, text: "В&nbsp;подборке ЧД заголовки *h2*" },
      { _sortOrder: 6, text: "В&nbsp;подборке ЧД у&nbsp;каждого вопроса с&nbsp;тоит бирка с&nbsp; эмодзи" },
      { text: "Если в&nbsp;конце с&nbsp;татьи с&nbsp;тоит с&nbsp;писок с&nbsp;татей: вводное предложение выделяем болдом, для вводного предложения и&nbsp;с&nbsp;писка используем шифт с&nbsp; *p grade=\"large\"*" },
      { _sortOrder: 7, text: "В микро ЧД ответ на&nbsp;вопрос в&nbsp;плашке" },
      { text: "В микро ЧД есть utm⁠-⁠метки у&nbsp;с&nbsp;сылок на&nbsp;внутренние с&nbsp;татьи" },
      { _sortOrder: 8, text: "В микро ЧД автор ответа с&nbsp; подписью «нашел ответ»/«нашла ответ»" },
    ],
    "Выпуск": [
      { text: "Если материал с&nbsp;верстан в&nbsp;старом вопросе автора и&nbsp;нужно выпустить с&nbsp; новым url, то обязательно после публикации нужно настроить редирект" },
      { text: "В с&nbsp;лучае, когда после выпуска меняется обложка, пишем в&nbsp;тематическом чате с&nbsp;оответствующей редакции и&nbsp;чате «Т–Ж + с&nbsp;оцсети», что поменялась обложка, прикладываем с&nbsp;сылку на&nbsp;статью и&nbsp;новую обложку" },
      { text: "Проверить комментарии редактора на&nbsp;наличие нового url. Если комментария нет, то выпускаем с&nbsp;о с&nbsp;тарым url и&nbsp;редирект делать не&nbsp;нужно" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка ЧД", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
    ],
  },
  shorts: {
    "Админка": [
      { _sortOrder: 2, text: "Проставлен *тег noadsshort*" },
      { text: "Среди&nbsp;потоков добавлены «Шорты», но&nbsp;не&nbsp;основным потоком" },
      { text: "Нажата кнопка&nbsp;из&nbsp;сообщества и&nbsp;выбор редакции если&nbsp;вторая редакция UGC" },
      { text: "Обложка&nbsp;внутри&nbsp;статьи отсутствует" },
      { _sortOrder: 4, text: "Источник фото&nbsp;в&nbsp;подвале" },
    ],
    "Текст": [
      { _sortOrder: 4, text: "Подводка размещается&nbsp;в&nbsp;теге *p grade=\"secondary\"*, если&nbsp;она с&nbsp;лишком длинная, то&nbsp;часть с&nbsp;крывается под&nbsp;кат" },
      { _sortOrder: 1, text: "Оглавление с&nbsp;тоит перед&nbsp;карточками-тайлами" },
      { text: "У&nbsp;текста внутри&nbsp;шортов *grade=\"medium\"*" },
      { _sortOrder: 3, text: "В&nbsp;заголовке нет эмодзи, если&nbsp;в&nbsp;карточке есть картинка" },
      { text: "Для&nbsp;картинки-обтравки добавлен атрибут *image_style=\"picture\"*" },
      { text: "В последней карточке, если&nbsp;это не&nbsp;рассылка, добавлена иконка потока или Telegram, в&nbsp;заголовке этой карточки нет эмодзи. В&nbsp;шортах иконки с&nbsp;о&nbsp;скруглёнными углами" },
      { text: "Проверить&nbsp;у&nbsp;ссылки&nbsp;на&nbsp;курс наличие хвоста, если&nbsp;его нет, запросить&nbsp;у&nbsp;редактора" },
      { text: "Проверить&nbsp;у&nbsp;ссылки&nbsp;на&nbsp;анкету наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_ankета, вместо с&nbsp;тандартного. Исключение — анкеты с&nbsp;порта" },
      { text: "Проверить&nbsp;у&nbsp;ссылки&nbsp;на&nbsp;статью или&nbsp;поток наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_button" },
      { text: "Дискрипшн находится&nbsp;внутри&nbsp;*<tiles></tiles>* и&nbsp;тега *p grade=\"small\"*." },
      { text: "В&nbsp;дискрипшен под&nbsp;последней карточкой вынесена информация об&nbsp;актуальности цен и&nbsp;ценах&nbsp;в&nbsp;валюте (поскольку&nbsp;не используем тултипы), источниках данных, метках об&nbsp;иноагентах и&nbsp;т. д." },
      { text: "У&nbsp;списка&nbsp;в&nbsp;конце шортов *p grade=\"secondary\"*" },
      { text: "Список&nbsp;в&nbsp;конце шортов из&nbsp;3–4 с&nbsp;сылок выстроен «лесенкой» если&nbsp;позволяет с&nbsp;мысл. Вводное предложение — без&nbsp;жирного выделения" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка шорты", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
    ],
  },
  ugc: {
    "Админка": [{ text: "Нажата кнопка&nbsp;из&nbsp;сообщества" }],
    "Текст": [
      {
        _sortOrder: 2,
        links: [{ label: "В&nbsp;текст добавлена актуальная плашка с&nbsp;ообщества", url: "https://docs.google.com/document/d/1U_YBVur4Rtjv5jEMY1Xas9Rr4TxdvenLlIBFbVxIBjg/edit?tab=t.0" }],
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
    { text: "Проверить, что&nbsp;коллеги закрыли вкладку&nbsp;с&nbsp;визивигом" },
    { text: "Проверить формат" },
    { text: "Ог⁠⁠-⁠⁠заг = заголовок с&nbsp;татьи, ОГ-описание на&nbsp;месте" },
    { text: "Перенести мету&nbsp;из&nbsp;комментария&nbsp;в&nbsp;кайтене&nbsp;в&nbsp;админку" },
    { text: "Проверить с&nbsp;крытие" },
    { text: "Если&nbsp;в&nbsp;затравке отсутствует знак вопроса, то&nbsp;стоит двоеточие" },
    { id: "cover-type", text: "Проверить тип обложки, кредит&nbsp;к&nbsp;обложке&nbsp;в&nbsp;нужном месте (под&nbsp;обложкой/в&nbsp;подвале), наличие бирки&nbsp;на&nbsp;ОГ, текст&nbsp;на&nbsp;ОГ оттипирован (проставлены с&nbsp;клейки)" },
    { id: "credit", text: "Проверить автора обложки или&nbsp;источники" },
    { links: [{ label: "Иноагенты и&nbsp;прочие враги&nbsp;в&nbsp;подвале", url: "https://tinkoffjournal.kaiten.ru/documents/d/05e4af49-d4af-433d-a183-528ac0d4da1a" }] },
    {_sortOrder: 9999, text: "Мягкий перенос&nbsp;в&nbsp;заге", links: [{ label: "Символы", url: "https://symbl.cc/ru/00AD/" }, { label: "Правила", url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe" }] },
  ],
  "Текст": [
    { text: "Подпись автора&nbsp;с&nbsp;маленькой буквы" },
    { id: "lead", text: "Лид&nbsp;на&nbsp;месте, в&nbsp;конце точка" },
    { text: "Якоря&nbsp;в&nbsp;оглавлении с&nbsp;тоят верно. Двоеточие&nbsp;в&nbsp;оглавлении убрать" },
    { id: "heading-levels", text: "Везде проставлены верные уровни заголовков (*h2*, *h2 level=\"2\"*, *h3* для&nbsp;плашек)" },
    { text: "Проверить бирки&nbsp;над&nbsp;заголовками" },
    { text: "Заменяем невидимые пробелы на&nbsp;*&nbsp;*" },
    { text: "*&nbsp;* с&nbsp;клеяны с&nbsp;лова&nbsp;с&nbsp;частицами бы, же, ли; предлоги при, про, над, под, для, вне, обо, без" },
    { text: "Внутри&nbsp;*<nobr></nobr>* с&nbsp;тоят диапазоны чисел, с&nbsp;оставные наречия, °C, пишущиеся&nbsp;через дефис с&nbsp;лова (до 4 с&nbsp;имволов&nbsp;от дефиса), числа, которые идут&nbsp;после того, что с&nbsp;читаем (<nobr>минут 15</nobr>, <nobr>iPhone 16</nobr>), аббревиатуры-дополнения (<nobr>страны ЕС</nobr>, <nobr>ставка ЦБ</nobr>, <nobr>Витамин C</nobr>)" },
    { text: "После&nbsp;эмодзи с&nbsp;тоит пробел" },
    { text: "Поправить типографирование: м², а&nbsp;не&nbsp;м2, 1/2, а&nbsp;не&nbsp;½" },
    { text: "Предлог, точка, восклицательный, вопросительный знак, двоеточие&nbsp;в&nbsp;ссылках, запятые&nbsp;вне&nbsp;ссылок" },
    { text: "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с&nbsp; запятой в жире/марке" },
    { text: "У с&nbsp;ервисных плашек&nbsp;в&nbsp;последнем предложении отсутствует точка" },
    { text: "Нет пустых атрибутов" },
    { id: "utm", text: "UTM метки отсутствуют" },
    { id: "currency-tooltip", text: "У первого валютного фичера тултип: с&nbsp;уммы&nbsp;в&nbsp;рублях пересчитываются&nbsp;по&nbsp;актуальному курсу раз&nbsp;в&nbsp;день" },
    { id: "tooltip-link", text: "Тултип не стоит рядом&nbsp;с&nbsp;ссылкой" },
    { id: "lists-style", text: "Списки с&nbsp;&nbsp;цифрами и&nbsp;кастомные — с&nbsp;&nbsp;большой буквы, в&nbsp;конце точки. с&nbsp;писок с&nbsp;&nbsp;буллитами — с&nbsp;&nbsp;маленькой буквы, в&nbsp;конце точка, запятые" },
    { text: "У&nbsp;плашек&nbsp;с&nbsp;авторами с&nbsp;тоит *hl isbubble=\"true\"*" },
    { text: "Опрос&nbsp;на&nbsp;месте, в&nbsp;нем все с&nbsp;клеено", feature: "poll" },
    { id: "editor-badge", text: "Верная плашка редакции" },
    { text: "Расставить поля если&nbsp;нужно, они не должны с&nbsp;тоять рядом&nbsp;с&nbsp;баннерами, анкетами, картинками и&nbsp;таблицами" },
    { text: "Проверить виджеты, фичеры, баннеры, этажи, кат" },
  ],
  "Таблицы": [
    { text: "У таблицы есть заголовок" },
    { text: "Проверить *table sticky-header=\"true\"*&nbsp;у&nbsp;таблиц&nbsp;с&nbsp;thead" },
    { text: "Красиво отрегулированы ширины" },
    { text: "Выравнивание&nbsp;по&nbsp;левому краю если: числа не&nbsp;сравниваются между&nbsp;собой, а&nbsp;используются как обозначение или порядковый номер, в&nbsp;колонке есть диапазоны, в&nbsp;колонке с&nbsp;мешаны разные единицы измерения, в&nbsp;колонке используются валютные фичеры (в&nbsp;том числе есть ячейки&nbsp;с&nbsp;ним, а&nbsp;есть без&nbsp;него), в&nbsp;части ячеек нет числовых значений" },
    { text: "Списки: пункты лежат&nbsp;внутри&nbsp;одной ячейки, вначале пункта с&nbsp;тоит •, после&nbsp;буллита с&nbsp;тоит пробел, каждый пункт с&nbsp;&nbsp;большой буквы, в&nbsp;конце пунктов нет знаков препинания, пункты разделяются <br/>" },
    { text: "Если&nbsp;в&nbsp;таблице есть цены, то&nbsp;строки нужно отсортировать&nbsp;по&nbsp;убыванию цен (от большего к&nbsp;меньшему)" },
  ],
  "Картинки": [
    { text: "Источники&nbsp;под&nbsp;фотками заменены&nbsp;на ©", feature: "images" },
    { text: "Скрины ретиновые и&nbsp;чистые, текст читаем, с&nbsp;облюдены поля, проставлен *prop=\"bordered\"* если&nbsp;фон с&nbsp;ливается&nbsp;с&nbsp;фоном с&nbsp;траницы", feature: "screenshots" },
    { text: "Проверить необходимость *prop=\"bordered\"*&nbsp;у&nbsp;видео", feature: "images" },
    { text: "Для&nbsp;инфографики проставлен *prop=\"bordered rounded\"*", feature: "infographic" },
    { text: "В&nbsp;подписи&nbsp;к&nbsp;инфографике есть Источник: ", feature: "infographic" },
    { text: "Проверить&nbsp;в&nbsp;кайтене наличие комментария&nbsp;от&nbsp;фотореда&nbsp;о&nbsp;размере картинок или&nbsp;фоторам", feature: "images" },
    { text: "Проверить&nbsp;есть&nbsp;ли&nbsp;засветы или&nbsp;вотермарки&nbsp;на&nbsp;картинках&nbsp;от&nbsp;фотореда", feature: "images" },
    { text: "При&nbsp;необходимости заблюрены все персональные данные", feature: "images" },
  ],
  "Выпуск": [
    { text: "Проверить метку разметка, если&nbsp;есть доп. авторы" },
    { text: "Проверить комментарии&nbsp;в&nbsp;кайтене" },
    { text: "В&nbsp;кайтен прикрепить с&nbsp;сылку&nbsp;на&nbsp;материал после&nbsp;выпуска и&nbsp;опенграф-картинку" },
    { text: "После выпуска проверить материал&nbsp;на&nbsp;главной" },
  ],
  "Прочее": [
    { text: "В&nbsp;ссылке шаблона гугл⁠-⁠дока&nbsp;для копирования */edit* заменен&nbsp;на */copy*." },
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

// ИСПРАВЛЕНО: функция вынесена наружу, ключи генерируются через индекс map (стабильно)
const renderTextWithLinks = (text, dark) => {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
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
           style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", marginLeft: 6,
             borderRadius: 8, background: dark ? "#33334b" : "#e8e8ea", color: dark ? "#7ab7ff" : "#2563eb",
             textDecoration: "none", fontSize: 13, fontWeight: 500 }}
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
  }, [contentFilters, tasks, collapsed, notes]);

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
    ["preset", "notes", "checklist", "collapsed", "contentFilters", "version", "dark"].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem("version", DATA_VERSION);
    setPreset("default");
    setContentFilters(buildContentFilters());
    setNotes("");
    setFocusMode(false);
    setDark(false);
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

  const ui = {
    categoryTitle: { cursor: "pointer", marginBottom: 12, fontSize: 15, fontWeight: 600, color: category, display: "flex", alignItems: "center", gap: 16 },
    card: { display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 18px", border: `1px solid ${border}`, background: card, textAlign: "left", borderRadius: 18, transition: "all 0.15s ease", boxShadow: dark ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)" },
    taskText: { flex: 1, fontSize: 13, lineHeight: "18px", color: textColor, textDecoration: "none" },
  };

  return (
    <div className={dark ? "dark" : ""} style={{ padding: 30, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial", background: bg, color: textColor }}>
      <style>{`
        body, html { margin: 0 !important; padding: 0 !important; }
      `}</style>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
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
                        {task.text && <div style={{ ...ui.taskText, textDecoration: task.done ? "line-through" : "none" }}>{renderTextWithLinks(task.text, dark)}</div>}
                                            {task.links?.length > 0 && (
                          <div style={{ display: "flex", gap: 8, marginTop: task.text ? 8 : 0, flexWrap: "wrap" }}>
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
                                  border: dark ? "1px solid #3f3f46" : "1px solid #d1d5db"
                                }}
                              >
                                {link.label}
                              </a>
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
              <button type="button" onClick={() => setNotes((prev) => prev.trim() ? prev : NOTES_TEMPLATE)}
                style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: dark ? "#27272a" : "#eef2f7", color: textColor, fontSize: 12, cursor: "pointer" }}>Вставить шаблон</button>
              <button type="button" onClick={() => setNotes("")}
                style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: dark ? "#3a1f1f" : "#fee2e2", color: dark ? "#fca5a5" : "#991b1b", fontSize: 12, cursor: "pointer" }}>Очистить</button>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Заметки&nbsp;по&nbsp;ходу проверки: вопросы, правки и&nbsp;всё, что&nbsp;не хочется потерять — можно записывать с&nbsp;юда, чтобы&nbsp;не держать&nbsp;в голове"
              style={{ width: "100%", height: 180, padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: dark ? "#111" : "#fff", color: textColor, fontSize: 14, lineHeight: "20px", resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        <button type="button" onClick={() => setNotesOpen((v) => !v)}
          style={{ 
            width: 58, height: 58, borderRadius: "50%", border: "2px solid #FFDD2D", 
            background: bg, color: dark ? "#FFDD2D" : "#111827", 
            boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.12)", 
            fontSize: 22, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" 
          }}>✏️</button>
      </div>
    </div>
  );
}