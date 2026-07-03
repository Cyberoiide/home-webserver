# Base Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the NestJS base project — Biome, Zod validation, Prisma+SQLite, and one scaffolded placeholder module (`tv`) that serves as the copy-paste template for every future device module.

**Architecture:** Nest CLI generates the project and every module/controller/service. `PrismaModule` is global, providing `PrismaService` app-wide. Zod schemas validate requests via `nestjs-zod`'s global `ZodValidationPipe`, registered through `APP_PIPE`. The `tv` module is wired but unimplemented — a template, not a real integration.

**Tech Stack:** NestJS 11 + TypeScript, Biome (lint+format), Zod + nestjs-zod (validation), Prisma 7 + SQLite via `@prisma/adapter-better-sqlite3` (persistence).

## Global Constraints

- No auth/guards — server reachable only via Netbird VPN, not exposed to the open internet. Do not add auth code in this plan.
- No shared `Device` interface across modules — each module is independent, no common contract.
- No speculative Prisma models — `schema.prisma` stays empty (just `datasource`/`generator`) until a real module needs a table. The `tv` module in this plan does NOT get a model.
- All module/controller/service scaffolding MUST use the Nest CLI (`nest g ...`), not hand-written files. Hand-written files are only for content the CLI doesn't generate (Zod DTOs, Prisma service/module, biome config edits).
- Package manager: npm (already the default used during exploration; no reason to switch for a solo home project).

---

### Task 1: Initialize Nest project + Biome

**Files:**
- Create (via `nest new`): `package.json`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`, `src/app.service.ts`, `src/app.controller.spec.ts`, `test/jest-e2e.json`, `test/app.e2e-spec.ts`
- Create (via `biome init`): `biome.json`
- Delete: `eslint.config.mjs`, `.prettierrc` (replaced by Biome)
- Modify: `package.json` (swap lint/format scripts to Biome, remove eslint/prettier deps)

**Interfaces:**
- Produces: a runnable Nest app (`npm run start:dev` serves on port 3000), `npm run lint` / `npm run format` backed by Biome.

- [ ] **Step 1: Generate the Nest project in place**

Run (this repo dir already has `docs/` and `.git/` — confirmed safe, `nest new .` merges into a non-empty directory without touching existing files):

```bash
npx @nestjs/cli new . --skip-git --package-manager npm --strict
```

When prompted for package manager, npm is already passed via flag so it won't prompt. This installs dependencies too (no `--skip-install`).

- [ ] **Step 2: Verify the app boots**

Run: `npm run start:dev`
Expected: log line `Nest application successfully started`, then Ctrl+C to stop.

- [ ] **Step 3: Remove ESLint/Prettier, add Biome**

```bash
npm uninstall eslint @eslint/eslintrc @eslint/js eslint-config-prettier eslint-plugin-prettier globals prettier typescript-eslint
rm eslint.config.mjs .prettierrc
npm install --save-dev --save-exact @biomejs/biome
npx @biomejs/biome init
```

- [ ] **Step 4: Update biome.json for git integration**

Edit `biome.json`, set `vcs.enabled` to `true` and `vcs.useIgnoreFile` to `true` (repo is already a git repo, confirmed earlier):

```json
{
	"$schema": "https://biomejs.dev/schemas/2.5.2/schema.json",
	"vcs": {
		"enabled": true,
		"clientKind": "git",
		"useIgnoreFile": true
	},
	"files": {
		"ignoreUnknown": false
	},
	"formatter": {
		"enabled": true,
		"indentStyle": "tab"
	},
	"linter": {
		"enabled": true,
		"rules": {
			"preset": "recommended"
		}
	},
	"javascript": {
		"formatter": {
			"quoteStyle": "single"
		}
	},
	"assist": {
		"enabled": true,
		"actions": {
			"source": {
				"organizeImports": "on"
			}
		}
	}
}
```

- [ ] **Step 5: Replace package.json lint/format scripts**

In `package.json`, replace:

```json
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
```
with:
```json
    "format": "biome format --write .",
```

and replace:
```json
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
```
with:
```json
    "lint": "biome lint --write .",
```

- [ ] **Step 6: Run Biome check to confirm it's wired up**

Run: `npx @biomejs/biome check .`
Expected: exits reporting the generated Nest files pass (or applies safe formatting fixes — if it reformats files, that's expected on first run).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold nest project, replace eslint/prettier with biome"
```

---

### Task 2: Prisma + SQLite setup

**Files:**
- Create: `prisma/schema.prisma`, `prisma.config.ts`, `.env`
- Create: `src/prisma/prisma.module.ts`
- Create: `src/prisma/prisma.service.ts`
- Modify: `src/app.module.ts` (import `PrismaModule`)
- Modify: `.gitignore` (ensure `.env` and `prisma/dev.db` are ignored — `nest new` already ignores common patterns but `prisma init` also writes its own `.gitignore` additions; verify no duplicate/conflicting entries)

**Interfaces:**
- Produces: `PrismaService` (extends `PrismaClient`, injectable anywhere — `PrismaModule` is `@Global()`).
- Consumes: `@prisma/adapter-better-sqlite3`'s `PrismaBetterSqlite3` adapter class.

- [ ] **Step 1: Install Prisma**

```bash
npm install --save-dev prisma
npm install @prisma/client @prisma/adapter-better-sqlite3
```

- [ ] **Step 2: Initialize Prisma with SQLite**

```bash
npx prisma init --datasource-provider sqlite
```

This creates `prisma/schema.prisma`, `prisma.config.ts`, `.env` (with `DATABASE_URL="file:./dev.db"`), and appends ignore entries to `.gitignore`.

- [ ] **Step 3: Fix prisma.config.ts to load dotenv**

`prisma.config.ts` as generated requires `dotenv/config` to actually load `.env` — confirmed during testing that without this, `prisma generate`/`migrate` fail with "Cannot find module 'dotenv/config'" if dotenv isn't present. Install it:

```bash
npm install --save-dev dotenv
```

Verify `prisma.config.ts` contains (it should already, generated by `prisma init`):

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

- [ ] **Step 4: Leave schema.prisma empty of models (per Global Constraints)**

`prisma/schema.prisma` should look like:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

No models yet — confirmed by spec this stays empty until a real module needs one.

- [ ] **Step 5: Generate the Prisma client**

```bash
npx prisma generate
```

Expected output: `Prisma Client generated` (this succeeds even with zero models).

- [ ] **Step 6: Write PrismaService**

Create `src/prisma/prisma.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
    super({ adapter });
  }
}
```

- [ ] **Step 7: Write PrismaModule as global**

Create `src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 8: Wire PrismaModule into AppModule**

Edit `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 9: Verify the app still boots with Prisma wired in**

Run: `npm run start:dev`
Expected: starts cleanly, no DI errors about `PrismaService`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add prisma with sqlite adapter as a global module"
```

---

### Task 3: Zod validation setup

**Files:**
- Modify: `src/app.module.ts` (register `ZodValidationPipe` via `APP_PIPE`)
- Modify: `package.json` (add `nestjs-zod`, `zod` dependencies — done via npm install)

**Interfaces:**
- Produces: every controller in the app now validates `@Body()`/`@Param()`/`@Query()` against Zod-derived DTOs automatically, no per-controller pipe wiring needed.

- [ ] **Step 1: Install nestjs-zod and zod**

```bash
npm install nestjs-zod zod
```

- [ ] **Step 2: Register ZodValidationPipe globally**

Edit `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
```

- [ ] **Step 3: Verify the app still boots**

Run: `npm run start:dev`
Expected: starts cleanly.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: register global zod validation pipe"
```

---

### Task 4: TV placeholder module (template for future modules)

**Files:**
- Create (via `nest g module modules/tv`): `src/modules/tv/tv.module.ts`
- Create (via `nest g controller modules/tv`): `src/modules/tv/tv.controller.ts`, `src/modules/tv/tv.controller.spec.ts`
- Create (via `nest g service modules/tv`): `src/modules/tv/tv.service.ts`, `src/modules/tv/tv.service.spec.ts`
- Create: `src/modules/tv/dto/tv-command.dto.ts`
- Modify: `src/app.module.ts` (CLI auto-adds `TvModule` import)

**Interfaces:**
- Produces: `TvCommandDto` (class, validated Zod shape `{ action: 'on' | 'off' | 'mute' }`), `TvService.power(dto: TvCommandDto)`, `TvService.status()` — stub methods, no real device logic (out of scope per spec).
- Consumes: `ZodValidationPipe` (Task 3) validates `TvCommandDto` automatically on any route using it.

- [ ] **Step 1: Generate the module, controller, and service via Nest CLI**

```bash
npx @nestjs/cli g module modules/tv
npx @nestjs/cli g controller modules/tv
npx @nestjs/cli g service modules/tv
```

Confirmed behavior (tested): this creates `src/modules/tv/tv.module.ts` wiring `TvController` + `TvService`, and auto-updates `src/app.module.ts` to import `TvModule`.

- [ ] **Step 2: Write the Zod DTO**

Create `src/modules/tv/dto/tv-command.dto.ts`:

```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TvCommandSchema = z.object({
  action: z.enum(['on', 'off', 'mute']),
});

export class TvCommandDto extends createZodDto(TvCommandSchema) {}
```

- [ ] **Step 3: Stub the service methods**

Edit `src/modules/tv/tv.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import type { TvCommandDto } from './dto/tv-command.dto';

@Injectable()
export class TvService {
  power(_dto: TvCommandDto): { ok: true } {
    // No real TV protocol wired up yet — this is a template for future
    // device modules. Fill in the actual device call here.
    return { ok: true };
  }

  status(): { action: 'unknown' } {
    return { action: 'unknown' };
  }
}
```

- [ ] **Step 4: Wire the controller routes**

Edit `src/modules/tv/tv.controller.ts`:

```typescript
import { Body, Controller, Get, Post } from '@nestjs/common';
import { TvCommandDto } from './dto/tv-command.dto';
import { TvService } from './tv.service';

@Controller('tv')
export class TvController {
  constructor(private readonly tvService: TvService) {}

  @Post('power')
  power(@Body() dto: TvCommandDto) {
    return this.tvService.power(dto);
  }

  @Get('status')
  status() {
    return this.tvService.status();
  }
}
```

- [ ] **Step 5: Update the generated controller spec**

The CLI-generated `src/modules/tv/tv.controller.spec.ts` only checks the controller is defined — that's fine as-is, no changes needed since there's no real logic yet to test beyond DI wiring. Leave it as generated.

- [ ] **Step 6: Verify the app boots and the route responds**

Run: `npm run start:dev`

In another terminal:
```bash
curl -X POST http://localhost:3000/tv/power -H "Content-Type: application/json" -d '{"action":"on"}'
```
Expected: `{"ok":true}`

```bash
curl -X POST http://localhost:3000/tv/power -H "Content-Type: application/json" -d '{"action":"invalid"}'
```
Expected: HTTP 400 with a Zod validation error body (rejecting the invalid enum value).

```bash
curl http://localhost:3000/tv/status
```
Expected: `{"action":"unknown"}`

Stop the dev server (Ctrl+C).

- [ ] **Step 7: Run the generated unit tests**

Run: `npm test`
Expected: PASS (the CLI-generated `.spec.ts` files for `TvController`/`TvService` just check DI wiring, no assertions to update).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold tv module as template for future device modules"
```

---

## Post-plan state

At the end of this plan: a booting Nest app, Biome for lint/format, Prisma+SQLite wired globally with an empty schema, Zod validation globally enforced, and a `tv` module with real routes but stubbed device logic — ready to copy for `lights`, `servers`, etc., and ready for you to fill in the actual TV protocol call by hand.
