# План реализации City Events

Дата актуализации: 19 сентября 2026 года.

## 1. Правила ведения плана

Статусы:

- `[x]` — реализовано и проверено по перечисленным критериям;
- `[~]` — выполняется, критерии ещё не закрыты полностью;
- `[ ]` — не начато;
- `[!]` — заблокировано внешним доступом или инструментом; причина указывается рядом.

Этап считается завершённым только после фактического выполнения проверок. Наличие структуры файлов или mock-реализации само по себе не закрывает функциональный этап. После каждого этапа обновляются этот файл и затронутая архитектурная/эксплуатационная документация.

## 2. Текущее состояние

| Этап | Статус | Результат |
| --- | --- | --- |
| 0. Анализ и проектирование | [x] | ТЗ согласовано с `docs/auth.md`, архитектура и целевая БД спроектированы |
| 1. Фундамент монорепозитория | [x] | Монорепозиторий, приложения, общие пакеты, auth/DB foundation и локальная инфраструктура реализованы и проверены |
| 2. Публичный каталог Перми | [~] | Создан и визуально проверен дизайн-прототип; реализация каталога ещё не начата |
| 3. Администрирование и полный auth flow | [ ] | Не начат |
| 4. Очереди, импорт и модерация | [~] | Предварительно выбран Timepad и проверен его API; адаптер, очереди и импорт ещё не реализованы |
| 5. Telegram и публикации | [ ] | Не начат |
| 6. MAX | [ ] | Не начат |
| 7. Production hardening и приёмка MVP | [ ] | Не начат |

Текущая контрольная точка — этап 2. Предварительное исследование Timepad ведётся как отдельный подготовительный трек этапа 4 и не отменяет порядок зависимостей: сначала каталог, затем административная модерация, после этого полноценный автоматический импорт.

## 3. Этап 0 — анализ и проектирование

Статус: `[x]`.

### Функциональность

- изучены `AGENTS.md`, `docs/specification.md`, `docs/auth.md` и фактическое состояние репозитория;
- подтверждено отсутствие существующего кода, зависимостей, миграций и Fastify-плагинов;
- устаревшая собственная модель `User/passwordHash` заменена в основном ТЗ на Better Auth;
- ручные auth handlers заменены контрактом `/api/auth/*`, принадлежащим Better Auth;
- определены процессы, пакеты, направления зависимостей и lifecycle ресурсов;
- спроектированы целевая PostgreSQL/PostGIS схема, индексы, FK и delete rules;
- выбрана версия runtime: Node.js 24 LTS; зависимостям требуется совместимая, а не механически самая новая TypeScript-ветка.

### Затронутые документы

- `docs/specification.md`;
- `docs/architecture.md`;
- `docs/database.md`;
- `docs/implementation-plan.md`.

### Зависимости

Нет.

### Проверки

- архитектурная матрица покрывает все девять окончательных решений;
- нет отдельного DB/auth HTTP-сервиса и прямых app-to-app imports;
- auth-модель не дублирует таблицы Better Auth;
- публичный сайт и боты не требуют web account;
- целевая модель различает Event и EventOccurrence, SourceEvent и Event, публикации и персональные доставки;
- connection factories не предполагают side effects при import.

### Критерии готовности

- [x] противоречия авторизации устранены в основном ТЗ;
- [x] создан и проверен `docs/architecture.md`;
- [x] создан и проверен `docs/database.md`;
- [x] все дальнейшие этапы имеют явные границы и порядок зависимостей.

## 4. Этап 1 — фундамент монорепозитория

Статус: `[x]`.

### Функциональность

1. Workspace и инструменты:
   - pnpm workspaces и lockfile;
   - Turborepo tasks для `dev`, `build`, `typecheck`, `lint`, `test`;
   - строгий общий TypeScript config, ESM и единые Node.js constraints;
   - ESLint без подавления ошибок типизации;
   - `.gitignore`, `.editorconfig`, `.env.example` и root scripts.
2. `apps/web`:
   - минимальное SvelteKit 5 SSR-приложение с adapter-node;
   - стартовая публичная страница без требования сессии;
   - browser-only Better Auth Svelte Client, не создающий серверный auth instance;
   - dev proxy `/api` к Fastify.
3. `apps/api`:
   - фабрика Fastify app отдельно от `listen` entrypoint;
   - security/CORS/OpenAPI plugins;
   - `/health/live` и `/health/ready`;
   - Better Auth catch-all `/api/auth/*` через общий plugin;
   - graceful shutdown PostgreSQL/Redis/HTTP.
4. `packages/db`:
   - connection factory без подключения при import;
   - Drizzle config;
   - Better Auth schema, сгенерированная официальным CLI с Admin Plugin;
   - foundation schema `city` и controlled PostGIS migration;
   - первая версионируемая миграция и идемпотентный seed Перми.
5. `packages/auth`:
   - Better Auth factory с Drizzle Adapter;
   - email/password, Admin Plugin, роли и типизированные permissions;
   - config через параметры, без чтения/подключения при import;
   - публичный sign-up выключен для MVP.
6. Остальные пакеты и процессы:
   - реальные package boundaries для `shared`, `core`, `queue`, `api-client`, `event-sources`, `fastify-plugins`;
   - `apps/worker` и `apps/bots` получают запускаемые инфраструктурные entrypoints без фиктивной бизнес-логики;
   - queue/Redis factories с корректным lifecycle.
7. Локальная инфраструктура:
   - Compose с version-pinned PostGIS и Redis, volumes и healthchecks;
   - Dockerfiles для приложений либо документированное обоснование, если они вынесены в production этап;
   - README с командами setup/start/check/migrate/seed.

### Приложения и пакеты

- `apps/web`, `apps/api`, `apps/worker`, `apps/bots`;
- `packages/db`, `packages/auth`, `packages/core`, `packages/queue`, `packages/shared`, `packages/api-client`, `packages/event-sources`, `packages/fastify-plugins`;
- root workspace и `infra/compose.yaml`.

### Зависимости от предыдущих этапов

- утверждённые границы из этапа 0;
- модель foundation tables из `docs/database.md`;
- официальный CLI Better Auth и совместимые версии Better Auth/Drizzle.

### Необходимые тесты и проверки

- `pnpm install --frozen-lockfile` после создания lockfile;
- `pnpm lint`;
- `pnpm typecheck` для всех workspace packages;
- `pnpm test` с unit-тестами config/permissions/factories и Fastify inject tests;
- `pnpm build` для всех четырёх приложений и публикуемых пакетов;
- запуск API и проверка liveness;
- запуск SvelteKit и HTTP-проверка стартовой страницы;
- Compose health PostgreSQL/PostGIS и Redis;
- миграция на чистой БД и повторный no-op запуск;
- проверка `SELECT PostGIS_Version()`;
- seed дважды без дубля Перми;
- readiness API в healthy и degraded сценариях;
- реальное открытие/закрытие DB pool и Redis connection.

### Критерии готовности

- [x] установка из чистого checkout воспроизводима lockfile;
- [x] lint, TypeScript, unit/integration tests и build проходят;
- [x] Fastify и SvelteKit реально отвечают по HTTP;
- [x] PostgreSQL/PostGIS и Redis проходят healthchecks;
- [x] миграции применяются к чистой БД и фиксируются Drizzle journal;
- [x] Better Auth и Admin Plugin используют только сгенерированные служебные таблицы;
- [x] Пермь создаётся seed-командой один раз;
- [x] import пакетов не открывает подключения;
- [x] README соответствует выполненным командам;
- [x] непроверенных обязательных сценариев этапа нет; известное ограничение образа PostGIS на ARM задокументировано.

### Фактическая проверка этапа 1

Проверено 19 сентября 2026 года:

- `CI=true pnpm install --frozen-lockfile` успешно восстановил все 13 workspace-проектов по lockfile;
- `pnpm check` успешно выполнил lint и typecheck для всех workspace-проектов, 5 unit/integration тестов и сборку 12 приложений/пакетов; `svelte-check` сообщил 0 ошибок и 0 предупреждений;
- production-сборки Fastify и SvelteKit запущены локально: API вернул HTTP 200 на liveness/readiness, web отдал SSR-страницу City Events;
- readiness подтвердил `postgres: up` и `redis: up`; отдельный integration-тест подтвердил HTTP 503 и `degraded` при отказе зависимости;
- Compose-сервисы `postgis/postgis:17-3.5` и `redis:8.2-alpine` достигли состояния `healthy`; Redis ответил `PONG`, PostgreSQL вернул PostGIS 3.5;
- первоначальная Drizzle-миграция применена к новой БД и повторно выполнена как no-op; `city.location` имеет тип `POINT` и SRID 4326;
- seed выполнен дважды, запрос подтвердил ровно одну запись Перми;
- Better Auth schema создана официальным CLI с Admin Plugin; `/api/auth/get-session` вернул `null` без сессии, а публичная регистрация отклонена без создания пользователя;
- тест connection factory подтвердил отсутствие подключения при импорте; API, worker и bots корректно закрыли ресурсы по SIGINT;
- production Dockerfiles приложений осознанно перенесены в этап 7: до стабилизации runtime-зависимостей они не дают проверяемой пользы; локальные PostGIS/Redis полностью контейнеризованы сейчас.

## 5. Этап 2 — публичный каталог Перми

Статус: `[~]`.

### Функциональность

- миграции `category`, `tag`, `media_asset`, `venue`, `organizer`, `event`, `event_occurrence`, `event_tag`;
- стартовые категории и реалистичный development seed;
- repository implementations и `EventService`/`EventSearchService`;
- публичные API cities/events/categories/venues/organizers;
- фильтры по городу, тексту, категории, дате, цене, площадке и радиусу;
- SvelteKit страницы `/`, `/events`, `/events/[slug]`, категорий и площадок;
- URL-synchronized filters, pagination, empty/error states;
- SEO: metadata, canonical, robots, sitemap и schema.org/Event.
- перенос утверждённого визуального направления из `design/web.pen` без экспорта сгенерированного HTML/CSS;
- единые design tokens, переиспользуемые компоненты Header/EventCard/DateNavigator/FilterPanel/OccurrenceList;
- responsive-состояния главной, каталога и страницы события, включая mobile filters.

### Текущий прогресс

- [x] создан `design/web.pen` с главной desktop, каталогом, страницей события и главной mobile;
- [x] выполнена визуальная сверка с архитектурой публичного сайта и моделью нескольких сеансов;
- [ ] уточнена отличительная визуальная система Перми и проверено фактическое применение выбранных шрифтов;
- [ ] добавлены mobile-макеты каталога, фильтров и страницы события;
- [ ] спроектированы loading, empty, error, no-results, cancelled и postponed состояния;
- [ ] дизайн перенесён в доступные Svelte-компоненты с keyboard focus и reduced-motion;
- [ ] каталог подключён к PostgreSQL через публичный Fastify API.

### Приложения и пакеты

- `apps/api`, `apps/web`, `design/web.pen`;
- `packages/db`, `packages/core`, `packages/shared`, `packages/api-client`.

### Зависимости

- полностью завершённый этап 1;
- рабочие PostGIS и миграции;
- утверждённые публичные DTO.

### Тесты

- unit: переходы статуса, money semantics, timezone formatting;
- DB integration: связи, несколько occurrences, FTS, date filters и `ST_DWithin`;
- API integration: validation, pagination, только `published`, отсутствие закрытых полей;
- web component/SSR tests для каталога и карточки;
- visual/responsive QA для desktop и mobile, keyboard navigation и contrast checks;
- E2E анонимного посетителя без cookies;
- build и smoke tests production bundles.

### Критерии готовности

- [ ] анонимный пользователь видит данные из PostgreSQL, а не mock;
- [ ] одно событие корректно показывает несколько сеансов;
- [ ] фильтры воспроизводимы из URL;
- [ ] draft/rejected/internal data не попадают в публичный API;
- [ ] поиск и геофильтр используют запланированные индексы;
- [ ] основные страницы корректно SSR-рендерятся и индексируются.

## 6. Этап 3 — администрирование и полный auth flow

Статус: `[ ]`.

### Функциональность

- защищённая CLI-инициализация первого admin;
- вход, выход, текущая сессия, reset password и завершение сессий Better Auth;
- test email provider локально и production provider abstraction;
- SSR-защита `/admin/*` с передачей cookies;
- ресурсные permissions для admin/editor/user;
- CRUD событий, occurrences, venues, organizers, categories;
- publish/reject/cancel/archive use cases и moderation history;
- admin dashboard и базовая модерация ручных событий.

### Приложения и пакеты

- `apps/web`, `apps/api`;
- `packages/auth`, `packages/fastify-plugins`, `packages/core`, `packages/db`, `packages/shared`, `packages/api-client`.

### Зависимости

- каталог этапа 2;
- foundation Better Auth этапа 1.

### Тесты

- реальные HTTP-тесты sign-in/sign-out/session/expiry/reset;
- Fastify permission matrix admin/editor/user/anonymous;
- CSRF, trusted origins, rate limit и multiple Set-Cookie;
- SSR redirect и cookie forwarding;
- integration tests CRUD и optimistic/conflict handling;
- E2E: admin входит, создаёт событие с несколькими датами и публикует его.

### Критерии готовности

- [ ] нет публичного способа создать admin или повысить роль;
- [ ] editor не управляет users/settings и не получает лишние права;
- [ ] UI guard и API authorization работают независимо;
- [ ] опубликованное из admin UI событие появляется в публичном каталоге;
- [ ] выход немедленно лишает доступа к защищённым операциям;
- [ ] auth integration подтверждена реальными HTTP, а не только unit tests.

## 7. Этап 4 — очереди, импорт и модерация

Статус: `[~]` — выполнено только предварительное исследование первого источника; функциональная реализация этапа не начата.

### Функциональность

- полные BullMQ queues: source-crawl, event-processing, event-publication, notifications, maintenance;
- Job Schedulers, retries/backoff, concurrency и versioned payloads;
- migrations event_source/source_event/import_run/duplicate_candidate/outbox;
- transactional outbox dispatcher;
- Timepad API adapter как первый структурированный источник Перми: серверный Bearer token, фильтр города, последовательная пагинация, rate-limit/backoff и валидация внешней схемы;
- ручной adapter, RSS/iCalendar adapter и HTML/JSON-LD adapter;
- normalization pipeline без выдумывания отсутствующих значений;
- deterministic deduplication и ручной экран возможных дублей;
- import runs, source management и ошибки в admin UI;
- один реальный разрешённый источник Перми либо явно документированная внешняя блокировка плюс fixture contract tests.

### Предварительная проверка Timepad

- [x] официальный API поддерживает фильтр по городу, даты, площадки, организаторов, категории, билеты и пагинацию до 100 записей;
- [x] подтверждён заявленный лимит 60 запросов с одного IP в минуту;
- [x] фактический запрос списка событий Перми без токена вернул HTTP 403 «Запрос требует указание токена», несмотря на противоречивую формулировку документации публичного метода;
- [ ] реализован `timepad` adapter в `packages/event-sources` с fixture contract tests;
- [ ] добавлены безопасная конфигурация `TIMEPAD_API_TOKEN`, smoke-команда и redaction секрета;
- [!] live smoke test событий Перми ожидает серверный токен с минимальным разрешением `view_events`;
- [ ] до копирования полных описаний и изображений подтверждены условия повторного использования контента; до этого импорт ограничивается безопасными метаданными, исходной ссылкой и атрибуцией.

### Приложения и пакеты

- `apps/worker`, `apps/api`, `apps/web`;
- `packages/queue`, `packages/event-sources`, `packages/core`, `packages/db`, `packages/shared`.

### Зависимости

- этап 3 для admin/moderation;
- Redis foundation;
- подтверждённые условия использования выбранного источника;
- Timepad token хранится только в environment/secret manager и никогда не передаётся в browser bundle или `event_source.configuration`.

### Тесты

- adapter contract tests на fixtures;
- Timepad contract: pagination, city/date filters, schema drift, HTTP 401/403/429/5xx, abort и отсутствие токена в URL/logs;
- unit normalization: даты, timezone, цена, HTML cleanup;
- повторный импорт и уникальность external id/url;
- BullMQ integration: retry, backoff, concurrency, resume after Redis restart;
- outbox recovery между DB commit и enqueue;
- duplicate decisions сохраняют source provenance;
- E2E import -> pending review -> approve -> public catalog.

### Критерии готовности

- [ ] разрешённый внешний источник фактически загружает данные или ограничение явно `[!]`;
- [ ] Timepad live status подтверждён токеном и не заявляется на основании одних fixture tests;
- [ ] повторный import не создаёт новый SourceEvent/Event;
- [ ] неизвестная цена не становится бесплатной;
- [ ] тяжёлая обработка не выполняется в HTTP handler;
- [ ] после сбоя dispatcher продолжает outbox без потери/двойного эффекта;
- [ ] администратор видит raw provenance и может разрешить duplicate candidate.

## 8. Этап 5 — Telegram и публикации

Статус: `[ ]`.

### Функциональность

- migrations bot_subscriber/subscription/publication_channel/publication/notification_delivery;
- общий messaging port и Telegram adapter;
- webhook verification/deduplication;
- `/start`, выбор города, сегодня/завтра/выходные, категории и карточка;
- подписки без Better Auth account;
- персональные уведомления только opt-in пользователям;
- ручная публикация в Telegram channel и optional auto-publish setting;
- mock adapter для local/test.

### Приложения и пакеты

- `apps/bots`, `apps/api`, `apps/worker`, admin sections в `apps/web`;
- `packages/core`, `packages/db`, `packages/queue`, `packages/shared`.

### Зависимости

- этап 4 queues/outbox;
- Telegram token/channel rights только для live tests.

### Тесты

- contract tests Telegram/mock adapters;
- webhook authenticity и повтор update id;
- bot flows без `user.id`;
- subscription matching;
- publication/delivery idempotency;
- live smoke test при предоставленных credentials.

### Критерии готовности

- [ ] бот читает общий каталог и не имеет собственной копии событий;
- [ ] пользователь работает без web registration;
- [ ] сообщения не уходят без opt-in;
- [ ] повтор job не создаёт вторую публикацию/доставку;
- [ ] live-возможности не заявлены без фактической проверки.

## 9. Этап 6 — MAX

Статус: `[ ]`.

### Функциональность

- MAX transport adapter к общему messaging port;
- проверка webhook и дедупликация;
- эквивалентные пользовательские сценарии и подписки;
- публикация в поддерживаемые MAX destinations;
- mock adapter и contract suite обязательны независимо от live access.

### Приложения и пакеты

- `apps/bots`, `apps/api`, `apps/worker`;
- `packages/core`, `packages/queue`, `packages/shared`.

### Зависимости

- стабильный общий контракт этапа 5;
- актуальная официальная документация MAX;
- live access для финальной интеграционной проверки.

### Тесты

- Telegram/MAX проходят один contract suite;
- webhook security, timeout/error mapping и idempotency;
- user flows на mock;
- live smoke tests только при credentials.

### Критерии готовности

- [ ] общий core не содержит MAX DTO;
- [ ] mock/contract implementation полностью проверена;
- [ ] live status честно помечен verified или `[!]` с точной причиной;
- [ ] повторные webhook/jobs безопасны.

## 10. Этап 7 — production hardening и приёмка MVP

Статус: `[ ]`.

### Функциональность

- production Docker images, non-root users, healthchecks и graceful shutdown;
- Dokploy configuration, reverse proxy и secrets;
- backup/restore runbook и фактическая restore rehearsal;
- log redaction, request/job correlation, metrics и alert baseline;
- retention jobs;
- rate limits, SSRF/upload hardening, dependency/security audit;
- OpenAPI и вся эксплуатационная документация;
- нагрузочная проверка ключевых catalog queries и worker concurrency.

### Приложения и пакеты

Все приложения, пакеты, `infra` и `docs`.

### Зависимости

- этапы 2–6 завершены либо имеют явно принятые внешние ограничения;
- production-like environment.

### Тесты

- полный unit/integration/contract/E2E suite;
- миграции с чистой БД и upgrade path;
- основной E2E из ТЗ: login -> multi-occurrence event -> publish -> public search -> mock messenger -> idempotent retry;
- restart API/worker/Redis/PostgreSQL в безопасных сценариях;
- backup restore;
- permission/security regression suite;
- smoke test production containers.

### Критерии готовности

- [ ] все 18 критериев MVP из ТЗ сопоставлены с доказательством проверки;
- [ ] production deployment не публикует PostgreSQL/Redis;
- [ ] backup восстановлен в отдельную БД и проверен;
- [ ] основные права и идемпотентность покрыты регрессией;
- [ ] документация позволяет развернуть систему из чистого checkout;
- [ ] все внешние ограничения перечислены без выдачи mock за live integration.

## 11. Ближайшая контрольная точка

Завершить этап 2 как работающий публичный вертикальный срез:

1. закрыть недостающие responsive/accessibility состояния прототипа и зафиксировать design tokens;
2. реализовать миграции каталога, repository ports/implementations и публичные DTO;
3. создать публичные Fastify endpoints с фильтрами, пагинацией и выдачей только опубликованных событий;
4. перенести главную, каталог и страницу события из `design/web.pen` в SvelteKit;
5. пройти DB/API/web/E2E проверки анонимного сценария;
6. параллельно подготовить Timepad adapter и fixture contract tests, но не объявлять автоматический импорт готовым до этапа 4 и live-проверки с токеном.

Результат контрольной точки: анонимный пользователь видит события из PostgreSQL на реализованном по прототипу сайте; Timepad adapter технически готов к подключению, а его live-статус честно зафиксирован как verified или `[!]`.
