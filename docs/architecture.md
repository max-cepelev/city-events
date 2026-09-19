# Архитектура City Events

Статус: утверждённая основа для MVP. Дата ревизии: 19 сентября 2026 года.

## 1. Контекст и архитектурный стиль

City Events — модульный TypeScript-монолит в pnpm-монорепозитории. Web, API, worker и боты собираются и запускаются как отдельные процессы, но используют общие пакеты и одну PostgreSQL-базу. Это даёт независимое масштабирование процессов без преждевременного разделения на микросервисы.

Fastify — единственный HTTP backend и владелец REST API. SvelteKit отвечает за SSR, публичный интерфейс и административную панель. Бизнес-правила не размещаются в обработчиках Fastify, SvelteKit load-функциях, Drizzle-репозиториях или платформенных адаптерах.

Основные решения:

- Node.js 24 LTS и ESM;
- TypeScript в строгом режиме;
- Svelte 5 и SvelteKit для web;
- Fastify 5 для API;
- PostgreSQL с PostGIS, Drizzle ORM и node-postgres;
- Better Auth с Drizzle Adapter и Admin Plugin;
- Redis и BullMQ для фоновых заданий, планирования и межпроцессной доставки;
- Crawlee только в процессе worker, когда начнётся этап импорта;
- один публичный origin: reverse proxy направляет `/api/*` в Fastify, остальные запросы — в SvelteKit.

## 2. Проверка окончательных требований

| Требование | Архитектурное решение | Результат |
| --- | --- | --- |
| Frontend — SvelteKit | `apps/web`, SSR и adapter-node | соответствует |
| Backend — Fastify | `apps/api`, REST с префиксом `/api` | соответствует |
| Drizzle в независимом пакете | соединение, схема и миграции в `packages/db`; импорт не открывает соединение | соответствует |
| Better Auth через Fastify | серверная фабрика в `packages/auth`, HTTP-мост в `packages/fastify-plugins` | соответствует |
| Публичный доступ без аккаунта | публичные GET-маршруты и пользовательские боты не требуют сессии | соответствует |
| Защищённая админка | SSR-проверка в web и независимая проверка разрешений в API | соответствует |
| BullMQ для фоновых задач | `packages/queue` и отдельный `apps/worker`; Cron и локальный EventEmitter не используются | соответствует |
| Несколько городов, MVP для Перми | `city_id` в городозависимых сущностях; часовой пояс хранится у города | соответствует |
| TypeScript-монорепозиторий | pnpm workspaces и Turborepo | соответствует |
| Без отдельного DB/auth HTTP-сервиса | приложения подключают общие пакеты напрямую | соответствует |

Выявленное противоречие в первоначальном ТЗ устранено: отдельной прикладной таблицы `User` с `passwordHash` и самописных auth-endpoints не будет. Источник истины — `docs/auth.md`; Better Auth владеет таблицами `user`, `session`, `account`, `verification` и HTTP-контрактом `/api/auth/*`.

## 3. Структура монорепозитория

```text
apps/
  web/                 SvelteKit: публичный SSR и административный UI
  api/                 Fastify: REST, auth-маршруты, webhook-входы
  worker/              BullMQ workers, импорт, outbox, уведомления
  bots/                Telegram/MAX transport adapters
packages/
  shared/              браузеробезопасные DTO, enum и схемы границ
  core/                use cases, доменные правила и порты репозиториев
  db/                  Drizzle schema, миграции, connection factory, repositories
  auth/                Better Auth factory, роли и разрешения
  queue/               имена очередей, job payloads, factories, schedulers
  api-client/          типизированный клиент Fastify API
  event-sources/       контракты и реализации источников
  fastify-plugins/     DB, Redis, auth, security и OpenAPI plugins
infra/
  compose.yaml         локальные PostGIS и Redis; профили приложений позднее
docs/                  архитектура и эксплуатационная документация
```

Каталоги создаются сразу, но функциональность добавляется по вертикальным этапам. Пустые фиктивные реализации не считаются завершёнными компонентами.

## 4. Граф зависимостей

Разрешённые compile-time зависимости:

```text
shared
  ↑       ↑         ↑
core   api-client  queue
  ↑                   ↑
db          event-sources
  ↑              ↑
auth      fastify-plugins
  ↑              ↑
apps/api, apps/worker, apps/bots

apps/web -> shared + api-client + Better Auth browser client
```

Точная направленность:

- `packages/shared` не зависит от серверных пакетов и может импортироваться в браузер;
- `packages/core` зависит только от `shared` и объявляет необходимые порты структурными TypeScript-интерфейсами;
- `packages/db` зависит от `shared`; его репозитории реализуют порты `core`, не передавая Drizzle-типы наружу;
- `packages/auth` зависит от `db` и `shared`, но не от Fastify;
- `packages/queue` зависит от `shared` и BullMQ, но не от приложений;
- `packages/event-sources` зависит от `shared` и доменных контрактов `core`;
- `packages/fastify-plugins` связывает Fastify с `db`, `auth` и Redis;
- приложения могут зависеть от пакетов, но не импортируют друг друга;
- `core` и `db` не импортируют Fastify, SvelteKit, Telegram или MAX SDK.

Циклические зависимости запрещены. Объекты `FastifyInstance`, `Request`, `Reply`, Drizzle connection и BullMQ Job не пересекают соответствующие инфраструктурные границы.

## 5. Процессы и владение ресурсами

Каждый процесс создаёт и закрывает собственные ресурсы:

- API: PostgreSQL pool, Redis connection и Better Auth instance;
- worker: PostgreSQL pool, отдельные BullMQ connections и workers;
- bots: клиенты платформ; доступ к данным через `core`/`db` или задания очереди по сценарию;
- web: не подключается к PostgreSQL и Redis, а вызывает Fastify через API client.

Импорт `packages/db`, `packages/auth` или `packages/queue` не должен сам создавать socket/connection. Фабрики получают валидированную конфигурацию. Остановка процесса закрывает HTTP server, workers, queue connections, Redis и PostgreSQL pool в определённом порядке.

## 6. Основные потоки

### 6.1. Публичный каталог

1. Браузер или SSR SvelteKit вызывает публичный `/api/*`.
2. Fastify валидирует параметры и вызывает use case из `core`.
3. Use case обращается к переданному repository port.
4. Drizzle-репозиторий возвращает только опубликованные данные и DTO публичного представления.
5. Web рендерит страницу; наличие Better Auth session не требуется.

### 6.2. Административная операция

1. SvelteKit server load передаёт cookies в Fastify и до рендера проверяет сессию.
2. Fastify повторно проверяет сессию и требуемое разрешение; проверка UI не считается защитой.
3. Use case выполняет переход состояния и записывает аудит.
4. Критическое действие, требующее фоновой доставки, в той же DB-транзакции создаёт `outbox_event`.
5. Worker передаёт outbox в BullMQ идемпотентно.

### 6.3. Импорт события

```text
Job Scheduler -> source-crawl -> Source adapter -> source_event
              -> event-processing -> normalize/validate/deduplicate
              -> draft or pending_review -> admin moderation
```

Повтор одного источника определяется уникальным внешним ключом и content hash. Возможные совпадения разных источников не объединяются автоматически без безопасного детерминированного правила.

### 6.4. Публикация и уведомления

```text
DB transaction -> outbox_event -> outbox dispatcher -> BullMQ job
               -> platform adapter -> publication/delivery result
```

У каждого внешнего эффекта есть устойчивый idempotency key. Публичные публикации и персональные доставки ведутся в разных журналах.

## 7. Авторизация и разрешения

- `packages/auth` экспортирует фабрику, получающую существующий Drizzle database, secret, base URL, trusted origins и почтовый provider;
- официальный Drizzle Adapter использует схему Better Auth, сгенерированную CLI;
- Admin Plugin задаёт роли `admin`, `editor`, `user` и ресурсные разрешения;
- Fastify plugin проксирует Fetch Request/Response, включая несколько `Set-Cookie`, на `/api/auth/*`;
- Fastify перезаписывает внутренний client-IP header значением `request.ip` перед передачей запроса в Better Auth; доверие к proxy-заголовкам включается только для явно известных reverse proxy;
- SvelteKit создаёт только Better Auth Svelte Client, а не второй серверный auth instance;
- публичный sign-up в MVP выключен; первоначальный admin создаётся отдельной CLI-командой;
- Telegram/MAX identifiers хранятся в `bot_subscriber`; связь с `user.id` необязательна;
- cookies — HttpOnly, Secure в production и с явным SameSite; secrets и cookies не логируются.

Разрешения определяются для `events`, `sources`, `venues`, `organizers`, `categories`, `publications`, `users`, `settings`. Editor управляет контентом в выданных пределах, но не администраторами и системными настройками.

## 8. HTTP и интеграционные границы

- публичный API: `/api/cities`, `/api/events`, `/api/categories`, `/api/venues`, `/api/organizers`;
- auth: `/api/auth/*`, контракт принадлежит Better Auth;
- административный API: `/api/admin/*`, session + permission обязательны;
- health: `/health/live` не проверяет зависимости, `/health/ready` проверяет PostgreSQL и Redis;
- OpenAPI описывает собственные Fastify routes, но не секретные поля и не внутренние конфигурации;
- единый формат собственных ошибок: `code`, `message`, `requestId`, необязательные безопасные `details`;
- все list endpoints имеют лимит и cursor/page contract; максимальный размер страницы задаётся сервером.

В development SvelteKit proxy направляет `/api` на локальный Fastify. В production reverse proxy обеспечивает один внешний origin. Внутренний SSR URL задаётся отдельно и не попадает в клиентский bundle.

## 9. Данные, время и география

- технические timestamps — `timestamptz`, в PostgreSQL хранятся как абсолютные моменты времени;
- локальное представление вычисляется по IANA timezone города, для Перми — `Asia/Yekaterinburg`;
- координаты — PostGIS `geometry(Point, 4326)` и GiST index;
- событие не содержит единственной даты: расписание хранится в `event_occurrence`;
- неизвестная цена отличается от бесплатного события;
- внешние JSON payloads хранятся как `jsonb`, но проходят валидацию перед использованием;
- удаление опубликованных и связанных сущностей обычно заменяется сменой статуса; правила FK описаны в `docs/database.md`.

## 10. Очереди и надёжность

Очереди MVP: `source-crawl`, `event-processing`, `event-publication`, `notifications`, `maintenance`. Периодика создаётся BullMQ Job Schedulers. Job payloads версионируются и валидируются на постановке и получении.

BullMQ обеспечивает транспорт и retries, но не атомарность с PostgreSQL. Для публикаций, уведомлений и других критических переходов используется transactional outbox. Worker блокирует/claim-ит outbox rows, отправляет job с детерминированным `jobId`, затем помечает запись переданной. Повторная доставка безопасна благодаря idempotency constraints в целевой таблице.

## 11. Конфигурация и безопасность

Переменные окружения валидируются при старте каждого приложения. Публичные и серверные переменные разделены. `.env.example` содержит только безопасные примеры.

Минимальные меры:

- Helmet, ограниченный CORS и trusted proxy только в известных окружениях;
- rate limits для login, публичного API и webhook;
- body/upload limits;
- allowlist и защита от private networks для загружаемых URL;
- очистка внешнего HTML перед публикацией;
- webhook secret/signature и дедупликация update id;
- structured logs с request id и redaction секретов;
- PostgreSQL/Redis не публикуются наружу в production.

## 12. Тестовая стратегия

- unit: `core`, нормализация, права, job schemas и форматирование;
- integration: Fastify inject, Better Auth HTTP, Drizzle repositories и миграции на PostgreSQL/PostGIS;
- worker integration: BullMQ на Redis, retries, idempotency и outbox recovery;
- contract: source и messaging adapters;
- E2E: SvelteKit + Fastify + PostgreSQL + Redis по основному сценарию MVP.

Тесты, которым нужны PostgreSQL/PostGIS или Redis, помечаются integration и запускаются в CI с реальными сервисами, а не с несовместимыми in-memory заменами.

## 13. Версионная политика

На дату ревизии выбран Node.js 24 LTS. Последние npm-релизы проверяются перед установкой, но совместимость важнее номера: TypeScript фиксируется на поддерживаемой ветке 5.9, потому что текущий `typescript-eslint` не поддерживает TypeScript 7. Drizzle ORM и Better Auth Drizzle Adapter выбираются в совместимых peer dependency диапазонах. Lockfile обязателен; автоматические major upgrades без отдельной проверки не допускаются.

## 14. Отложенные решения

Не входят в фундамент и принимаются на соответствующем функциональном этапе:

- конкретные разрешённые источники Перми;
- S3 provider и обработка изображений;
- реальная MAX-интеграция без предоставленного доступа;
- OAuth, passkeys и публичные пользовательские кабинеты;
- отдельный поисковый движок, Kafka, Kubernetes или микросервисы.

Эти решения не блокируют работающий MVP на PostgreSQL FTS/PostGIS, BullMQ и платформенных адаптерах.
