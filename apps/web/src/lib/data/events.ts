import type { EventPrice, OccurrenceStatus } from "$lib/types";

/**
 * Презентационные мок-данные каталога.
 *
 * Даты сеансов задаются смещением в днях от «сегодня» и материализуются
 * в абсолютные ISO-моменты при каждом запросе (см. ./index.ts), поэтому
 * афиша всегда выглядит актуальной. При подключении публичного API
 * этот модуль заменяется вызовами @city-events/api-client.
 */

export interface MockOccurrenceTemplate {
  /** Дней от сегодня по календарю города. */
  readonly day: number;
  readonly hour: number;
  readonly minute?: number;
  readonly durationMinutes?: number;
  readonly status?: OccurrenceStatus;
}

export interface MockEventTemplate {
  readonly slug: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly description: readonly string[];
  readonly categorySlug: string;
  readonly venueSlug: string | null;
  readonly organizerName: string | null;
  readonly organizerWebsite: string | null;
  /** Имя файла в static/images/seed/. */
  readonly image: string;
  readonly imageAlt: string;
  readonly price: EventPrice;
  readonly ageRestriction: number;
  readonly tags: readonly string[];
  readonly ticketUrl: string | null;
  readonly occurrences: readonly MockOccurrenceTemplate[];
}

/** Ежедневные сеансы с `fromDay` по `toDay` включительно — для выставок. */
function daily(
  fromDay: number,
  toDay: number,
  hour: number,
  durationMinutes: number
): readonly MockOccurrenceTemplate[] {
  return Array.from({ length: toDay - fromDay + 1 }, (_, index) => ({
    day: fromDay + index,
    hour,
    durationMinutes
  }));
}

export const EVENTS: readonly MockEventTemplate[] = [
  {
    slug: "gore-ot-uma",
    title: "Горе от ума",
    shortDescription:
      "Комедия Александра Грибоедова в постановке Театра-Театра — о свободе, любви и обществе, которое не готово меняться.",
    description: [
      "Знакомая со школы пьеса становится разговором о сегодняшнем дне. Чацкий возвращается в Москву и обнаруживает мир, где искренность неудобна, а перемены пугают. Спектакль соединяет классический текст, современную сценографию и живую музыку.",
      "Постановка сохраняет авторскую иронию, но делает героев ближе — их выборы узнаваемы, а конфликт между личной свободой и общественным ожиданием звучит особенно остро."
    ],
    categorySlug: "theatre",
    venueSlug: "teatr-teatr",
    organizerName: "Театр-Театр",
    organizerWebsite: "https://teatr-teatr.ru",
    image: "theatre.jpg",
    imageAlt: "Сцена театра в тёплом свете перед началом спектакля",
    price: { kind: "paid", from: 700, to: 2500, currency: "RUB" },
    ageRestriction: 16,
    tags: ["Классика", "Драма", "Премьера сезона"],
    ticketUrl: "https://teatr-teatr.ru",
    occurrences: [
      { day: 0, hour: 19, durationMinutes: 150 },
      { day: 1, hour: 18, durationMinutes: 150 },
      { day: 5, hour: 19, durationMinutes: 150 }
    ]
  },
  {
    slug: "evgeny-onegin",
    title: "Евгений Онегин",
    shortDescription:
      "Опера Петра Чайковского на сцене Пермского театра оперы и балета — история Татьяны и Онегина в классической постановке.",
    description: [
      "Лирические сцены по роману Пушкина — одна из самых бережных постановок пермской оперы. Письмо Татьяны, дуэль на рассвете и финальное объяснение звучат так, будто написаны сегодня.",
      "В оркестровой яме — симфонический оркестр театра, над партитурой работал главный дирижёр. Спектакль идёт с одним антрактом."
    ],
    categorySlug: "theatre",
    venueSlug: "opera",
    organizerName: "Пермский театр оперы и балета",
    organizerWebsite: "https://permopera.ru",
    image: "theatre.jpg",
    imageAlt: "Занавес оперного театра перед спектаклем",
    price: { kind: "paid", from: 800, to: 3500, currency: "RUB" },
    ageRestriction: 12,
    tags: ["Опера", "Чайковский", "Классика"],
    ticketUrl: "https://permopera.ru",
    occurrences: [
      { day: 2, hour: 19, durationMinutes: 195 },
      { day: 6, hour: 19, durationMinutes: 195 }
    ]
  },
  {
    slug: "muzyka-kino",
    title: "Музыка кино",
    shortDescription:
      "Симфонический оркестр филармонии играет саундтреки — от классики Голливуда до современного кино.",
    description: [
      "Программа собирает самые узнаваемые темы большого кино: оркестр проходит путь от эпических симфонических полотен до камерных мелодий, которые хочется напевать.",
      "Каждый номер сопровождается короткой историей фильма — ведущий рассказывает, как музыка меняла сцены и судьбы героев."
    ],
    categorySlug: "concerts",
    venueSlug: "philharmonic",
    organizerName: "Пермская краевая филармония",
    organizerWebsite: null,
    image: "concerts.jpg",
    imageAlt: "Симфонический оркестр на сцене концертного зала",
    price: { kind: "paid", from: 500, to: 1500, currency: "RUB" },
    ageRestriction: 6,
    tags: ["Симфонический оркестр", "Саундтреки"],
    ticketUrl: null,
    occurrences: [{ day: 1, hour: 19, durationMinutes: 120 }]
  },
  {
    slug: "jazz-nad-kamoy",
    title: "Джаз над Камой",
    shortDescription:
      "Вечер инструментального джаза: пермские музыканты и гости из Екатеринбурга в камерном зале филармонии.",
    description: [
      "Два сета без паузы на формальности: стандарты, собственные композиции и свободная импровизация. Сцена собирается близко к залу — слышно дыхание инструментов.",
      "Во втором отделении — джем: музыканты зовут на сцену всех, кто пришёл со своим инструментом."
    ],
    categorySlug: "concerts",
    venueSlug: "philharmonic",
    organizerName: "Пермская краевая филармония",
    organizerWebsite: null,
    image: "concerts.jpg",
    imageAlt: "Джазовый квартет в приглушённом свете сцены",
    price: { kind: "paid", from: 800, to: 1800, currency: "RUB" },
    ageRestriction: 12,
    tags: ["Джаз", "Вечерняя программа"],
    ticketUrl: null,
    occurrences: [
      { day: 8, hour: 20, durationMinutes: 130 },
      { day: 15, hour: 20, durationMinutes: 130, status: "cancelled" }
    ]
  },
  {
    slug: "permskie-bogi",
    title: "Пермские боги",
    shortDescription:
      "Деревянная скульптура XVII–XIX веков из собрания художественной галереи — лица, которые веками смотрели на Прикамье.",
    description: [
      "«Пермские боги» — визитная карточка галереи: резные фигуры Христа и святых, созданные северными мастерами без имени. Их называют пермской иконой в дереве.",
      "Экспозиция заново собрана после реставрации: при свете дня видны следы резца, а аудиогид рассказывает, как скульптуры спасали от огня и забвения."
    ],
    categorySlug: "exhibitions",
    venueSlug: "gallery",
    organizerName: "Пермская художественная галерея",
    organizerWebsite: null,
    image: "exhibitions.jpg",
    imageAlt: "Зал художественной галереи с деревянной скульптурой",
    price: { kind: "paid", from: 300, to: null, currency: "RUB" },
    ageRestriction: 0,
    tags: ["Деревянная скульптура", "Постоянная экспозиция"],
    ticketUrl: null,
    occurrences: daily(0, 13, 11, 540)
  },
  {
    slug: "gorod-i-zavod",
    title: "Город и завод",
    shortDescription:
      "Фотовыставка в PERMM о промышленной Перми: сто лет заводских корпусов, мастеровых и городского неба.",
    description: [
      "Архивные снимки начала XX века встречаются с работами современных фотографов: одни и те же цеха, улицы и дворы, снятые с разницей в сто лет.",
      "Кураторские экскурсии — по выходным, вход по билету на выставку."
    ],
    categorySlug: "exhibitions",
    venueSlug: "permm",
    organizerName: "Музей современного искусства PERMM",
    organizerWebsite: null,
    image: "exhibitions.jpg",
    imageAlt: "Чёрно-белые фотографии заводских корпусов на стене музея",
    price: { kind: "paid", from: 200, to: 400, currency: "RUB" },
    ageRestriction: 12,
    tags: ["Фотография", "Индустриальное наследие"],
    ticketUrl: null,
    occurrences: daily(1, 14, 12, 480)
  },
  {
    slug: "noch-v-muzee",
    title: "Ночь в музее",
    shortDescription:
      "Краеведческий музей открывает залы после закрытия: экспозиция при свечах, тихие экскурсии и чай в атриуме.",
    description: [
      "Раз в сезон музей гасит верхний свет и включает лампы: пермская старина выглядит иначе, когда за окнами темно. Волонтёры рассказывают истории экспонатов, которые не попали в аудиогид.",
      "Вход свободный, по регистрации — количество мест ограничено."
    ],
    categorySlug: "exhibitions",
    venueSlug: "museum",
    organizerName: "Пермский краеведческий музей",
    organizerWebsite: null,
    image: "exhibitions.jpg",
    imageAlt: "Музейный зал вечером в тёплом свете ламп",
    price: { kind: "free" },
    ageRestriction: 6,
    tags: ["Бесплатно", "Для всей семьи"],
    ticketUrl: null,
    occurrences: [
      { day: 9, hour: 18, durationMinutes: 300 },
      { day: 10, hour: 18, durationMinutes: 300, status: "postponed" }
    ]
  },
  {
    slug: "stalker",
    title: "Показ и обсуждение: «Сталкер»",
    shortDescription:
      "Киноклуб PERMM смотрит «Сталкера» Тарковского и спорит о Зоне, вере и самом долгом пути в комнату.",
    description: [
      "Показ в оригинальной хронометражной версии с одним техническим перерывом. После фильма — обсуждение с кинокритиком: почему «Сталкер» снят под Пермью и что здесь было до нас.",
      "Киноклуб работает в формате открытого разговора — можно просто слушать."
    ],
    categorySlug: "cinema",
    venueSlug: "permm",
    organizerName: "Музей современного искусства PERMM",
    organizerWebsite: null,
    image: "cinema.jpg",
    imageAlt: "Зрители в кинозале перед началом показа",
    price: { kind: "paid", from: 350, to: null, currency: "RUB" },
    ageRestriction: 18,
    tags: ["Киноклуб", "Тарковский"],
    ticketUrl: null,
    occurrences: [{ day: 4, hour: 20, durationMinutes: 180 }]
  },
  {
    slug: "buratino",
    title: "Приключения Буратино",
    shortDescription:
      "Кукольный спектакль по сказке Толстого: Дуремар, Мальвина и золотой ключик — в двух действиях для всей семьи.",
    description: [
      "Классическая история о деревянном человечке, который учится дружбе и храбрости. Куклы сделаны в мастерских театра, декорации меняются на глазах у зрителей.",
      "После спектакля дети могут заглянуть за кулисы и попробовать управлять куклой."
    ],
    categorySlug: "kids",
    venueSlug: "puppet",
    organizerName: "Пермский театр кукол",
    organizerWebsite: null,
    image: "kids.jpg",
    imageAlt: "Куклы на сцене детского театра",
    price: { kind: "paid", from: 400, to: 800, currency: "RUB" },
    ageRestriction: 0,
    tags: ["Кукольный спектакль", "Для детей"],
    ticketUrl: null,
    occurrences: [
      { day: 1, hour: 12, durationMinutes: 90 },
      { day: 8, hour: 12, durationMinutes: 90 }
    ]
  },
  {
    slug: "zveri-prikamya",
    title: "Звери Прикамья",
    shortDescription:
      "Мастер-класс в зоопарке: кто живёт в наших лесах, чем пахнет тайга и как правильно кормить коз.",
    description: [
      "Зоологи показывают следы, шерсть и корма, рассказывают, как звери готовятся к зиме. В конце — контактный дворик и кормление обитателей.",
      "Встречаемся у центрального входа зоопарка, группа до 15 человек."
    ],
    categorySlug: "kids",
    venueSlug: "zoo",
    organizerName: "Пермский зоопарк",
    organizerWebsite: null,
    image: "kids.jpg",
    imageAlt: "Дети у вольера с козами в зоопарке",
    price: { kind: "paid", from: 300, to: null, currency: "RUB" },
    ageRestriction: 0,
    tags: ["Мастер-класс", "Животные"],
    ticketUrl: null,
    occurrences: [{ day: 1, hour: 11, durationMinutes: 120 }]
  },
  {
    slug: "perm-begovaya",
    title: "Пермь беговая: утренний забег",
    shortDescription:
      "Пять километров по набережной в спокойном темпе: разминка, забег и кофе на финише. Без секундомеров и давления.",
    description: [
      "Открытая городская тренировка для всех, кто хочет начать бегать или побегать в компании. Пейсмейкеры ведут группы от 5:30 до 8:00 мин/км.",
      "Старт и финиш — на Эспланаде. Участие бесплатное, регистрация на месте за 20 минут до старта."
    ],
    categorySlug: "sport",
    venueSlug: "esplanade",
    organizerName: "Городской лекторий",
    organizerWebsite: null,
    image: "sport.jpg",
    imageAlt: "Бегуны на набережной в утреннем свете",
    price: { kind: "free" },
    ageRestriction: 0,
    tags: ["Забег", "На открытом воздухе"],
    ticketUrl: null,
    occurrences: [{ day: 6, hour: 9, durationMinutes: 120 }]
  },
  {
    slug: "istoriya-permi",
    title: "История Перми: от медного завода до культурной столицы",
    shortDescription:
      "Лекция краеведа о том, как заводской посёлок стал городом, а город — поводом для споров о культуре.",
    description: [
      "Триста лет Перми за полтора часа: Егошихинский завод, речной порт, Мотовилиха, «культурная столица» нулевых и то, что осталось за кадром официальных историй.",
      "Лектор — научный сотрудник краеведческого музея. Вход свободный."
    ],
    categorySlug: "lectures",
    venueSlug: "museum",
    organizerName: "Городской лекторий",
    organizerWebsite: null,
    image: "lectures.jpg",
    imageAlt: "Лекторий с деревянными скамьями и картой Перми на стене",
    price: { kind: "free" },
    ageRestriction: 12,
    tags: ["Лекция", "Краеведение"],
    ticketUrl: null,
    occurrences: [{ day: 3, hour: 18, minute: 30, durationMinutes: 90 }]
  },
  {
    slug: "perm-kupecheskaya",
    title: "Пермь купеческая",
    shortDescription:
      "Пешеходная экскурсия по особнякам купцов: доходные дома, торговые ряды и истории о том, как делались состояния.",
    description: [
      "Два часа пешком по Сибирской, Монастырской и дворам, куда не заходят автобусные экскурсии. Гид показывает сохранившиеся наличники, витрины первых этажей и следы торговых рядов.",
      "Маршрут заканчивается у речного вокзала — там, где купцы встречали пароходы."
    ],
    categorySlug: "excursions",
    venueSlug: "museum",
    organizerName: "Городской лекторий",
    organizerWebsite: null,
    image: "excursions.jpg",
    imageAlt: "Деревянный купеческий особняк с резными наличниками",
    price: { kind: "paid", from: 500, to: null, currency: "RUB" },
    ageRestriction: 0,
    tags: ["Пешеходная экскурсия", "Архитектура"],
    ticketUrl: null,
    occurrences: [
      { day: 1, hour: 14, durationMinutes: 150 },
      { day: 8, hour: 14, durationMinutes: 150 }
    ]
  },
  {
    slug: "vkus-prikamya",
    title: "Вкус Прикамья",
    shortDescription:
      "Фуд-маркет на Эспланаде: фермерские сыры, пожарские котлеты, чай с травами и десерты из местных ягод.",
    description: [
      "Двадцать локальных производителей собираются в одном месте: можно попробовать, поговорить с теми, кто вырастил и приготовил, и уйти с полной сумкой.",
      "Работает лекторий о еде: короткие разговоры о кухне Прикамья каждый час."
    ],
    categorySlug: "food",
    venueSlug: "esplanade",
    organizerName: "Городской лекторий",
    organizerWebsite: null,
    image: "food.jpg",
    imageAlt: "Ряды фуд-маркета с локальными продуктами",
    price: { kind: "free" },
    ageRestriction: 0,
    tags: ["Фуд-маркет", "Локальные продукты"],
    ticketUrl: null,
    occurrences: [
      { day: 1, hour: 12, durationMinutes: 480 },
      { day: 2, hour: 12, durationMinutes: 480 }
    ]
  },
  {
    slug: "zakulisye",
    title: "Закулисье театра",
    shortDescription:
      "Экскурсия по Пермскому театру оперы и балета: сцена, оркестровая яма, костюмерные и вид из-под колосников.",
    description: [
      "Экскурсовод — артист хора — проводит маршрутом артиста: от служебного входа до рампы. Рассказывает, как готовится спектакль и почему в театре не свистят.",
      "Группа до 20 человек, детям от 6 лет. Продолжительность — полтора часа."
    ],
    categorySlug: "excursions",
    venueSlug: "opera",
    organizerName: "Пермский театр оперы и балета",
    organizerWebsite: "https://permopera.ru",
    image: "excursions.jpg",
    imageAlt: "Вид на зрительный зал из-за кулис театра",
    price: { kind: "paid", from: 800, to: null, currency: "RUB" },
    ageRestriction: 6,
    tags: ["Экскурсия", "За сценой"],
    ticketUrl: null,
    occurrences: [{ day: 10, hour: 15, durationMinutes: 90 }]
  },
  {
    slug: "organ-vecher",
    title: "Органный вечер: Бах и современность",
    shortDescription:
      "Орган филармонии звучит в сумерках: прелюдии и фуги Баха рядом с музыкой композиторов XX века.",
    description: [
      "Программа построена как диалог через триста лет: хоралы Баха отвечают минимализму, а токката ре минор звучит рядом с сочинением пермского композитора.",
      "В программке — короткие заметки органиста о каждом произведении."
    ],
    categorySlug: "concerts",
    venueSlug: "philharmonic",
    organizerName: "Пермская краевая филармония",
    organizerWebsite: null,
    image: "concerts.jpg",
    imageAlt: "Орган концертного зала в вечернем свете",
    price: { kind: "paid", from: 600, to: 1200, currency: "RUB" },
    ageRestriction: 6,
    tags: ["Орган", "Классика"],
    ticketUrl: null,
    occurrences: [{ day: 11, hour: 19, durationMinutes: 90 }]
  }
];
