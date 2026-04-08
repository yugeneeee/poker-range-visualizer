# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Poker Range Visualizer (`artifacts/poker-range`)
- **Type**: react-vite, frontend-only (no backend)
- **Preview path**: `/`
- **Purpose**: Visualizes poker ranges from text input (Raise/Call/Fold sections)
- **Key files**:
  - `src/lib/parseRange.ts` — parser for range text format, hand expansion
  - `src/components/RangeGrid.tsx` — 13x13 grid with proportional color cells
  - `src/pages/Home.tsx` — main page with textarea input, stats, legend
- **Features**:
  - Parses hand notation: `AA`, `AKs`, `AKo`, `AK` (both), `AA:0.5` (freq)
  - Colors: Red=Raise, Green=Call, Blue=Fold, Dark=No action
  - Proportional cell coloring (gradient) for mixed frequencies
  - Hover tooltip showing hand and frequency breakdown
  - Ctrl+Enter to apply, stats panel

### API Server (`artifacts/api-server`)
- **Type**: Express 5 API
- **Path**: `/api`
- Health check at `/api/healthz`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
