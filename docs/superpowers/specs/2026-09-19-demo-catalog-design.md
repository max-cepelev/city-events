# Демо-срез этапа 2: презентационные данные в публичном каталоге

Дата: 19 сентября 2026 года.
Статус: утверждено в диалоге, ожидает реализации.

## 1. Цель и контекст

Подготовить презентационные (реалистичные development) данные каталога Перми и отобразить их в публичном web-интерфейсе. Работа является вертикальным срезом этапа 2 из `docs/implementation-plan.md` и выполняется по утверждённой архитектуре: PostgreSQL → `packages/core` → публичный Fastify API → `packages/api-client` → SvelteKit SSR. Визуальное направление переносится из утверждённого прототипа `design/web.pen` без экспорта сгенерированного HTML/CSS.

Критерий результата: анонимный пользователь открывает главную, каталог и карточку события и видит данные из PostgreSQL, заполненные презентационным seed.

## 2. Охват

### Входит

- миграция каталожной схемы по `docs/database.md` §4;
- идемпотентный презентационный seed (категории, площадки, организаторы, события, сеансы, теги, изображения-ссылки);
- публичные Fastify endpoints: города, категории, список событий с фильтрами, карточка события;
- порты/сервис каталога в `packages/core`, публичные DTO-контракты в `packages/shared`;
- страницы SvelteKit `/`, `/events`, `/events/[slug]` по прототипу с URL-синхронизированными фильтрами и пагинацией;
- локальные сгенерированные изображения событий;
- unit/DB/API integration тесты и ручная визуальная проверка.

### Не входит (остаётся в этапе 2)

- фильтры по цене, площадке и георадиусу (схема БД и индексы готовы, UI/API — позже);
- страницы категорий и площадок;
- SEO: canonical, sitemap, schema.org/Event, robots (только базовые title/description);
- mobile-макеты каталога/события и полировка responsive;
- loading/cancelled/postponed UI-состояния сверх базового отображения статуса сеанса;
- E2E и EXPLAIN-аудит планов запросов.

## 3. Схема данных (`packages/db`)

Одна новая версионируемая миграция `0001_*`:

- enums `event_status` (`draft`, `pending_review`, `published`, `rejected`, `cancelled`, `archived`) и `occurrence_status` (`scheduled`, `cancelled`, `postponed`, `completed`);
- таблицы `category`, `tag`, `media_asset`, `venue`, `organizer`, `event`, `event_occurrence`, `event_tag` — поля, FK, CHECK и индексы строго по `docs/database.md` §4, включая partial index `(city_id, published_at DESC) WHERE status = 'published'`, GiST по `location`, generated `tsvector` (`russian`) с GIN и trigram GIN по title;
- Drizzle-схема — новый файл `packages/db/src/schema/catalog.ts` (группировка по домену, как `schema/auth.ts`), экспорт через `schema/index.ts`.

Проверки: применение к чистой БД, применение поверх существующей (только `city` + Better Auth), повторный запуск мигратора как no-op.

## 4. Презентационный seed

Новый скрипт `packages/db/src/scripts/seed-catalog.ts`, root-команда `db:seed:catalog`. Существующий `seed.ts` (Пермь) не изменяется; `seed-catalog` требует, чтобы Пермь уже существовала.

### Состав данных

- **Категории (9)**: Концерты, Театр, Выставки, Кино, Детям, Спорт, Лекции, Еда, Экскурсии. Плоские, `sort_order` по смыслу, slugs транслитом (`concerts`, `theatre`, …).
- **Площадки (8)**, реальные названия, best-effort адреса/координаты (development seed, уточняется при реальном импорте): Театр-Театр, Пермский театр оперы и балета, Пермская краевая филармония, Музей современного искусства PERMM, Пермская художественная галерея, Пермский краеведческий музей, Пермский зоопарк, Эспланада.
- **Организаторы (5)**: филармония, театр оперы и балета, Театр-Театр, PERMM, городской лекторий (вымышленный).
- **События (~20)**: правдоподобные названия и описания на русском; примеры — опера «Евгений Онегин» (3 сеанса), балет «Щелкунчик» (2 сеанса), симфонический концерт «Музыка кино», выставка «Пермская деревянная скульптура» (ежедневные сеансы 14 дней), спектакль «Гроза», лекция «История Перми», экскурсия «Пермь купеческая», фуд-маркет «Вкус Прикамья» на Эспланаде (2 дня), мастер-класс в зоопарке, джазовый вечер, благотворительный забег.
- **Сеансы (~35)**: даты вычисляются относительно момента запуска seed в таймзоне `Asia/Yekaterinburg` — сегодня вечером, завтра, ближайшие выходные, +1…2 недели. Афиша на презентации всегда актуальна. 1–2 сеанса со статусами `cancelled`/`postponed` для демонстрации состояний.
- **Цены**: микс `is_free = true` (цены NULL), платных с `price_from`/`price_to` в RUB и «цена неизвестна» (`is_free = NULL`, цены NULL). Отсутствие цены не превращается в «бесплатно».
- **Прочее**: возрастные ограничения 0+/6+/12+/16+/18+, теги (10–15, связи через `event_tag`), `ticket_url` у части платных событий, `published_at` заполнен у всех — все seed-события в статусе `published`.

### Идемпотентность

- справочники (категории, теги, площадки, организаторы, media assets) — upsert по уникальному ключу (slug / storage_key);
- события — upsert по `(city_id, slug)`;
- сеансы и `event_tag` seed-событий пересоздаются в одной транзакции (delete + insert), поэтому повторный запуск освежает даты без дублей;
- seed не трогает записи, не входящие в его фиксированный набор slug-ов.

## 5. Изображения

- ~10 изображений, сгенерированных инструментом генерации: по одному атмосферному на категорию + одно hero для главной. Стиль — тёплая editorial-графика в палитре прототипа (`#F5F2E9`, `#B94329`), без текста на изображении.
- Файлы: `apps/web/static/images/seed/<slug>.jpg` (landscape ~1200×800).
- `media_asset`: `storage_key = seed/<slug>.jpg`, `public_url = /images/seed/<slug>.jpg`, заполнены `content_type`, `width`, `height`, `alt_text`. Бинарные данные в PostgreSQL не хранятся; раздача — статикой SvelteKit.

## 6. Контракты (`packages/shared`) и сервис (`packages/core`)

### DTO (zod-схемы в `shared`, типы выводятся из них)

- `PublicCity`: `id`, `name`, `slug`, `region`, `timezone`.
- `PublicCategory`: `id`, `name`, `slug`.
- `PublicOccurrence`: `id`, `startsAt`, `endsAt`, `status`.
- `PublicEventListItem`: `id`, `slug`, `title`, `shortDescription`, `category`, `image { url, alt, width, height } | null`, `price` (`{ kind: "free" } | { kind: "paid", from, to, currency } | { kind: "unknown" }`), `ageRestriction`, `nextOccurrence`, `venue { name, address } | null`.
- `PublicEventDetails`: list item + `description`, `occurrences[]` (будущие, по возрастанию), `venue` с координатами, `organizer { name, website } | null`, `tags[]`, `ticketUrl`, `sourceUrl`.
- `Paginated<T>`: `items`, `page`, `pageSize`, `totalItems`, `totalPages`.

Публичные DTO не содержат raw payload, moderation, внутренние id источников и `contact_information` организатора.

### Core

- Порт `CatalogRepository`: `listCities()`, `listCategories(citySlug)`, `listPublishedEvents(query)`, `findPublishedEvent(citySlug, slug)`.
- `CatalogService`: нормализация query (дефолты `page=1`, `pageSize=12`, max 50), маппинг date-пресетов (`today`, `tomorrow`, `weekend`) в диапазоны по таймзоне города, правило «только `published` с будущим/текущим сеансом».
- Форматтеры: цена (`от 700 ₽`, `700–1 500 ₽`, `Бесплатно`, `Цена уточняется`), дата сеанса в таймзоне города. Покрываются unit-тестами.

## 7. API (`apps/api`)

Новый публичный `catalogPlugin` (без auth), регистрируется в `buildApp`. JSON Schema на маршрутах по паттерну health plugin (response serialization + OpenAPI); zod-схемы `shared` используются клиентом. Drizzle-реализации репозитория — `packages/db/src/repositories/catalog.ts`.

| Метод | Путь | Ответ |
| --- | --- | --- |
| GET | `/api/cities` | `{ items: PublicCity[] }` |
| GET | `/api/categories?city=perm` | `{ items: PublicCategory[] }` |
| GET | `/api/events?city=&category=&date=&q=&page=&pageSize=` | `Paginated<PublicEventListItem>` |
| GET | `/api/cities/:citySlug/events/:slug` | `PublicEventDetails` |

Правила:

- список содержит только `published` события с ближайшим `scheduled` сеансом, сортировка по `nextOccurrence.startsAt`;
- `date` — пресет (`today`/`tomorrow`/`weekend`), вычисляется в таймзоне города; альтернативно принимаются явные `from`/`to` (ISO date); если переданы `from`/`to`, параметр `date` игнорируется;
- `q` — `websearch_to_tsquery` по FTS-вектору;
- карточка возвращает 404 для несуществующего или не-`published` события;
- пустой результат фильтра — валидный ответ с пустым `items`;
- ошибки валидации — штатный Fastify 400.

## 8. Web (`apps/web`)

### Design tokens и шрифты

- `src/app.css`: CSS custom properties из `web.pen` — цвета (`surface.primary #F5F2E9`, `surface.secondary #E8E4D8`, `foreground.primary #2D2926`, `foreground.secondary #5E5954`, `border.subtle #DCD8CB`, `accent.primary #B94329`, `accent.deep #7C2D1D`, `accent.soft #F0D8CB`, `success #2F6B4F`), отступы 8/16/24/40, радиус 4.
- Шрифты self-hosted через `@fontsource-variable/newsreader`, `@fontsource-variable/funnel-sans`, `@fontsource/geist`, `@fontsource/geist-mono` (обоснование зависимостей: презентация не должна зависеть от CDN), fallback — системные стеки.

### Страницы и компоненты

- `+layout.svelte` + `Header`: бренд «Пермь.События», навигация «Афиша» (`/events`), «Сегодня» (`/events?date=today`), «Выходные» (`/events?date=weekend`). Пункт «Места» скрыт до появления страницы площадок.
- `/` — hero (заголовок, подзаголовок, ссылка в каталог) + «Ближайшие события» (первые 8) + плитка категорий.
- `/events` — каталог: `CategoryChips`, `DateNavigator` (Все даты/Сегодня/Завтра/Выходные), строка поиска (`q`), сетка `EventCard`, пагинация. Фильтры читаются из и записываются в URL search params (SSR-навигация через `goto`/`data-sveltekit-reload` не требуется — обычные ссылки и form GET).
- `/events/[slug]` — изображение, заголовок, описание, `OccurrenceList` (все будущие сеансы со статусами), площадка с адресом, организатор, `PriceTag`, возрастное ограничение, кнопка «Купить билет» при `ticketUrl`.
- Компоненты в `src/lib/components/`: `Header`, `EventCard`, `CategoryChips`, `DateNavigator`, `OccurrenceList`, `PriceTag`, `EmptyState`, `Pagination`.

### Загрузка данных

- `+page.server.ts` на каждую страницу; запросы через `createApiClient({ fetch: event.fetch, baseUrl: "" })` — в dev запросы `/api/*` уходят на Fastify через существующий vite proxy.
- Город по умолчанию — константа `perm` (env `PUBLIC_DEFAULT_CITY` с дефолтом `perm`); выбора города в UI нет, но все запросы и маршруты API уже параметризованы городом.
- Cookies не используются, страницы полностью анонимные и кешируемые по смыслу SSR.

### Состояния и ошибки

- пустой фильтр — `EmptyState` («По вашему запросу ничего не найдено», ссылка на сброс фильтров);
- событие не найдено / не опубликовано — `error(404)` → `+error.svelte`;
- API недоступен — `error(503)` с дружелюбным текстом;
- базовые `<title>`/`<meta name="description">` на каждой странице (полный SEO — вне среза).

## 9. Тестирование и проверки

- **unit** (`core`): маппинг date-пресетов в `Asia/Yekaterinburg` (включая границу суток), форматтеры цены/даты, нормализация пагинации.
- **DB integration** (против dockerized PostGIS): миграция на чистой БД; seed дважды — без дублей, даты освежаются; репозиторий возвращает только `published`, событие с несколькими сеансами, фильтры category/date/q.
- **API integration** (Fastify inject + тестовая БД с минимальной фикстурой): схемы ответов, 404 для draft, фильтры, пагинация, отсутствие закрытых полей.
- **web**: SSR smoke-тесты load-функций с моком api-client; `svelte-check` без ошибок.
- **ручной прогон**: `pnpm dev:infra` → migrate → `db:seed` → `db:seed:catalog` (×2) → `pnpm dev`; curl проверки endpoints; визуальная сверка главной/каталога/карточки с прототипом через Chrome DevTools (скриншоты).
- `pnpm check` (lint + typecheck + test + build) зелёный.
- Обновить «Текущий прогресс» этапа 2 в `docs/implementation-plan.md` по факту выполнения.

## 10. Ограничения и риски

- Адреса/координаты площадок — best-effort development данные, не эталонный справочник.
- Изображения — сгенерированные заглушки; при появлении реального импорта заменяются контентом источников после подтверждения прав переиспользования.
- Без E2E и mobile-полировки срез не закрывает этап 2 целиком; план обновляется честно с остатком работ.
