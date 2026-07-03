# Base architecture — home automation API server

Date: 2026-07-03

## Purpose

Personal NestJS server that acts as the unified control point for home
devices (TV, later: servers, lights, etc). Consumers always talk to this
server via REST, regardless of what protocol the underlying device actually
speaks (HTTP, SSH, MQTT, vendor SDKs, whatever).

This spec covers the foundational setup + module pattern only. No real
device integration is built yet — the TV module is a scaffolded placeholder
template to copy for future modules.

## Stack

- **NestJS + TypeScript** — module system maps directly to "one module per
  device/domain".
- **Biome** — single tool for lint + format, replaces ESLint + Prettier.
- **Zod + `nestjs-zod`** — request validation. Schemas are the single source
  of truth; DTO types are inferred from them (`z.infer<...>`), no separate
  class-validator decorators.
- **Prisma + SQLite** — single-file DB (`prisma/dev.db`). No separate DB
  server to run. Migrations via `prisma migrate dev`.
- **No auth layer in v1.** Server is reachable only via Netbird VPN, not
  exposed to the open internet. Add a guard (API key or JWT) later if that
  changes — not building it speculatively now.

## Tooling

Project init and all module/controller/service scaffolding use the Nest CLI
(`nest new`, `nest g module/controller/service ...`) rather than hand-written
files — CLI output is correctly wired into `AppModule` and matches Nest
conventions.

## Module organization

Flat `src/modules/<name>/` per device/domain. No shared `Device` interface
across modules — TV, lights, and servers don't share enough shape to justify
a forced common contract, and designing one now for devices that don't exist
yet is speculative. Revisit only if a real shared pattern emerges across 2-3
modules.

Each module is self-contained:

```
src/modules/<name>/
  <name>.module.ts
  <name>.controller.ts
  <name>.service.ts
  dto/
    <name>-command.dto.ts   (Zod schema + z.infer type)
```

- `*.module.ts` — declares controller + service, nothing shared, imported
  once into `AppModule`.
- `*.controller.ts` — thin. One route per action. No business logic, just
  delegates to the service.
- `*.service.ts` — where device-specific logic lives (HTTP calls, SSH,
  vendor SDK, MQTT client, etc). This is what actually differs module to
  module.
- `dto/*.dto.ts` — Zod schema for request validation, wired through
  `nestjs-zod`'s validation pipe; type inferred from the schema.

Adding a new module later = copy an existing module folder, rename, fill in
the service body. No scaffolding step needed beyond that.

## Prisma

- `PrismaModule` is `@Global()` and provides `PrismaService` app-wide — no
  per-module re-import needed.
- `prisma/schema.prisma` starts empty (just the `datasource`/`generator`
  blocks). No speculative tables — models get added when a real module
  needs to persist something (config, schedule, token, etc).

## TV module (placeholder template)

Scaffolded but not implemented — a copy-paste starting point for the next
real module:

- `TvModule` — wires `TvController` + `TvService`.
- `TvController` — stub routes, e.g. `POST /tv/power`, `GET /tv/status`,
  delegating to `TvService`.
- `TvService` — empty/stubbed methods (`power()`, `status()`), no real TV
  protocol logic yet. Filled in by hand later.
- `dto/tv-command.dto.ts`:
  ```ts
  export const TvCommandSchema = z.object({ action: z.enum(['on', 'off', 'mute']) });
  export type TvCommandDto = z.infer<typeof TvCommandSchema>;
  ```

## Out of scope (explicitly not building now)

- Any real device protocol integration (TV, lights, servers).
- Auth/guards — deferred until the server is exposed beyond the VPN.
- Shared device interface/abstraction across modules.
- Any DB tables/models — schema stays empty until a module needs one.
