import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import "./App.css";
import {
  getCategoryProgress,
  getHiddenByFiltersCount,
  getOverallProgress,
  getRelevantTasks,
  getVisibleTasks,
} from "./lib/checklist-state";
const DATA_VERSION = "1.1";
const NOTES_TEMPLATE = `Вопросы к редакции:
—
Поставить блокер:
—
Правки для фотореда/дизайнера:
—`;
const METHODICHKA_URL =
  "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994";
const CONTENT_FILTERS = {
  tables: { label: "Таблицы", default: true },
  screenshots: { label: "Скрины", default: true },
  images: { label: "Картинки", default: true },
  poll: { label: "Опрос", default: true },
  infographic: { label: "Инфографика", default: true },
  prodcard: { label: "Карточки товаров", default: true },
  shorts: { label: "Шорты", default: true },
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
      { _sortOrder: 2, text: "Тег noadscalctest" },
      { _sortOrder: 3, text: "В больших тестах под обложкой указан иллюстратор" },
    ],
    "Прочее": [
      { text: "В кайтене прикреплены ссылки на админку и конфиг" },
      { links: [{ label: "Методичка тесты", url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c" }] },
    ],
  },
  spending: {
    "Текст": [
      { _sortOrder: 1, text: "В начале статьи стоит плашка panel с абзацами p grade=\"secondary\"_" },
      { _sortOrder: 1, text: "У авторов стоят анонимные аватарки anonym_male у мужчин и anonym_female у женщин, автор стоит после оглавления" },
      { _sortOrder: 7, text: "Траты обозначены class=\"negative\"" },
      { _sortOrder: 7, text: "Доходы обозначены class=\"positive\"" },
      { _sortOrder: 2, text: "Все заголовки в дневниках трат кроме заголовков дней h2 level=\"2\"" },
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
    { text: "Опрос на месте, в нем предлоги приклеены к следующему слову, эмодзи отображаются корректно", feature: "poll" },
    { id: "editor-badge", text: "В конце материала стоит верная плашка телеграм-канала редакции" },
    { text: "Расставить поля, если нужно, они не стоят рядом с баннерами, анкетами, картинками и таблицами" },
    { text: "Все примечания редакторов в квадратных скобках, выделенные красным цветом, учтены: необходимые элементы добавлены и корректно отображаются, а служебные пометки удалены" },
    { text: "В шортах заполнен alt=\"\", заголовок h2 level=\"3\", текст внутри  p grade=\"medium\"", feature: "shorts", id: "shorts-alt-h2-p" },
    { text: "У карточек товаров есть картинка и название товара", feature: "prodcard" },
    { text: "У карточек-сеток отсутствует описание и бирка", feature: "prodcard" },
    { text: "Внутри тега <price> обязательно прописана цена товара. Знаки препинания внутрь тега <price> включаются по правилу ссылок (. ! ? :)", feature: "prodcard" },
    { text: "Если тег <price> стоит посреди текста, то скрываем название магазина через атрибут shop-hide=\"true\"", feature: "prodcard" },
    {
      text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точка, кроме последней, строчки отбиты <br/>", feature: "shorts",
      id: "shorts-list-format"
    },
  ],
  "Таблицы": [
    { text: "У таблицы есть заголовок" },
   { text: "У таблиц с <thead> есть атрибут sticky-header=\"true\"" },
    { text: "Красиво отрегулированы ширины: если текста много или колонок три и более, то их ширину можно растянуть. При этом ширина одной колонки не должна превышать 350 пикселей. Если текста мало, то колонки узкие" },
    { text: "Данные в ячейках выровнены по правилам", links: [{ label: "Методичка", url: "https://docs.google.com/document/d/1vUzQiyxHYyNmwbSonuSRvMOtjGmiTvuLn0gFNWlFzEI/edit?tab=t.0#heading=h.oddbhw32m71r/"  }]  },
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
    next[cat] = prev?.[cat] ?? false;
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
const renderTextWithLinks = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("*") && part.endsWith("*")) {
      return <strong key={i}>{part.slice(1, -1)}</strong>;
    }
    const match = part.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (match) {
      const [, label, url] = match;
      return (
        <a key={i} href={url} target="_blank" rel="noreferrer" className="inline-link">{label}</a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const PRESET_LABELS = {
  default: "Обычный", invest: "Инвест", shopping: "Шопинг", tests: "Тест",
  compare: "Сравнятор", spending: "Дневник трат", cd: "ЧД", shorts: "Шорты", ugc: "UGC",
};

function Workspace({
  dark, setDark, preset, setPreset, tasks, collapsed, toggleCollapse, toggle,
  contentFilters, setContentFilters, focusMode, setFocusMode, relevantTasks,
  visibleTasks, hiddenByFilters, progress, resetFiltersAndCheckboxes, hardReset,
  notes, setNotes, notesOpen, setNotesOpen, notesFabRef, notesPopoverRef, notesTextareaRef,
}) {
  const [activeCategory, setActiveCategory] = useState(() => Object.keys(tasks)[0]);
  const categories = Object.keys(tasks);
  const currentActiveCategory = categories.includes(activeCategory) ? activeCategory : categories[0];
  const completedHidden = Object.values(relevantTasks).flat().filter((task) => task.done).length;

  useEffect(() => {
    const categories = Object.keys(tasks);
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      const category = visible[0]?.target.dataset.category;
      if (category) setActiveCategory(category);
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    categories.forEach((category) => {
      const section = document.getElementById(`category-${category}`);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [tasks]);

  const categoryProgress = (category) => getCategoryProgress(relevantTasks, category);
  const scrollToCategory = (category) => {
    setActiveCategory(category);
    document.getElementById(`category-${category}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const changePreset = (event) => {
    localStorage.removeItem("checklist");
    localStorage.removeItem("collapsed");
    setPreset(event.target.value);
  };
  const enableAllFilters = () => setContentFilters(buildContentFilters());

  return (
    <div className={`app ${dark ? "app-dark" : ""}`}>
      <div className="app-frame">
        <header className="topbar">
        <div className="brand">
          <h1>Чек-лист проверки · {PRESET_LABELS[preset]}</h1>
          <p className="eyebrow">РЕДАКЦИЯ · ВЫПУСК СТАТЕЙ</p>
        </div>
        <div className="header-progress" aria-label={`Общий прогресс: ${progress.done} из ${progress.total}`}>
          <span className="progress-number">{progress.done}<small>/ {progress.total}</small></span>
          <div className="progress-track"><span style={{ width: `${progress.percent}%` }} /></div>
          <span className="progress-percent">{progress.percent}%</span>
        </div>
        <a className="method-link header-method-link" href={METHODICHKA_URL} target="_blank" rel="noreferrer">Методички ↗</a>
        <label className="format-control header-format-control"><span>ФОРМАТ</span><select aria-label="Формат" value={preset} onChange={changePreset}>
          {Object.entries(PRESET_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Переключить тему" onClick={() => setDark((value) => !value)}>
            {dark ? "☀" : "◐"}
          </button>
          <button className="icon-button reset-button" type="button" aria-label="Полный RESET" onClick={hardReset}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.4 7.1A6.2 6.2 0 1 1 4 12.2" /><path d="M4.4 3.8v3.7h3.7" /></svg>
            <span>Reset</span>
          </button>
        </div>
        </header>

        <div className="mobile-category-nav" aria-label="Разделы чек-листа">
        {Object.keys(tasks).map((category) => {
          const item = categoryProgress(category);
          return <button key={category} type="button" className={category === currentActiveCategory ? "active" : ""} aria-current={category === currentActiveCategory ? "true" : undefined} onClick={() => scrollToCategory(category)}>{category} <span>{item.done}/{item.total}</span></button>;
        })}
        <a className="method-link mobile-method-link" href={METHODICHKA_URL} target="_blank" rel="noreferrer">Методички ↗</a>
        </div>

        <div className="workspace">
        <aside className="sidebar">
          <section className="sidebar-progress" aria-label={`Прогресс в боковой панели: ${progress.done} из ${progress.total}`}>
            <div className="sidebar-progress-heading"><span className="progress-number">{progress.done}<small>/ {progress.total}</small></span><span className="progress-percent">{progress.percent}%</span></div>
            <div className="progress-track"><span style={{ width: `${progress.percent}%` }} /></div>
            <small className="autosave-label">Сохраняется автоматически</small>
          </section>
          <nav className="section-nav" aria-label="Разделы чек-листа">
            {Object.keys(tasks).map((category) => {
              const item = categoryProgress(category);
              return <button key={category} type="button" className={category === currentActiveCategory ? "active" : ""} aria-current={category === currentActiveCategory ? "true" : undefined} onClick={() => scrollToCategory(category)}>
                <span>{category}</span><small>{item.done}/{item.total}</small>
              </button>;
            })}
          </nav>
          <section className="sidebar-filters" aria-label="Фильтры контента">
            <h2>Что есть в материале</h2>
            <div className="filter-list">{Object.entries(CONTENT_FILTERS).map(([key, filter]) => <button key={key} type="button" className={contentFilters[key] ? "filter-chip active" : "filter-chip"} aria-pressed={contentFilters[key]} onClick={() => setContentFilters((value) => ({ ...value, [key]: !value[key] }))}>{filter.label}</button>)}</div>
            <div className="sidebar-filter-summary"><output data-testid="desktop-hidden-by-filters">Скрыто: {hiddenByFilters}</output><button type="button" onClick={enableAllFilters}>Включить все</button></div>
          </section>
          <button type="button" className="clear-button sidebar-clear-button" onClick={resetFiltersAndCheckboxes}>Снять отметки</button>
          <div className="desktop-focus">
            <button type="button" className={`focus-control ${focusMode ? "is-on" : ""}`} role="switch" aria-checked={focusMode} onClick={() => setFocusMode((value) => !value)}><span><b>Режим фокуса</b><small>{focusMode ? `вкл · скрыто ${completedHidden} готовых` : "выкл · показывать всё"}</small></span><i aria-hidden="true" /></button>
          </div>
        </aside>

        <main className="main-content">
          <section className="controls" aria-label="Настройки списка">
            <div className="format-heading"><span>Формат</span><strong>{PRESET_LABELS[preset]}</strong></div>
            <div className="filters-heading"><span>Контент</span><output data-testid="hidden-by-filters">Скрыто фильтрами: {hiddenByFilters}</output></div>
            <div className="filter-list">{Object.entries(CONTENT_FILTERS).map(([key, filter]) => <button key={key} type="button" className={contentFilters[key] ? "filter-chip active" : "filter-chip"} aria-pressed={contentFilters[key]} onClick={() => setContentFilters((value) => ({ ...value, [key]: !value[key] }))}>{filter.label}</button>)}</div>
            <button type="button" className="clear-button mobile-clear-button" onClick={resetFiltersAndCheckboxes}>Снять отметки</button>
          </section>

          <div className="task-sections">{Object.keys(tasks).map((category) => {
            const item = categoryProgress(category);
            return <section id={`category-${category}`} key={category} data-category={category} className={`task-section ${collapsed[category] ? "is-collapsed" : ""}`}>
              <button className="section-heading" type="button" aria-expanded={!collapsed[category]} aria-label={`Раздел ${category}`} onClick={() => toggleCollapse(category)}><span>{category}</span><small>{item.done}/{item.total}</small><i aria-hidden="true">⌄</i></button>
              {!collapsed[category] && <div className="task-list">{visibleTasks[category].map((task) => {
                const index = tasks[category].findIndex((saved) => saved.id === task.id);
                return <div className={`task-row ${task.done ? "is-done" : ""}`} key={`${category}-${task.id}`}>
                  <label className="checkbox-control"><input id={`${category}-${index}`} type="checkbox" aria-label={task.text || task.links?.map((link) => link.label).join(", ") || "Пункт чек-листа"} checked={task.done} onChange={() => toggle(category, index)} /></label>
                  <div className="task-copy">{task.text && <span>{renderTextWithLinks(task.text)}</span>}{task.links?.length > 0 && <span className="task-links">{task.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</span>}</div>
                </div>;
              })}{visibleTasks[category].length === 0 && <p className="empty-section">{focusMode && item.done ? "Все релевантные пункты выполнены" : "Нет пунктов для выбранных фильтров"}</p>}</div>}
            </section>;
          })}</div>
        </main>
        </div>
      </div>

      <div className="focus-dock"><button type="button" className={`focus-control ${focusMode ? "is-on" : ""}`} role="switch" aria-checked={focusMode} onClick={() => setFocusMode((value) => !value)}><span><b>Фокус</b><small>{focusMode ? `скрыто ${completedHidden} готовых` : "показывать всё"}</small></span><i aria-hidden="true" /></button></div>
      <div className="notes-fab-wrapper">
        {notesOpen && <div className="notes-window" ref={notesPopoverRef} data-testid="notes-popover"><div className="notes-title">Заметки <button type="button" aria-label="Закрыть заметки" onClick={() => setNotesOpen(false)}>×</button></div><div className="notes-actions"><button type="button" onClick={() => setNotes((value) => value.trim() ? value : NOTES_TEMPLATE)}>Вставить шаблон</button><button type="button" className="danger" onClick={() => setNotes("")}>Очистить</button></div><textarea ref={notesTextareaRef} aria-label="Заметки" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Заметки по ходу проверки" /></div>}
        <button className="notes-fab" type="button" ref={notesFabRef} aria-label="Открыть заметки" aria-expanded={notesOpen} onClick={() => setNotesOpen((value) => !value)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 5.5h12M4 10h12M4 14.5h7" /></svg></button>
      </div>
    </div>
  );
}
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
  const notesFabRef = useRef(null);
  const notesTextareaRef = useRef(null);
  const notesPopoverRef = useRef(null);
  const previousPresetRef = useRef(preset);
  useEffect(() => {
    document.documentElement.className = dark ? "dark" : "";
    const currentValue = localStorage.getItem("dark");
    if (currentValue !== String(dark)) {
      localStorage.setItem("dark", String(dark));
    }
  }, [dark]);
  useEffect(() => {
    // Legacy custom backgrounds are deliberately discarded without touching other data.
    localStorage.removeItem("bgImage");
  }, []);
  useEffect(() => {
    localStorage.setItem("preset", preset);
  }, [preset]);
  useEffect(() => {
    if (!notesOpen) return undefined;
    notesTextareaRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotesOpen(false);
    };
    const closeOnOutsideClick = (event) => {
      if (!notesPopoverRef.current?.contains(event.target) && !notesFabRef.current?.contains(event.target)) setNotesOpen(false);
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
    // Удаляем раздел "Прочее" для пресета "default"
    if (preset === "default" && clone["Прочее"]) {
      delete clone["Прочее"];
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
    if (previousPresetRef.current === preset) {
      return;
    }
    previousPresetRef.current = preset;
    // A format is a new checklist context: it intentionally resets completion and accordion state.
    setTasks(buildTasks(currentData));
    setCollapsed(buildCollapsed(currentData));
  }, [currentData, preset]);
  const toggle = useCallback((cat, index) => {
    setTasks((prev) => {
      const updated = prev[cat].map((t, i) => (i === index ? { ...t, done: !t.done } : t));
      return { ...prev, [cat]: updated };
    });
  }, []);
  useEffect(() => {
    // Accordion state follows task completion and therefore must be reconciled after a task update.
    const cats = Object.keys(tasks);
    const lastDoneCat = [...cats].reverse().find((cat) => tasks[cat]?.every((catTask) => catTask.done));
    if (!lastDoneCat) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed((prev) => {
      const next = { ...prev };
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
  // --- Reset: фильтры + чекбоксы (группа 2, частое использование) ---
  const resetFiltersAndCheckboxes = useCallback(() => {
    localStorage.removeItem("checklist");
    setContentFilters(buildContentFilters());
    setTasks(buildTasks(currentData));
  }, [currentData]);
  // --- Hard reset (группа 1, единоразовое) ---
  const hardReset = useCallback(() => {
    ["preset", "notes", "checklist", "collapsed", "contentFilters", "version"].forEach((key) =>
      localStorage.removeItem(key)
    );
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
  const relevantTasks = useMemo(() => getRelevantTasks(tasks, contentFilters), [tasks, contentFilters]);
  const visibleTasks = useMemo(() => getVisibleTasks(relevantTasks, focusMode), [relevantTasks, focusMode]);
  const hiddenByFilters = getHiddenByFiltersCount(tasks, relevantTasks);
  const { done: doneTasks, total: totalTasks, percent } = getOverallProgress(relevantTasks);
  return <Workspace
    dark={dark} setDark={setDark} preset={preset} setPreset={setPreset}
    tasks={tasks} collapsed={collapsed} toggleCollapse={toggleCollapse} toggle={toggle}
    contentFilters={contentFilters} setContentFilters={setContentFilters}
    focusMode={focusMode} setFocusMode={setFocusMode} relevantTasks={relevantTasks}
    visibleTasks={visibleTasks} hiddenByFilters={hiddenByFilters}
    progress={{ done: doneTasks, total: totalTasks, percent }}
    resetFiltersAndCheckboxes={resetFiltersAndCheckboxes} hardReset={hardReset}
    notes={notes} setNotes={setNotes} notesOpen={notesOpen} setNotesOpen={setNotesOpen}
    notesFabRef={notesFabRef} notesPopoverRef={notesPopoverRef} notesTextareaRef={notesTextareaRef}
  />;
}
