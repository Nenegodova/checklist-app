export const DATA_VERSION = "1.2";
export const NOTES_TEMPLATE = `Вопросы к редакции:
—
Поставить блокер:
—
Правки для фотореда/дизайнера:
—`;
export const METHODICHKA_URL =
  "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994";
export const CONTENT_FILTERS = {
  tables: { label: "Таблицы", default: true },
  screenshots: { label: "Скрины", default: true },
  images: { label: "Картинки", default: true },
  poll: { label: "Опрос", default: true },
  infographic: { label: "Инфографика", default: true },
  prodcard: { label: "Карточки товаров", default: true },
  shorts: { label: "Шорты", default: true },
};
export const buildContentFilters = () => {
  const result = {};
  Object.entries(CONTENT_FILTERS).forEach(([key, value]) => {
    result[key] = value.default;
  });
  return result;
};
const PRESETS = {
  default: {},
  invest: {
    Админка: [
      { _sortOrder: 6, text: "Заполнено краткое описание" },
      { _sortOrder: 3, text: "Заполнен тикер" },
    ],
  },
  shopping: {
    Админка: [
      {
        _sortOrder: 4,
        text: "В подвале стоит: Цены действительны на момент публикации",
      },
    ],
    Текст: [
      {
        _sortOrder: 17,
        text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точка, кроме последней, отбиты <br/>",
      },
    ],
  },
  tests: {
    Текст: [
      {
        _sortOrder: 0,
        text: "В мини⁠-⁠тестах автор и подпись стоят перед лидом",
      },
      { _sortOrder: 6, text: "Внутри конфига есть все необходимые склейки" },
    ],
    Админка: [
      { _sortOrder: 2, text: "Тег noadscalctest" },
      {
        _sortOrder: 3,
        text: "В больших тестах под обложкой указан иллюстратор",
      },
    ],
    Прочее: [
      { text: "В кайтене прикреплены ссылки на админку и конфиг" },
      {
        links: [
          {
            label: "Методичка тесты",
            url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c",
          },
        ],
      },
    ],
  },
  spending: {
    Текст: [
      {
        _sortOrder: 1,
        text: 'В начале статьи стоит плашка panel с абзацами p grade="secondary"',
      },
      {
        _sortOrder: 1,
        text: "Если у автора нет аватарки, то стоят анонимные: anonym_male у мужчин и anonym_female у женщин, автор стоит после оглавления",
      },
      {
        _sortOrder: 3,
        text: "Сокращения имен (Р., И. и прочие) в начале и конце предложения приклеены к следующему/предыдущему слову в предложении",
      },
      {
        _sortOrder: 3,
        text: "Эмодзи в конце предложения приклеены к предыдущему слову",
      },
      { _sortOrder: 7, text: 'Траты обозначены class="negative"' },
      { _sortOrder: 7, text: 'Доходы обозначены class="positive"' },
      {
        _sortOrder: 2,
        text: 'Все заголовки в дневниках трат кроме заголовков дней h2 level="2"',
      },
    ],
    Админка: [
      { _sortOrder: 4, text: "Нажата кнопка из сообщества" },
      {
        _sortOrder: 5,
        text: "Подпись к обложке: Фотография — Ксения Михайлова",
      },
    ],
    Выпуск: [
      {
        _sortOrder: 4,
        text: "После выпуска прикрепить в кайтене ссылку на материал и меин-картинку",
      },
    ],
  },
  cd: {
    Админка: [
      { _sortOrder: 0, text: "В классических ЧД нет подзага" },
      { _sortOrder: 0, text: "В подборке ЧД есть подзаг" },
      {
        _sortOrder: 5,
        text: "Обложка с эмодзи с типом мейна «мини над заголовком»",
      },
      { _sortOrder: 4, text: "Редакция Что делать + тематическая" },
      {
        _sortOrder: 4,
        text: "Если вопрос уже существующий, то редакции Что делать + UGC",
      },
      {
        _sortOrder: 4,
        text: "Если вопрос уже существующий и нет метки «Обновляем сами», то сначала снимаем его с публикации",
      },
      { _sortOrder: 2, text: "Нажаты кнопки из сообщества и выбор редакции" },
      {
        _sortOrder: 6,
        text: "Обязательно указываем краткое описание. В это поле дублируем текст из ог⁠-⁠описания",
      },
      {
        _sortOrder: 2,
        text: "Если статья 18+, бирка 18+ должна быть обязательно у ина и аута",
      },
      {
        _sortOrder: 6,
        text: "В реальных вопросах проверяем наличие технического_ тега noadswhattodo. В выдуманных проставляем тег вместе с другими. Если в статье присутствуют фичеры (калькуляторы, тесты), то добавляем еще один технический тег: feature⁠-⁠out. Для опросов этот тег не нужен",
      },
      {
        _sortOrder: 0,
        text: "В подборке ЧД основной заг начинается с о слов «Что делать, если:..»",
      },
      {
        _sortOrder: 0,
        text: "В подборке ЧД url статьи всегда начинается с префикса «ask⁠-»",
      },
      {
        _sortOrder: 5,
        text: "В классических ЧД цвет фона для обложек #2c2c2c",
      },
    ],
    Текст: [
      { _sortOrder: 0, text: "В классических ЧД нет лида" },
      { _sortOrder: 1, text: "В подборке ЧД есть лид" },
      { text: 'Есть автор вопроса и вопрос в плашке с isbuble="true"' },
      { _sortOrder: 2, text: "Есть автор ответа" },
      {
        _sortOrder: 3,
        text: "В классических ЧД написание автора вопроса «спросил в Сообществе»/«спросила в Сообществе»",
      },
      { _sortOrder: 3, text: "У автора вопроса стоит additional" },
      { _sortOrder: 5, text: "Проверить бирки над заголовками в Подборках ЧД" },
      {
        _sortOrder: 6,
        text: "В подборке ЧД у каждого вопроса стоит бирка с эмодзи",
      },
      {
        text: 'Если в конце статьи стоит список статей: вводное предложение выделяем болдом, для вводного предложения и списка используем шифт с p grade="large"',
      },
      { _sortOrder: 7, text: "В микро ЧД ответ на вопрос в плашке" },
      { text: "В микро ЧД есть utm⁠-⁠метки у с сылок на внутренние статьи" },
      {
        _sortOrder: 8,
        text: "В микро ЧД автор ответа с подписью «нашел ответ»/«нашла ответ»",
      },
    ],
    Выпуск: [
      {
        _sortOrder: 1,
        text: "Если материал сверстан в старом вопросе автора и нужно выпустить с новым url, то обязательно после публикации нужно настроить редирект",
      },
      {
        sortOrder: 2,
        text: "В случае, когда после выпуска меняется обложка, пишем в тематическом чате соответствующей редакции и чате «Т–Ж + соцсети», что поменялась обложка, прикладываем ссылку на статью и новую обложку",
      },
      {
        sortOrder: 2,
        text: "В подборках, после выпуска статьи с вопросами скрыты вопросы от поисковиков",
      },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Методичка ЧД",
            url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0",
          },
        ],
      },
    ],
  },
  shorts: {
    Админка: [
      { _sortOrder: 2, text: "Проставлен тег noadsshort" },
      {
        _sortOrder: 2,
        text: "Среди потоков добавлены «Шорты», но не основным потоком",
      },
      {
        _sortOrder: 2,
        text: "Нажата кнопка из сообщества и выбор редакции если вторая редакция UGC",
      },
      { _sortOrder: 3, text: "Обложка внутри статьи отсутствует" },
      { _sortOrder: 3, text: "Источник фото в подвале" },
    ],
    Текст: [
      {
        _sortOrder: 4,
        text: 'Подводка размещается в теге p grade="secondary", если она слишком длинная, то часть скрывается под кат',
      },
      { _sortOrder: 1, text: "Оглавление стоит перед карточками-тайлами" },
      { text: 'У текста внутри шортов grade="medium"' },
      {
        _sortOrder: 3,
        text: "В заголовке нет эмодзи, если в карточке есть картинка",
      },
      { text: 'Для картинки-обтравки добавлен атрибут image_style="picture"' },
      {
        text: "В последней карточке, если это не рассылка, добавлена иконка потока или Telegram, в заголовке этой карточки нет эмодзи. В шортах иконки со скруглёнными углами",
      },
      {
        text: "Проверить у ссылки на курс наличие хвоста, если его нет, запросить у редактора",
      },
      {
        text: "Проверить у ссылки на анкету наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_ankета, вместо стандартного. Исключение — анкеты спорта",
      },
      {
        text: "Проверить у ссылки на статью или поток наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_button",
      },
      {
        text: 'Дискрипшн находится внутри <tiles></tiles> и тега p grade="small".',
      },
      {
        text: "В дискрипшен под последней карточкой вынесена информация об актуальности цен и ценах в валюте (поскольку не используем тултипы), источниках данных, метках об иноагентах и т. д.",
      },
      { text: 'У списка в конце шортов p grade="secondary"' },
      {
        text: "Список в конце шортов из 3–4 ссылок выстроен «лесенкой» если позволяет смысл. Вводное предложение — без жирного выделения",
      },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Методичка шорты",
            url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0",
          },
        ],
      },
    ],
    Картинки: [
      {
        _sortOrder: 2,
        text: 'Для картинки-обтравки добавлен атрибут image_style="picture"',
        feature: "images",
      },
    ],
  },
  ugc: {
    Админка: [{ _sortOrder: 4, text: "Нажата кнопка из сообщества" }],
    Текст: [
      {
        _sortOrder: 2,
        links: [
          {
            label: "В текст добавлена актуальная плашка с ообщества",
            url: "https://docs.google.com/document/d/1U_YBVur4Rtjv5jEMY1Xas9Rr4TxdvenLlIBFbVxIBjg/edit?tab=t.0",
          },
        ],
      },
    ],
  },
};
const PRESET_EXCLUDES = {
  cd: {
    Текст: ["lead", "heading-levels", "editor-badge"],
    Админка: ["cover-author", "cover-type", "utm", "credit"],
  },
  shorts: {
    Текст: [
      "tooltip-link",
      "currency-tooltip",
      "lists-style",
      "utm",
      "shorts-alt-h2-p",
      "shorts-list-format",
    ],
  },
  spending: {
    Текст: [
      "lead",
      "spending-poll",
      "editor-badge",
      "shorts-alt-h2-p",
      "spending-card-title",
      "spending-card-description",
      "spending-card-price",
      "spending-card-shop-hide",
      "shorts-list-format",
    ],
  },
};
export const DATA = {
  Админка: [
    {
      _sortOrder: 0,
      text: "В заголовке проставлен мягкий перенос, если если он необходим",
      links: [
        { label: "Символы", url: "https://symbl.cc/ru/00AD/" },
        {
          label: "Правила",
          url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe",
        },
        {
          label: "Методичка",
          url: "https://docs.google.com/document/d/1UBwfR7TE3rSBF4VnxmXUl7K0hjow-y5Jct4hG1QTIsI/edit?tab=t.0#heading=h.z33ybfin6ltb",
        },
      ],
    },
    { text: "Проверить, что коллеги закрыли вкладку с визивигом" },
    { text: "Перенести мету из комментария в кайтене в админку" },
    {
      text: "Ог⁠⁠-⁠⁠заг = заголовок статьи, ОГ-описание на месте, текст на ОГ-картинке оттипографирован",
    },
    {
      text: "Нажать галочку скрыть из приложения банка, если материал 18+ (секс, алкоголь и т.д.)",
    },
    {
      _sortOrder: 4,
      text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие",
    },
    {
      links: [
        {
          label:
            "Пометка про иноагентов/экстремистов в инфоблоке оформлена корректно",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/05e4af49-d4af-433d-a183-528ac0d4da1a",
        },
      ],
    },
  ],
  Текст: [
    { text: "Подпись автора с маленькой буквы" },
    {
      id: "lead",
      text: "В начале статьи есть лид, в конце лида — знак окончания предложения (точка, вопросительный или восклицательный знак, многоточие)",
    },
    {
      text: "У заголовка оглавления нет знаков препинания в конце. Якорные ссылки в оглавлении ведут на нужные разделы",
    },
    {
      text: 'У сервисных плашек заголовок <h3> с атрибутом level="3" и в последнем предложении отсутствует точка',
    },
    {
      id: "heading-levels",
      text: 'Везде проставлены верные уровни заголовков (h2, h2 level="2", h3 для плашек)',
    },
    { text: "<nobr> стоит во всех кейсах из методички" },
    { text: "В коде статьи нет пустых атрибутов" },
    { text: "После эмодзи стоит пробел" },
    { text: "Поправить типографирование: м², а не м2, 1/2, а не ½" },
    {
      text: "Проверить ссылки: предлоги, точки, восклицательные, вопросительные знаки и двоеточия входят в ссылку, а запятые — нет",
    },
    {
      text: "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с запятой входят в <strong> и <mark>",
    },
    {
      text: "В ссылке шаблона гугл⁠-⁠дока для копирования /edit заменен на /copy.",
    },
    {
      id: "utm",
      text: "Поиском по коду найдены и удалены оставшихся у ссылок метки /?ysclid и https://google.com/",
    },
    {
      id: "currency-tooltip",
      text: 'У первого валютного фичера стоит тултип: "Суммы в рублях пересчитываются по актуальному курсу раз в день"',
    },
    { id: "tooltip-link", text: "Тултип не стоит рядом со ссылкой" },
    {
      id: "lists-style",
      text: "Проверить оформление списков: цифровые и кастомные — с большой буквы, в конце пунктов точки. Списки с буллитами — с маленькой буквы, в конце пунктов точка с запятой, у последнего пункта — точка",
    },
    {
      id: "spending-poll",
      text: "Опрос на месте, в нем предлоги приклеены к следующему слову, эмодзи отображаются корректно",
      feature: "poll",
    },
    {
      id: "editor-badge",
      text: "В конце материала стоит верная плашка телеграм-канала редакции",
    },
    {
      text: "Расставить поля, если нужно, они не стоят рядом с баннерами, анкетами, картинками и таблицами",
    },
    {
      text: "Все примечания редакторов в квадратных скобках, выделенные красным цветом, учтены: необходимые элементы добавлены и корректно отображаются, а служебные пометки удалены",
    },
    {
      text: 'В шортах заполнен alt="", заголовок h2 level="3", текст внутри  p grade="medium"',
      feature: "shorts",
      id: "shorts-alt-h2-p",
    },
    {
      id: "spending-card-title",
      text: "У карточек товаров есть картинка и название товара",
      feature: "prodcard",
    },
    {
      id: "spending-card-description",
      text: "У карточек-сеток отсутствует описание и бирка",
      feature: "prodcard",
    },
    {
      id: "spending-card-price",
      text: "Внутри тега <price> обязательно прописана цена товара. Знаки препинания внутрь тега <price> включаются по правилу ссылок (. ! ? :)",
      feature: "prodcard",
    },
    {
      id: "spending-card-shop-hide",
      text: 'Если тег <price> стоит посреди текста, то скрываем название магазина через атрибут shop-hide="true"',
      feature: "prodcard",
    },
    {
      text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точка, кроме последней, строчки отбиты <br/>",
      feature: "shorts",
      id: "shorts-list-format",
    },
  ],
  Таблицы: [
    { text: "У таблицы есть заголовок" },
    { text: 'У таблиц с <thead> есть атрибут sticky-header="true"' },
    {
      text: "Красиво отрегулированы ширины: если текста много или колонок три и более, то их ширину можно растянуть. При этом ширина одной колонки не должна превышать 350 пикселей. Если текста мало, то колонки узкие",
    },
    {
      text: "Данные в ячейках выровнены по правилам",
      links: [
        {
          label: "Методичка",
          url: "https://docs.google.com/document/d/1vUzQiyxHYyNmwbSonuSRvMOtjGmiTvuLn0gFNWlFzEI/edit?tab=t.0#heading=h.oddbhw32m71r/",
        },
      ],
    },
    {
      text: "Списки в таблицах оформлены по правилам",
      links: [
        {
          label: "Методичка",
          url: "https://docs.google.com/document/d/1vUzQiyxHYyNmwbSonuSRvMOtjGmiTvuLn0gFNWlFzEI/edit?tab=t.0#heading=h.d9k5whxwvw7i",
        },
      ],
    },
    {
      text: "Если в таблице сравниваются числа, то строки отсортированы от большего к меньшему",
    },
  ],
  Картинки: [
    {
      text: 'Скрины ретиновые и без артефактов, текст читаем, соблюдены поля, проставлен prop="bordered", если фон сливается с фоном страницы',
      feature: "screenshots",
    },
    {
      text: 'Для инфографики проставлен prop="bordered rounded"',
      feature: "infographic",
    },
    {
      text: 'Если у инфографики есть подпись, то указан кредит "Источник:" ',
      feature: "infographic",
    },
    {
      text: "Проверить в кайтене наличие комментария от фотореда о размере картинок или фоторам",
      feature: "images",
    },
    {
      text: "Проверить, нет ли засветов или вотемармок на картинках от фотореда",
      feature: "images",
    },
    {
      text: "Если на скриншоте есть персональные данные, уточнить у редактора, нужно ли их заблюрить",
      feature: "images",
    },
    {
      text: 'Проверить необходимость prop="bordered" у видео',
      feature: "images",
    },
  ],
  Выпуск: [
    {
      text: "Проверить наличие метки «Разметка» в карточке кайтена, если есть доп. авторы",
    },
    {
      text: "Проверить комментарии в кайтене на наличие правок от редакторов и замен от фоторедов",
    },
    {
      text: "После выпуска прикрепить в кайтене ссылку на материал и опенграф-картинку",
    },
    {
      text: "При отложенной публикации в кайтене прикреплена ссылка на материал, проставлено время выпуска в заголовке карточки и в сроке выпуска",
    },
    {
      text: "После выпуска проверить материал на главной: все ли в порядке с обложкой, по правилам ли стоят переносы в заголовке",
    },
  ],
};

export const PRESET_LABELS = {
  default: "Обычный",
  invest: "Инвест",
  shopping: "Шопинг",
  tests: "Тест",
  compare: "Сравнятор",
  spending: "Дневник трат",
  cd: "ЧД",
  shorts: "Шорты",
  ugc: "UGC",
};

export const getPresetData = (preset) => {
  // Each preset starts from a fresh clone so format-specific sorting and exclusions never mutate the shared checklist.
  const clone =
    typeof structuredClone === "function"
      ? structuredClone(DATA)
      : JSON.parse(JSON.stringify(DATA));
  const presetData = PRESETS[preset];
  if (presetData) {
    Object.keys(presetData).forEach((cat) => {
      if (!clone[cat]) clone[cat] = [];
      const baseItems = clone[cat].map((item, i) => ({
        ...item,
        _sortOrder: item._sortOrder ?? i,
      }));
      const presetItems = presetData[cat].map((item) => ({
        ...item,
        _sortOrder: item._sortOrder ?? 9999,
      }));
      clone[cat] = [...baseItems, ...presetItems].sort(
        (a, b) => (a._sortOrder ?? Infinity) - (b._sortOrder ?? Infinity),
      );
    });
  } else {
    Object.keys(clone).forEach((cat) => {
      clone[cat] = clone[cat]
        .map((item, i) => ({ ...item, _sortOrder: item._sortOrder ?? i }))
        .sort(
          (a, b) => (a._sortOrder ?? Infinity) - (b._sortOrder ?? Infinity),
        );
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
  if (preset === "default" && clone["Прочее"]) delete clone["Прочее"];
  return clone;
};
