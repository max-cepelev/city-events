# Модель данных City Events

Статус: логическая и физическая модель MVP. Дата ревизии: 19 сентября 2026 года.

## 1. Общие правила

- PostgreSQL с расширениями PostGIS и `pg_trgm` является единственным транзакционным хранилищем MVP.
- Drizzle schema и версионируемые SQL-миграции находятся в `packages/db`.
- Доменные идентификаторы — UUID с `gen_random_uuid()`. Идентификаторы служебных таблиц Better Auth остаются строковыми и не изменяются вручную.
- Имена таблиц и столбцов в PostgreSQL — `snake_case`, TypeScript-свойства — `camelCase`.
- Все технические даты — `timestamptz`; приложения передают UTC, отображение использует `city.timezone`.
- Денежные значения — `numeric(12,2)`, валюта — ISO 4217 `char(3)`.
- Координаты — `geometry(Point, 4326)` с GiST index.
- Секреты источников, bot tokens и API keys не хранятся в открытом `jsonb`.
- Публичные запросы никогда не выбирают raw payload, moderation data, auth data или внутреннюю конфигурацию источника.

Физическая схема вводится миграциями по этапам. Документ описывает целевую MVP-модель; первая инфраструктурная миграция создаёт расширения, таблицы Better Auth и `city`, а остальные таблицы добавляются вместе с соответствующими вертикальными функциями.

## 2. Перечисления

| Enum | Значения |
| --- | --- |
| `event_status` | `draft`, `pending_review`, `published`, `rejected`, `cancelled`, `archived` |
| `occurrence_status` | `scheduled`, `cancelled`, `postponed`, `completed` |
| `source_type` | `api`, `rss`, `ical`, `html`, `manual` |
| `source_processing_status` | `received`, `normalized`, `matched`, `pending_review`, `processed`, `failed`, `ignored` |
| `run_status` | `pending`, `running`, `succeeded`, `partially_succeeded`, `failed`, `cancelled` |
| `outbox_status` | `pending`, `processing`, `published`, `failed` |
| `platform` | `telegram`, `max` |
| `publication_status` | `pending`, `processing`, `published`, `failed`, `cancelled` |
| `delivery_status` | `pending`, `processing`, `delivered`, `failed`, `skipped` |
| `duplicate_status` | `pending`, `merged`, `separate`, `needs_review` |

Enums, значения которых являются публичным API-контрактом, зеркалируются безопасными типами в `packages/shared`.

## 3. Авторизация Better Auth

Схема генерируется официальным Better Auth CLI с включённым Drizzle Adapter и Admin Plugin. Ручная прикладная таблица пользователей запрещена.

### `user`

Базовые поля Better Auth: `id`, `name`, `email`, `email_verified`, `image`, `created_at`, `updated_at`. Admin Plugin добавляет `role`, `banned`, `ban_reason`, `ban_expires`. Точный набор и типы синхронизируются CLI выбранной версии Better Auth.

Ограничения и индексы:

- PK `id`;
- UNIQUE lower-canonical email согласно сгенерированной схеме Better Auth;
- index по `role` нужен только при подтверждённом административном запросе, преждевременно не добавляется.

### `session`

Поля Better Auth включают `id`, `user_id`, `token`, `expires_at`, `ip_address`, `user_agent`, `created_at`, `updated_at`; Admin Plugin добавляет `impersonated_by`.

- PK `id`;
- UNIQUE `token`;
- index `user_id`;
- FK `user_id -> user.id ON DELETE CASCADE`.

### `account`

Хранит email/password credential и будущие внешние providers. Поля и уникальные ограничения генерируются Better Auth CLI. FK на `user.id` удаляется каскадно.

### `verification`

Хранит одноразовые verification/reset records со сроком действия. Индексируется identifier; просроченные записи удаляются maintenance job.

При обновлении Better Auth сначала повторно генерируется схема во временный файл, изучается diff, затем создаётся обычная Drizzle migration. Служебные поля не переименовываются ради общего naming style.

## 4. Каталог

### `city`

| Поле | Тип | Правила |
| --- | --- | --- |
| `id` | uuid | PK |
| `name` | varchar(160) | NOT NULL |
| `slug` | varchar(160) | NOT NULL, UNIQUE |
| `region` | varchar(160) | NOT NULL |
| `country_code` | char(2) | NOT NULL |
| `timezone` | varchar(64) | NOT NULL, IANA identifier валидируется приложением |
| `location` | geometry(Point,4326) | nullable |
| `is_active` | boolean | NOT NULL DEFAULT true |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |

Индексы: UNIQUE `slug`, partial btree `slug WHERE is_active`, GiST `location`. Seed идемпотентно создаёт Пермь (`perm`, `RU`, `Asia/Yekaterinburg`).

### `category`

`id`, `name`, `slug`, nullable `parent_id`, `sort_order`, `is_active`, timestamps.

- UNIQUE `slug`;
- FK `parent_id -> category.id ON DELETE RESTRICT`;
- CHECK `parent_id <> id`;
- index `(parent_id, sort_order)` и partial `(sort_order) WHERE is_active`.

Произвольная глубина технически допустима, но UI MVP использует не более двух уровней.

### `tag`

`id`, `name`, `slug`, timestamps; UNIQUE `slug` и UNIQUE case-insensitive normalized name на уровне приложения/индекса.

### `media_asset`

Необходима как цель `image_id` из Event/Venue и единая точка хранения метаданных объекта. Поля: `id`, `storage_key`, `public_url`, `content_type`, `byte_size`, nullable `width`, `height`, `alt_text`, `source_url`, `created_at`, `updated_at`.

- UNIQUE `storage_key`;
- CHECK положительных размеров;
- бинарные данные в PostgreSQL не хранятся.

### `venue`

`id`, `city_id`, `name`, `slug`, `description`, `address`, `location`, `website`, `phone`, `image_id`, timestamps.

- UNIQUE `(city_id, slug)`;
- FK `city_id -> city.id ON DELETE RESTRICT`;
- FK `image_id -> media_asset.id ON DELETE SET NULL`;
- index `(city_id, name)`;
- GiST `location`.

### `organizer`

`id`, `name`, `description`, `website`, `contact_information jsonb`, timestamps.

- index по normalized name;
- GIN trigram index добавляется вместе с дедупликацией организаторов;
- `contact_information` не входит в публичный DTO целиком: наружу выбираются только явно разрешённые поля.

### `event`

| Поле | Тип | Правила |
| --- | --- | --- |
| `id` | uuid | PK |
| `city_id` | uuid | NOT NULL, FK city RESTRICT |
| `title` | varchar(240) | NOT NULL |
| `slug` | varchar(240) | NOT NULL |
| `short_description` | varchar(500) | nullable |
| `description` | text | nullable, очищенный HTML/текст |
| `category_id` | uuid | NOT NULL, FK category RESTRICT |
| `organizer_id` | uuid | nullable, FK organizer SET NULL |
| `venue_id` | uuid | nullable, FK venue SET NULL |
| `status` | event_status | NOT NULL DEFAULT draft |
| `age_restriction` | smallint | nullable, CHECK 0..21 |
| `image_id` | uuid | nullable, FK media_asset SET NULL |
| `is_free` | boolean | nullable |
| `price_from` | numeric(12,2) | nullable, CHECK >= 0 |
| `price_to` | numeric(12,2) | nullable, CHECK >= price_from |
| `currency` | char(3) | nullable |
| `ticket_url` | text | nullable |
| `original_url` | text | nullable |
| `published_at` | timestamptz | nullable |
| `created_at`, `updated_at` | timestamptz | NOT NULL |

`is_free` имеет три состояния: `true` — бесплатно, `false` — платно, `null` — стоимость неизвестна. При `true` цены должны быть null или zero; отсутствие цены не превращает событие в бесплатное.

Индексы:

- UNIQUE `(city_id, slug)`;
- btree `(city_id, status)`;
- partial `(city_id, published_at DESC) WHERE status = 'published'`;
- GIN полнотекстового search vector по title/short description/description;
- GIN trigram по normalized title для дедупликации;
- индексы FK `category_id`, `organizer_id`, `venue_id`.

Публичный каталог всегда начинает запрос с `status = 'published'` и существующего будущего/текущего occurrence.

### `event_occurrence`

`id`, `event_id`, `starts_at`, nullable `ends_at`, `status`, nullable `venue_id`, timestamps.

- FK `event_id -> event.id ON DELETE CASCADE`;
- FK `venue_id -> venue.id ON DELETE SET NULL`;
- CHECK `ends_at IS NULL OR ends_at >= starts_at`;
- index `(event_id, starts_at)`;
- partial index `(starts_at, event_id) WHERE status = 'scheduled'`;
- index `venue_id`.

В `event` не добавляется поле единственной даты. Часовой пояс не копируется в occurrence: он определяется городом event; абсолютные моменты остаются корректными при DST.

### `event_tag`

`event_id`, `tag_id`; составной PK. Оба FK имеют `ON DELETE CASCADE`. Дополнительный index `(tag_id, event_id)` обеспечивает обратный поиск.

## 5. Источники, импорт и модерация

### `event_source`

`id`, `name`, `type`, `base_url`, `city_id`, `adapter_key`, `configuration jsonb`, `schedule jsonb`, `is_active`, `last_run_at`, `last_success_at`, timestamps.

- FK `city_id -> city.id ON DELETE RESTRICT`;
- UNIQUE `(city_id, name)`;
- UNIQUE `(city_id, adapter_key)` при одном экземпляре адаптера; при необходимости это ограничение пересматривается;
- partial index `(is_active, city_id) WHERE is_active`.

`configuration` содержит только несекретные параметры. Секрет указывается ссылкой на environment/secret-manager key, а не значением.

### `source_event`

`id`, `source_id`, nullable `external_id`, nullable `external_url`, `raw_data jsonb`, nullable `normalized_data jsonb`, `content_hash char(64)`, nullable `event_id`, `processing_status`, nullable `error_code`, `last_seen_at`, timestamps.

- FK `source_id -> event_source.id ON DELETE RESTRICT`;
- FK `event_id -> event.id ON DELETE SET NULL`;
- UNIQUE `(source_id, external_id)` с partial predicate `external_id IS NOT NULL`;
- UNIQUE `(source_id, external_url)` с partial predicate `external_url IS NOT NULL`;
- index `(source_id, content_hash)`;
- index `(processing_status, created_at)`.

Raw data сохраняется для аудита с политикой retention. В публичные выборки таблица не попадает.

### `import_run`

`id`, `source_id`, `status`, `started_at`, nullable `completed_at`, counters `imported_count`, `updated_count`, `skipped_count`, `failed_count`, nullable `error_message`, nullable `job_id`, timestamps.

- FK source RESTRICT;
- UNIQUE `job_id` при наличии;
- index `(source_id, started_at DESC)`;
- CHECK counters >= 0 и completed_at >= started_at.

### `duplicate_candidate`

Таблица нужна для требуемого ручного экрана совпадений. Поля: `id`, `left_event_id`, `right_event_id`, `score`, `reasons jsonb`, `status`, nullable `resolved_by`, `resolved_at`, timestamps.

- обе ссылки event — `ON DELETE CASCADE`;
- `resolved_by -> user.id ON DELETE SET NULL`;
- канонический CHECK/order пары и UNIQUE пары исключают зеркальные дубли;
- index `(status, created_at)`.

### `moderation_action`

Необходима для истории одобрений, отклонений и объединений. Поля: `id`, `event_id`, nullable `actor_user_id`, `action`, nullable `from_status`, nullable `to_status`, nullable `comment`, `metadata jsonb`, `created_at`.

- event RESTRICT, чтобы не терять аудит;
- actor `user.id ON DELETE SET NULL`;
- index `(event_id, created_at DESC)` и `(actor_user_id, created_at DESC)`.

## 6. Боты и подписки

### `bot_subscriber`

`id`, `platform`, `platform_user_id`, `chat_id`, `city_id`, nullable `user_id`, `is_active`, `notifications_enabled`, nullable `last_interaction_at`, timestamps.

- UNIQUE `(platform, platform_user_id)`;
- index `(platform, chat_id)`;
- FK city RESTRICT;
- FK `user_id -> user.id ON DELETE SET NULL`;
- partial index `(city_id, platform) WHERE is_active AND notifications_enabled`.

Отсутствие `user_id` — штатное состояние, а не ошибка.

### `subscription`

`id`, `subscriber_id`, `category_id`, nullable `max_price`, `include_free`, `enabled`, timestamps.

- FK subscriber CASCADE;
- FK category RESTRICT;
- UNIQUE `(subscriber_id, category_id)`;
- CHECK `max_price IS NULL OR max_price >= 0`;
- partial index `(category_id, subscriber_id) WHERE enabled`.

Город берётся из subscriber. При появлении подписок на несколько городов связь будет нормализована отдельной миграцией, а не массивом JSON.

## 7. Публикации и надёжная доставка

### `publication_channel`

Нужна для конфигурации каналов, требуемой ТЗ. Поля: `id`, `platform`, `destination_id`, `name`, `configuration jsonb`, `is_active`, `auto_publish`, timestamps.

- UNIQUE `(platform, destination_id)`;
- configuration не содержит bot token;
- partial index по active channels.

### `publication`

`id`, `event_id`, nullable `occurrence_id`, `channel_id`, `idempotency_key`, nullable `external_message_id`, `status`, `attempts`, nullable `published_at`, nullable `last_error`, timestamps.

- FK event RESTRICT, occurrence SET NULL, channel RESTRICT;
- UNIQUE `idempotency_key` — основной барьер повторной публикации;
- UNIQUE `(channel_id, external_message_id)` при external id;
- index `(status, updated_at)`;
- CHECK attempts >= 0.

### `notification_delivery`

Отдельный журнал персональных отправок: `id`, `subscriber_id`, `event_id`, nullable `occurrence_id`, `idempotency_key`, `status`, `attempts`, nullable `external_message_id`, `delivered_at`, `last_error`, timestamps.

- UNIQUE `idempotency_key`;
- FK subscriber/event RESTRICT, occurrence SET NULL;
- index `(status, updated_at)` и `(subscriber_id, created_at DESC)`.

### `outbox_event`

`id`, `type`, `aggregate_type`, `aggregate_id`, `payload jsonb`, `status`, `attempts`, `available_at`, nullable `locked_at`, nullable `processed_at`, nullable `last_error`, `created_at`.

- index `(status, available_at, created_at)` для dispatcher;
- index `(aggregate_type, aggregate_id)`;
- CHECK attempts >= 0;
- retention удаляет только давно обработанные записи отдельной maintenance-задачей.

Outbox row создаётся в одной транзакции с изменением доменной сущности. Payload содержит версию события. Он не должен включать секреты или полный raw source payload.

## 8. Связи и правила удаления

```text
city 1 ── * event 1 ── * event_occurrence
  │            ├── * event_tag * ── 1 tag
  │            ├── * source_event * ── 1 event_source
  │            ├── * publication
  │            └── * moderation_action
  ├── * venue
  ├── * event_source ── * import_run
  └── * bot_subscriber ── * subscription

user 1 ── * session/account
  ├── 0..* bot_subscriber (optional link)
  └── 0..* moderation_action
```

Правила:

- справочники, на которые ссылается контент, удаляются с `RESTRICT`; используются `is_active` или архивирование;
- owned children (`event_occurrence`, `event_tag`) удаляются `CASCADE` вместе с допустимым удалением draft event;
- необязательные представительные связи (`venue_id`, `organizer_id`, `image_id`, bot `user_id`) — `SET NULL`;
- опубликованные события не удаляются обычным CRUD: они отменяются или архивируются;
- auth sessions/accounts удаляются каскадно вместе с user средствами Better Auth;
- audit/import/publication history не должна исчезать из-за удаления справочника.

## 9. Поиск и геозапросы

Каталог MVP использует PostgreSQL:

- generated/stored `tsvector` с конфигурацией `russian` и GIN index;
- `websearch_to_tsquery` для пользовательского текста;
- trigram similarity только для дедупликации и tolerant admin search;
- occurrence index для диапазона дат;
- PostGIS `ST_DWithin` для радиуса; входные метры явно переводятся в подходящий geography expression;
- сначала применяются city/status/date predicates, затем полнотекстовый/геофильтр.

Query plans ключевых запросов проверяются `EXPLAIN (ANALYZE, BUFFERS)` на реалистичном seed-наборе до объявления этапа каталога завершённым.

## 10. Миграции и seed

Порядок первой установки:

1. создать extensions `postgis` и `pg_trgm` контролируемой SQL-миграцией;
2. применить Drizzle migrations;
3. выполнить идемпотентный seed Перми и стартовых категорий соответствующего этапа;
4. создать initial admin отдельной защищённой CLI-командой, не seed-файлом и не публичным endpoint.

Правила изменений:

- `drizzle-kit push` не используется в production;
- schema diff генерируется Drizzle Kit и проверяется перед commit;
- destructive migration требует backfill/двухфазного rollout и отдельного решения;
- миграция проверяется как на чистой БД, так и поверх предыдущей версии;
- rollback для изменения данных проектируется явно; надежда на автоматический down не считается планом;
- приложение не создаёт соединение при импорте package.

## 11. Резервное копирование и retention

Production должен иметь регулярный `pg_dump`/provider backup и проверяемую процедуру восстановления. Отдельно задаются сроки хранения `source_event.raw_data`, завершённых `outbox_event`, `import_run` и delivery logs. До утверждения бизнес-сроков записи не удаляются автоматически, кроме заведомо просроченных verification/session records штатными механизмами.
