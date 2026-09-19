# City Events

City Events — TypeScript-монорепозиторий городской афиши. MVP ориентирован на Пермь, а модель данных и API поддерживают несколько городов.

## Требования

- Node.js 24 LTS;
- pnpm 10;
- Docker с Compose.

Официальный образ `postgis/postgis` сейчас публикуется только для `linux/amd64`. Compose явно включает эту платформу; на Apple Silicon Docker Desktop запускает PostGIS через эмуляцию, поэтому первый старт может быть медленнее.

## Первый запуск

```bash
cp .env.example .env
pnpm install
pnpm dev:infra
pnpm db:migrate
pnpm db:seed
pnpm dev
```

После запуска:

- SvelteKit: <http://localhost:3000>;
- Fastify liveness: <http://localhost:3001/health/live>;
- Fastify readiness: <http://localhost:3001/health/ready>;
- OpenAPI UI в development: <http://localhost:3001/documentation>.

Чтобы не конфликтовать с уже установленными PostgreSQL/Redis, Compose публикует их локально на портах `55432` и `56379`. Порты можно изменить через `POSTGRES_PORT` и `REDIS_PORT` вместе с соответствующими URL.

Значение `BETTER_AUTH_SECRET` из примера допустимо только локально. Для любого общего или production-окружения задайте случайный секрет длиной не менее 32 байт.

## Команды

```bash
pnpm dev              # все приложения в watch-режиме
pnpm dev:infra        # PostGIS и Redis
pnpm dev:infra:down   # остановить локальную инфраструктуру
pnpm db:generate      # создать Drizzle migration из schema diff
pnpm db:migrate       # применить версионируемые миграции
pnpm db:seed          # идемпотентно добавить Пермь
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check            # полный набор статических проверок и сборки
```

## Архитектура

Fastify — единственный REST backend. SvelteKit отвечает за публичный SSR и административный UI. Drizzle находится в `packages/db`, Better Auth — в `packages/auth`, BullMQ contracts — в `packages/queue`. Публичная афиша и пользовательские боты не требуют регистрации. Подробнее: [`docs/architecture.md`](docs/architecture.md), [`docs/database.md`](docs/database.md), [`docs/implementation-plan.md`](docs/implementation-plan.md).

На текущем этапе реализуется только инфраструктурный фундамент. Каталог, административные сценарии, источники и платформенные боты добавляются следующими вертикальными этапами и не подменяются mock-бизнес-логикой.

Production Dockerfiles приложений намеренно относятся к этапу production hardening: до появления функциональных runtime dependencies преждевременный образ пришлось бы менять на каждом следующем этапе. Локальная инфраструктура PostGIS/Redis уже полностью контейнеризована и проверяется сейчас.
