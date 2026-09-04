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
    Админка: [

          {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 4, text: "Нажата кнопка из сообщества" },
    ],
    Текст: [
      {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
    ],
  },
  ugc2: {
    Админка: [
      { _sortOrder: 1, text: "UGC-поток всегда собирается в паре с анкетой" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      {
        _sortOrder: 2,
        text: "Проверить, что выбран правильный поток и анкета",
      },

    ],
     Текст: [  {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
         {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
 ],
    Прочее: [
      {
        links: [
          {
            label: "Методичка по анкетам и потокам",
            url: "https://docs.google.com/document/d/1-qbPIiLOB7kh4dQM3CLrSbMIqyhow-VANpSrecqC9PE/edit?tab=t.0#heading=h.adqbxhdyb4xt",
          },
        ],
      },
    ],
  },
  ugc3: {
    Админка: [
      { _sortOrder: 1, text: "Основным потоком стоит поток Бесит" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      {
        _sortOrder: 2,
        text: "Затравка — от лица редакции, даже если автор статьи — наш редактор",
      },
      {
        _sortOrder: 3,
        text: "ОГ-описание: «Точка зрения читателя» или «Точка зрения читательницы»",
      },
     {
      text: "В out cтоит готовая обложка-заглушка out-hate-cap, поле «Обложка» оставляем пустым. Картинка mini — дублирует out. Опенграфы генерируем из out с затемнением и белым текстом.",
      links: [
        {
          label: "Памятка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/d1c51866-b3a8-48fd-8730-8eb83f40ae10",
        },
        ],
      },
   
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/tolpy-liudei-i-sueta-v-pvz-hate/",
          },
        ],
      },
    ],
  },
  ugc4: {
    Админка: [
      { _sortOrder: 1, text: "Основным потоком стоит поток Бесит" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      {
        _sortOrder: 3,
        text: "На ОГ-картинке отсутствует бирка «Бесит»",
      },
          {
      text: "В out cтоит готовая обложка-заглушка out-hate-cap, поле «Обложка» оставляем пустым. Картинка mini — дублирует out. Опенграфы генерируем из out с затемнением и белым текстом.",
      links: [
        {
          label: "Памятка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/d1c51866-b3a8-48fd-8730-8eb83f40ae10",
        },
        ],
      },
  
    ], 

      Текст: [
             {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
    ],
      Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/cinema-hate/",
          },
        ],
      },
    ],
  },
  ugc5: {
    Админка: [
      { _sortOrder: 1, text: "Основным потоком стоит поток Жалею" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      {
        _sortOrder: 2,
        text: "Затравка — от лица редакции (даже если автор статьи наш редактор)",
      },
      {
        _sortOrder: 3,
        text: "ОГ-описание: «История читательницы» или «История читателя»",
      },
      { _sortOrder: 4, text: "Обложка мини над заголовком" },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
    ],


     Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/regret-ne-obrashchala-vnimanie-na-zdorove/",
          },
        ],
      },
    ],
  },
  ugc6: {
    Админка: [
      { _sortOrder: 1, text: "Основным потоком стоит поток Мнения" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      {
        _sortOrder: 2,
        text: "Если материал новый, то автор — Редакция, читателю добавляем prop=\"additional\"",
      },
      {
        _sortOrder: 3,
        text: "Затравка — от лица редакции (даже если автор статьи наш редактор)",
      },
      {
        _sortOrder: 4,
        text: "ОГ-описание: «Взгляд читателя» или «Взгляд читательницы»/«Мысли читателя» или «Мысли читательницы»",
      },
      {
        _sortOrder: 7,
        text: "На ОГ-картинках добавлена бирка Мнение",
      },
      {
      text: "В out cтоит готовая обложка-заглушка opinion-cap, поле «Обложка» оставляем пустым. Картинка mini — дублирует out. Опенграфы генерируем из out с затемнением и белым текстом.",
      links: [
        {
          label: "Памятка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/d1c51866-b3a8-48fd-8730-8eb83f40ae10",
        },
        ],
      },
  
    ],

      Текст: [
       {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример мнение из коммента",
            url: "https://t-j.ru/rich-is-not-money-opinion/",
          },
          {
            label: "Пример мнение из поста",
            url: "https://t-j.ru/beregite-sebia-druzia-opinion/",
          },
        ],
      },
    ],
  },
  ugc7: {
    Админка: [
      { _sortOrder: 1, text: "Основным потоком стоит поток Дискуссии" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      {
        _sortOrder: 2,
        text: "ОГ-описание: «Дискуссия Т—Ж» или «Дискуссия Учебника Т—Ж»",
      },
      {
        _sortOrder: 3,
        text: "На ОГ-картинках добавлена бирка «Дискуссия»",
      },
    ],

      Текст: [
             {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
 {_sortOrder: 0,
      text: "Не ставим плашку Сообщества", },
    ],
    Выпуск: [
      {
        _sortOrder: 1,
        text: "Перед публикацией материала на главной проверить, что в числе последних 5 материалов нет других дискуссий",
      },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/asit-otzivy/",
          },
        ],
      },
    ],
  },
  ugc8: {
    Админка: [
      { _sortOrder: 1, text: "Основным потоком стоит поток AMA" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 5, text: "Затравка от лица автора" },
      {
        _sortOrder: 3,
        text: "Обложка мини над заголовком, без подписи",
      },
    ],
    Текст: [
      {
        _sortOrder: 0,
        text: "Автор материала эксперт, но на верстке его не добавляем",
      },    
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
        {_sortOrder: 0,
      text: "Не ставим плашку Сообщества", },
    ],


    Выпуск: [
      { _sortOrder: 1, text: "Выпускаем в пятницу в 18:00 МСК" },
    ],
     Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/gbo-ama/",
          },
        ],
      },
    ],
  },
  ugc9: {
    Админка: [
      { _sortOrder: 1, text: "Основным потоком стоит поток AMA" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 2, text: "Затравка от лица автора" },
      {
        _sortOrder: 3,
        text: "Обложка мини над заголовком, без подписи",
      },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      { _sortOrder: 1, text: "Вопрос от читателя оформлен в бабл" },
      { _sortOrder: 2, text: "Ответ эксперта оформлен в бабл" },   
          {_sortOrder: 0,
      text: "Не ставим плашку Сообщества", },
    ],

    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/otvechaem-chto-s-musorom/",
          },
        ],
      },
    ],
  },
  ugc10: {
    Админка: [
      {
        _sortOrder: 1,
        text: "Главный поток Мне только спросить",
      },
      { _sortOrder: 2, text: "Автор материала — эксперт" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 3, text: "Затравка от лица автора" },
      {
        _sortOrder: 4,
        text: "Обложка мини над заголовком, без подписи",
      },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
            {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
      { _sortOrder: 1, text: "Ответ эксперта оформлен в бабл" },   
    ],
    
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/vopros-vrachu-ogranicheniya-posle-korrekcii-zreniya/",
          },
        ],
      },
    ],
  },
  ugc11: {
    Админка: [
      {
        _sortOrder: 1,
        text: "Главный поток Вопросы о дизайне и ремонте / Спросите о недвижимости",
      },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 3, text: "Автор материала — эксперт" },
      { _sortOrder: 4, text: "Затравка от редакции" },
      {
        _sortOrder: 5,
        text: "Обложка мини над заголовком без подписи",
      },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
               {
        _sortOrder: 0,
        text: "Без плашки сообщества, если подпись у читателя «спросил в Сообществе»",
      },
      { _sortOrder: 1, text: "Ответ эксперта оформлен в бабл" },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/kakoi-dom-postroit/",
          },
        ],
      },
    ],
  },
  ugc12: {
    Админка: [
      { _sortOrder: 1, text: "Главный поток Вопрос тренеру" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 3, text: "Автор материала — эксперт" },
      { _sortOrder: 4, text: "Затравка от редакции" },
      {
        _sortOrder: 5,
        text: "Обложка мини над заголовком без подписи",
      },
    ],
    Текст: [
               {
        _sortOrder: 0,
        text: "Без плашки сообщества, если подпись у читателя «спросил в Сообществе»",
      },
      { _sortOrder: 1, text: "Ответ эксперта оформлен в бабл" },
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {
        _sortOrder: 2,
        text: "В конце добавлен список из 3 статей, вводной предложение в стронге",
      },
    ],
  },
   Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/vopros-treneru-beg-plechi/",
          },
        ],
      },
    ],
  ugc13: {
    Админка: [
      { _sortOrder: 1, text: "Главный поток Письмо психологу" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 3, text: "Автор материала — читатель" },
      { _sortOrder: 4, text: "Затравка от лица редакции" },
      {
        _sortOrder: 5,
        text: "Обложка мини над заголовком без подписи",
      },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
               {
        _sortOrder: 0,
        text: "Без плашки сообщества, если подпись у читателя «спросил в Сообществе»",
      },
      { _sortOrder: 1, text: "Ответ эксперта оформлен в бабл" },
    ],
     Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/dear-therapist-problema-s-psikhikoi/",
          },
        ],
      },
    ],
  },
  ugc14: {
    Админка: [
      { _sortOrder: 1, text: "Главный поток Как воспитывать" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },

      { _sortOrder: 3, text: "Автор материала — эксперт" },
      { _sortOrder: 4, text: "Затравка от лица редакции" },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
               {
        _sortOrder: 0,
        text: "Без плашки сообщества, если подпись у читателя «спросил в Сообществе»",
      },
      { _sortOrder: 1, text: "Вопрос читателя оформлен в бабл" },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/vospitanie-nado-li-zastavliat-detei-chitat/",
          },
        ],
      },
    ],
  },
  ugc15: {
    Админка: [
      { _sortOrder: 1, text: "Главный поток Вопросы о карьере / Авторазбор" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 3, text: "Автор материала — эксперт" },
      { _sortOrder: 4, text: "Затравка от лица редакции" },
    ],
    Текст: [
               {
        _sortOrder: 0,
        text: "Без плашки сообщества, если подпись у читателя «спросил в Сообществе»",
      },
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      { _sortOrder: 1, text: "Ответ эксперта оформлен в бабл" },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи Авто",
            url: "https://t-j.ru/kak-sovremennye-dvigateli-avtomobilei-vosprimut-toplivo-evro-3/",
          },
        ],
      },
       {
        links: [
          {
            label: "Пример статьи Образование",
            url: "https://t-j.ru/career-question-kak-razvivatsia-v-usloviiakh-gonki/",
          },
        ],
      },
    ],
  },
  ugc16: {
    Админка: [
      {
        _sortOrder: 1,
        text: "В главном заголовке частица «ли» приклеена к предыдущему слову и отделена от следующего пробелом нулевой ширины",
      },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      {
        _sortOrder: 2,
        text: "Главный поток За и против",
      },
      { _sortOrder: 3, text: "Обложка без подписи" },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {
        _sortOrder: 2,
        text: "Комментарии читателей оформлены в цветные баблы: Для 👎, баблу добавляем атрибут surface=\"negative\"; Для 👍, баблу добавляем атрибут surface=\"positive\"",
      },
      { _sortOrder: 3, text: "Не ставим ссылки на поля" },
             {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
    ],
    
 Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/happiness-is-money-pros-cons/",
          },
        ],
      },
    ],
  },
  ugc17: {
    Админка: [
      { _sortOrder: 1, text: "Главный поток Доска почета" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {
        _sortOrder: 0,
        text: "Автор редакция, но на верстке автора не добавляем",
      },
       {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
      
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/weekly-comment-120726/",
          },
        ],
      },
    ],
  },

    ugc21: {
    Админка: [
      { text: "Облога мини над заголовком, подпись должна быть в «Дополнительно о статье», если ее нет — уточнить у фоторедактора" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
       {  _sortOrder: 1, text: "Главный поток Больше ни ногой / стоит съездить" },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {
        _sortOrder: 13,
        text: "В конце добавлен этаж с похожими материалами",
      },
       {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи Больше ни ногой",
            url: "https://t-j.ru/dont-go-ebeyty-lake/", 
          },
           {
            label: "Пример статьи Стоит съездить",
            url: "https://t-j.ru/must-see-zamok-garibaldi/", 
          },
        ],
      },
    ],
  },
  ugc18: {
    Админка: [
      { _sortOrder: 1, text: "Главный поток Доска почета" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
    ],
    Текст: [
      { _sortOrder: 0, text: "Подпись у героев с большой буквы (в подписи названия статей)" },
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {
        _sortOrder: 0,
        text: "Автор редакция, но на верстке автора не добавляем",
      },
       {_sortOrder: 0,
      text: "Проверить наличие плашки Сообщества",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/582d315f-8e48-4930-98b8-2f1243c664a9",
        },
      ],
    },
      {
        _sortOrder: 2,
        text: "Комментарии героев в баблах",
      },
 
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/best-comments-june-2026/",
          },
        ],
      },
    ],
  },
  ugc19: {
    Админка: [
      { _sortOrder: 1, text: "Главный поток Доска почета" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
    ],
    Текст: [
           {
        _sortOrder: 0,
        text: "Проверить, что автор или герой/герои статьи не находятся в бане",
      },
      {
        _sortOrder: 0,
        text: "Автор редакция, но на верстке автора не добавляем",
      },
      {
        _sortOrder: 2,
        text: "У подзаголовков бирка с position=\"bottom\"",
      },
      {
        _sortOrder: 13,
        text: "В конце добавлена плашка «Собираем бриллианты из Сообщества» (сниппет pnldimond)",
      },
    ],
    Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/may-superheroes-2026/",
          },
        ],
      },
    ],
  },
  ugc20: {
    Админка: [
      { _sortOrder: 1, text: "Главный поток Дневники трат" },
        {_sortOrder: 3,
      text: "Наличие тега скрытия баннеров рекламы, при необходимости",
      links: [
        {
          label: "Методичка",
          url: "https://tinkoffjournal.kaiten.ru/documents/d/47401677-0902-43a7-a182-8c025cd49d74",
        },
      ],
    },
      { _sortOrder: 2, text: "Обложка мини над загом" },
      {
        _sortOrder: 3,
        text: "Подпись к обложке: Фотографии — Ксения Михайлова",
      },
    ],
    Текст: [
      
      {
        _sortOrder: 0,
        text: "Автор редакция, но на верстке автора не добавляем",
      },
    ],
    Выпуск: [
      {
        _sortOrder: 1,
        text: "Перед публикацией голосовалки проверить, что все дневники уже вышли",
      },
    ],

       Прочее: [
      {
        links: [
          {
            label: "Пример статьи",
            url: "https://t-j.ru/diary-of-the-week-64/",
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
  ugc: {
    Текст: ["editor-badge"],
    Выпуск: ["authoradd"],
  },
  ugc2: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc3: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc4: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc5: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc6: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc7: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc8: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc9: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc10: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc11: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc12: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc13: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc14: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc15: {
    Текст: ["editor-badge"],
     Выпуск: ["authoradd"],
  },
  ugc16: {
    Текст: ["editor-badge", "aside"],
     Выпуск: ["authoradd"],
  },
  ugc17: {
    Текст: ["editor-badge",  "lead"],
     Выпуск: ["authoradd"],
  },
  ugc18: {
    Текст: ["editor-badge", "authordesc"],
     Выпуск: ["authoradd"],
  },
  ugc19: {
    Текст: ["editor-badge",],
     Выпуск: ["authoradd"],
  },
  ugc20: {
    Текст: ["editor-badge", "lead"],
     Выпуск: ["authoradd"],
  },
    ugc21: {
    Текст: ["editor-badge", "lead"],
     Выпуск: ["authoradd"],
  },
};
export const DATA = {
  Админка: [

    { _sortOrder: 0, text: "Проверить, что коллеги закрыли вкладку с визивигом" },
    { _sortOrder: 0, text: "Перенести мету из комментария в кайтене в админку" },
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
    { id: "authordesc", 
      text: "Подпись автора с маленькой буквы" },
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
    { id: "aside",
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
          url: "https://docs.google.com/document/d/1vUzQiyxHYyNmwbSonuSRvMOtjGmiTvuLn0gFNWlFzEI/edit?tab=t.0#heading=h.hqvrmuvld38v",
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
      id: "authoradd",
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
  ugc: "UGC (базовый)",

  ugc3: "Бесит — один автор (UGC)",
  ugc4: "Бесит — подборка (UGC)",
  ugc5: "Жалею (UGC)",
  ugc6: "Мнение (UGC)",
  ugc7: "Дискуссия (UGC)",
  ugc8: "АМА вопрос (UGC)",
  ugc9: "АМА ответ (UGC)",
  ugc10: "Вопрос—ответ: Медицинв (UGC)",
  ugc11: "Вопрос—ответ: Недвижимость (UGC)",
  ugc12: "Вопрос—ответ: Спорт (UGC)",
  ugc13: "Вопрос—ответ: Мозг (UGC)",
  ugc14: "Вопрос—ответ: Дети (UGC)",
  ugc15: "Вопрос—ответ: Авто / Образование (UGC)",
  ugc16: "За и Против: любая редакция (UGC)",
  ugc21: "Особый лонг / Тревел (UGC)",
  ugc17: "Комментарий недели (UGC)",
  ugc18: "Комментарий месяца (UGC)",
  ugc19: "Сообщники месяца (UGC)",
  ugc20: "Голосовалки за дневник трат (UGC)",
};
export const getPresetData = (preset) => {
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
