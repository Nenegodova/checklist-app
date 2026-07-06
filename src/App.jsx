import { useEffect, useState, useMemo } from "react";

const DATA_VERSION = "1.1";

const NOTES_TEMPLATE =
`Вопросы к редакции:

—

Вопросы к выпускающему:

—

Поставить блокер:

—

Правки для фотореда/дизайнера:

—`;

const CONTENT_FILTERS = {
  tables: {
    label: "Таблицы",
    default: true
  },
  screenshots: {
    label: "Скрины",
    default: true
  },
  images: {
    label: "Картинки",
    default: true
  },
  poll: {
    label: "Опрос",
    default: true
  },
  infographic: {
    label: "Инфографику",
    default: true
  }
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
      { text: "Заполнен тикер" }
    ]
  },
shopping: {
  "Админка": [
    { text: "Напоминание о пересчете цен" },
    { text: "Тег noads" }
  ],

    "Текст": [
      { text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точказапятая кроме последней" }
    ]
  },

  tests: {
    "Текст": [
      { text: "В мини-тестах автор и подпись стоят перед лидом" }
    ],

    "Админка": [
      { text: "В подвале больших тестов прописаны авторы и источники" },
      { text: "Тег *noadscalctest*" },
      { text: "В больших тестах под обложкой указан иллюстратор" }
    ],

    "Прочее": [
       { text: "В кайтене прикреплены ссылки на админку и конфиг" },
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
     "Текст": [
      { text: "В начале статьи стоит плашка с абзацами *p grade=”secondary”*"},
      { text: "У авторов стоят аноминмые аватарки anonym_male у мужчин и anonym_female у женщин, автор стоит после оглавления"},
      { text: "Траты обозначены *class=”negative”*" },
      { text: "Доходы обозначены *class=”positive”*" },
      { text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точказапятая кроме последней" },
      { text: "Все заголовки в дневниках трат кроме заголовков дней h2 level=”2”" },
    ],
    "Админка": [
      { text: "Нажата кнопка из сообщества" }
    ]
  },


      cd: {

     "Админка": [
      { text: "В классических ЧД нет подзага" },
      { text: "В подборке ЧД есть подзаг" },  
      { text: "Обложка с эмодзи с типом мейна «мини над заголовком»" },
      { text: "Редакция Что делать + тематическая" },
      { text: "Нажаты кнопки из сообщества и выбор редакции" },
      { text: "Обязательно указываем выдержку. В это поле дублируем текст из ог-описания" },
      { text: "В реальных вопросах проверяем наличие технического *тега noadswhattodo* (скрывает некоторые рекламные баннеры). Если его нет, то добавляем. В выдуманных проставляем тег вместе с другими. Если в статье присутствуют фичеры (калькуляторы, тесты), то добавляем еще один технический тег: *feature-out.* Для опросов этот тег не нужен" },
      { text: "В классических ЧД цвет фона для обложек #2c2c2" },
      { text: "В подборке ЧД основной заг начинается со слов «Что делать, если:" },
      { text: "В подборке ЧД url статьи всегда начинается с префикса «ask-»" },   
      { text: "В классических ЧД цвет фона для обложек #2c2c2" },
      { text: "В подборке ЧД на обложке ОГ по три эмодзи" }, 
    ],
    "Текст": [
      { text: "В классических ЧД нет лида" },
      { text: "В подборке ЧД есть лид" },   
      { text: "Есть автор вопроса и вопрос в плашке с *isbuble=”true”*" },
      { text: "Есть автор ответа" },
      { text: "В классических ЧД писание автора вопроса «спросил в Сообществе»/«спросила в Сообществе»" },
      { text: "В классических ЧД заголовки *h2 level=”2”*" },
      { text: "В подборке ЧД заголовки *h2*" },  
      { text: "В подборке ЧД у каждого вопроса стоит бирка с эмодзи" },  
      { text: "Если в конце статьи стоит список статей: вводное предложение выделяем болдом, для вводного предложения и списка используем шифт с grade=”large”" },
      { text: "В микро ЧД ответ на вопрос в плашке" },
      { text: "В микро ЧД есть utm-метки у ссылок на внутренние статьи" },
      { text: "В микро ЧД автор ответа с подписью «нашел ответ»/«нашла ответ»" }
    ],
     "Прочее": [
      { text: "Если материал сверстан в старом вопросе автора и нужно выпустить с новым урлом, то обязательно после публикации нужно настроить редирект. " },
      { text: "Проверить комментарии редактора на наличие нового url. Если комментария нет, то выпускаем со старым урлом и редирект делать не нужно" },
      { text: "В случае, когда после выпуска меняется обложка, пишем в тематическом чате соответствующей редакции и чате «Т–Ж + соцсети», что поменялась облога, прикладываем ссылку на статью и новую обложку" }
    ],
  },
          shorts: {
  "Админка": [
      { text: "Проставлен *тег noadsshort*" },
      { text: "Среди потоков добавлены «Шорты», но не основным потоком" },
      { text: "Формат — шорты" },
      { text: "Нажата кнопка из сообщества и выбор редакции если вторая редакция UGC" },
      { text: "Обложка внутри статьи отсутствует" },
      { text: "Источник фото в подвале" }
    ],
  "Текст": [
     { text: "Подводка размещаются в теге *p grade=”secondary”*, если она слишком длинная, то часть скрывается под кат" },
      { text: "Оглавление стоит перед карточками-тайлами"},
       { text: "У текста внутри шортов *grade=”medium”*"},
      { text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точказапятая кроме последней" },
      { text: "В заголовке нет эмодзи, если в карточке есть картинка"},
      { text: "Для картинки-обтравки добавлен атрибут *image_style=”picture”*"},
      { text: "В последней карточке, если это не рассылка, добавлена иконка потока или Telegram, в заголовке этой карточки нет эмодзи. В шортах иконки со скруглёнными углами"},
      { text: "Проверить у ссылки на анкету наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_anketa, вместо стандартного. Исключение — анкеты спорта"},
      { text: "Проверить у ссылки на курс наличие хвоста, если его нет, запросить у редактора"},  
      { text: "Проверить у ссылки на статью или поток наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_button"},
      { text: "В дискрипшен под последней карточкой вынесена информация об актуальности цен и ценах в валюте (поскольку не используем тултипы), источниках данных, метках об иноагентах и т. д."},
      { text: "Дискрипшн находится внутри *<tiles></tiles>*."},
      { text: "Дескрипшн внутри тега *p grade=”small”*"},
      { text: "У списка в конце шортов *p grade=”secondary”*"},
      { text: "Список в конце шортов из 3–4 ссылок выстроен «лесенкой» если позволяет смысл. Вводное предложение — без жирного выделения" }
    ],

    "Прочее": [
      {
        links: [
          {
            label: "Методичка шорты",
            url: "https://docs.google.com/document/d/1jrBvNKW0AVHAPY4ogI-4i3GEoqIbfiN1TIIuk4fwdig/edit?tab=t.0"
          }
        ]
      }
    ]
  },
        ugc: {
   "Админка": [
      { text: "Нажата кнопка из сообщества" }
    ]
  },
};

const DATA = {
  "Админка": [
    { text: "Проверить подзаголовок, слаг, редакции, теги, потоки, формат, вопрос к читателям, нож (в тюнах), мету, ог-описание, краткий заг" },
    { text: "Проверить правильность формата" },
    { text: "Ог-заг = заголовок статьи" },
    { text: "Проверить скрытие" },
    { text: "Все необходимые обложки загружены, стоит верный размер обложки внутри статьи, подпись к обложке в нужном месте (под обложкой/в подвале), актуальность текста, наличие бирки, 1текст на ОГ оттипирован (проставлены склейки),18+ не обрезается на ОГ)" },
    { text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие" },
    { text: "Проверить автора обложки или источники" },
         {
      links: [
        {
          label: "Иноагенты и прочие враги в подвале",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/05e4af49-d4af-433d-a183-528ac0d4da1a"
        }
      ]
    },
  ],

  "Текст": [
    { text: "Проверить метку разметка, если есть доп. авторы" },
    { text: "Подпись автора с маленькой буквы" },
    { text: "Лид на месте, в конце точка" },
    { text: "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать" },
    { text: "Везде проставлены верные уровни заголовков (*h2*, *h2 level=”2”*, *h3* для плашек)"  },
    { text: "После эмодзи в загах пробел" },
     { text: "Не потеряны inset/example/details" },
    { text: "Внутри склеяны *&nbsp;* слова с частицами бы, же, ли; предлоги при, про, над, под, для, вне, обо, без; числа, которые идут после того, что считаем (минут 15, iPhone 16), аббревиатуры-дополнения (страны ЕС, ставка ЦБ, Витамин C)" },
    { text: "Поправить типографирование: м², а не м2, 1/2, а не ½" },
    { text: "Предлог, точка, восклицательный, вопросительный знак, двоеточие в ссылках, запятые вне ссылок" },
    { text: "Точки в сервисных плашках отсутствуют" },
    { text: "Между *<nobr></nobr>* нет лишних пробелов" },
    { text: "Нет пустых атрибутов" },
    { text: "UTM метки отсутствуют" },
    { text: "У первого валютного фичера тултип" },
    { text: "Тултип не стоит рядом с ссылкой" },
    { text: "У всех тултипов правильный *align* (=”center” если далее есть знак препинания, =”left” если нет занка препинания)" },
    { text: "Проверить списки: болды с точказапятыми с маленькой буквы, цифры с большой буквы и точки" },
    { text: "У плашек с авторами стоит *hl isbubble=”true”*" },
    { text: "Опрос на месте, в нем все склеено" ,
  feature: "poll"
},
    { text: "Верная плашка редакции" },
    {
      text: "Мягкий перенос в заге",
      links: [
        { label: "Символы", url: "https://symbl.cc/ru/00AD/" },
        { label: "Правила", url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe" }
      ]
    },

    { text: "Ссылки на месте и не выдают ошибку 404" },
    { text: "Расставить рекламные поля если нужно, они не должны стоять рядом с баннерами, анкетами, картинками и таблицами" },
    { text: "Проверить виджеты, фичеры, баннеры, этажи" }
  ],

  "Таблицы": [
    { text: "Структура таблицы не нарушена" },
    { text: "Красиво отрегулированы ширины (нет колонок шире 370px, на вьюпорте больше 1400px отстутвует горизонтальный скролл у таблицы)" },
    { text: "Выравнивание по левому краю если: числа не сравниваются между собой, а используются как обозначение или порядковый номер, в колонке есть диапазоны, в колонке смешаны разные единицы измерения, в колонке используются валютные фичеры (в том числе есть ячейки с ним, а есть без него), в части ячеек есть дополнительные слова или символы, в некоторых ячейках нет числовых значений" },
    { text: "Если нужно внутри стоят *<br/>* (два подряд <br/> не используем для дополнительных отступов) и •" },
    { text: "Проверить необходимость сортировки таблицы в числовом порядке строк (от большего к меньшему)" }
  ],

  "Картинки": [
    { 
  text: "Сверить с доком все картинки и подписи к ним",
  feature: "images"
},
    { text: "Источники под фотками заменены на ©" ,
  feature: "images"
},
    { text: "Фоторамы нужного размера" ,
  feature: "images"
},
    { text: "Скрины ретиновые и чистые, текст читаем, соблюдены поля, проставлен *prop=”bordered”* если фон сливается с фоном страницы" ,
  feature: "screenshots"
},
    { text: "Проверить необходимость *prop=”bordered”* у видео" ,
  feature: "images"
},
    { text: "Для инфографики проставлен *prop=”bordered rounded”*" ,
  feature: "infographic"
},
    { text: "В подписе к инфографике есть Источник: " ,
  feature: "infographic"
},
    { text: "Проверить есть ли засветы или вотермарки на картинках от фотореда" ,
  feature: "images"
},
    { text: "При необхоимости заблюрены все персональные данные" ,
  feature: "images"
}
  ],

"Прочее": [
  { text: "Проверить метку в кайтене об обновлении" },
  { text: "Проверить комментарии в кайтене" },
  { text: "Проверить комментарии редактора и фотореда в гугл-док" },
  { text: "В кайтен прикрепить ссылки на драфт и опенграф-картинку" },
  { text: "После выпуска проверить материал на главной" },
  { text: "В ссылке шаблона гугл⁠⁠-⁠⁠дока для копирования */edit* заменен на */copy.*" },
  {
    links: [
      {
        label: "Методички общие",
        url: "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994"
      }
    ]
  }
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
  text:
    typeof t === "string"
      ? t
      : t.text,

  links:
    typeof t === "string"
      ? []
      : t.links || [],

  feature:
    typeof t === "string"
      ? null
      : t.feature || null,

  done: false
}));
  });

  return initial;
};


const readStorageJSON = (key) => {
  const value = localStorage.getItem(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(
      `Повреждены данные localStorage: ${key}`,
      error
    );

    localStorage.removeItem(key);

    return null;
  }
};

export default function App() {
  const [dark, setDark] = useState(false);

  const [preset, setPreset] = useState(() => {
    return localStorage.getItem("preset") || "default";
  });
const [contentFilters, setContentFilters] = useState(() => {
  const saved =
    readStorageJSON("contentFilters");

  return (
    saved ||
    buildContentFilters()
  );
});

  const [focusMode, setFocusMode] = useState(false);

  const [notes, setNotes] = useState(() => {
    return localStorage.getItem("notes") || "";
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
  const saved = readStorageJSON("checklist");

  if (savedVersion !== DATA_VERSION) {
    localStorage.removeItem("checklist");
    localStorage.removeItem("collapsed");
    localStorage.setItem("version", DATA_VERSION);

    return buildTasks(currentData);
  }

  if (saved) {
    return saved;
  }

  return buildTasks(currentData);
});

const [collapsed, setCollapsed] = useState(() => {
const saved =
  readStorageJSON("collapsed");

  if (saved) {
return saved;
  }

  return buildCollapsed(currentData);
});
  // sync preset
  useEffect(() => {
    localStorage.setItem("preset", preset);
  }, [preset]);

  useEffect(() => {
  localStorage.setItem(
    "contentFilters",
    JSON.stringify(contentFilters)
  );
}, [contentFilters]);

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

  feature:
    typeof t === "string"
      ? null
      : t.feature || null,

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
    "contentFilters",
    "version"
  ].forEach((key) => {
    localStorage.removeItem(key);
  });

  localStorage.setItem(
    "version",
    DATA_VERSION
  );

  setPreset("default");
  setContentFilters(
  buildContentFilters()
);
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

 const isMobile = window.innerWidth < 900;
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
{/* HEADER FIXED */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 24,
    marginBottom: 24
  }}
>


          
   <div
  style={{
    flex: "1 1 320px"
  }}
>
  <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: title }}>
    Чек-лист проверки
  </h1>

  <div style={{ marginTop: 6, fontSize: 13, color: mutedColor }}>
    {doneTasks}/{totalTasks} ({percent}%)
  </div>
</div>

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12,
    marginLeft: "auto",
    flex: "0 1 520px"
  }}
>

  <div
   style={{
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: isMobile ? "center" : "flex-end",
    width: "100%"
}}
  >
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

      <option value="cd">
      ЧД
    </option>

          <option value="shorts">
      Шорты
    </option>

      <option value="ugc">
      UGC
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

         <div
style={{
  marginTop: 14,
  display: "flex",
  flexDirection: "column",
  alignItems: isMobile ? "center" : "flex-end",
  width: "100%"
}}
>
<div
  style={{
    width: "100%",
    fontSize: 12,
    fontWeight: 600,
    color: mutedColor,
    marginBottom: 6,
    textAlign: "center"
  }}
>
  Контент
</div>

<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: isMobile ? "center" : "flex-end"
  }}
>
    {Object.entries(CONTENT_FILTERS).map(
      ([key, item]) => (
        <button
          key={key}
          type="button"
          onClick={() =>
            setContentFilters((prev) => ({
              ...prev,
              [key]: !prev[key]
            }))
          }
          style={{
            ...btn,

             height: 28,
  padding: "4px 10px",
  fontSize: 12,

            background:
              contentFilters[key]
                ? dark
                  ? "#2d3748"
                  : "#dbeafe"
                : dark
                  ? "#18181b"
                  : "#fff",

            color: textColor,

            fontWeight:
              contentFilters[key]
                ? 600
                : 400
          }}
        >
          {contentFilters[key]
            ? "✓ "
            : ""}
          {item.label}
        </button>
      )
    )}
  </div>
</div>
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
                {tasks[cat].map((task, i) => {

  if (
    (cat === "Таблицы" && !contentFilters.tables) ||
    (task.feature && !contentFilters[task.feature])
  ) {
    return null;
  }

  return (
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
                );
              })}
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
    gap: 8,
    marginBottom: 10
  }}
>
  <button
    onClick={() => {
      if (!notes.trim()) {
        setNotes(NOTES_TEMPLATE);
      }
    }}
    style={{
      padding: "6px 10px",
      borderRadius: 10,
      border: "none",

      background: dark
        ? "#27272a"
        : "#eef2f7",

      color: textColor,
      fontSize: 12,
      cursor: "pointer"
    }}
  >
    Вставить шаблон
  </button>

  <button
    onClick={() => setNotes("")}
    style={{
      padding: "6px 10px",
      borderRadius: 10,
      border: "none",

      background: dark
        ? "#3a1f1f"
        : "#fee2e2",

      color: dark
        ? "#fca5a5"
        : "#991b1b",

      fontSize: 12,
      cursor: "pointer"
    }}
  >
    Очистить
  </button>
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
  



