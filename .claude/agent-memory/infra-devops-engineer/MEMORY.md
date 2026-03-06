# Infra / DevOps Engineer Memory

## Project: ai-workflow (JWT Auth REST API)

### Docker Setup (created 2026-03-05)
- Base image: `node:22.14-alpine` (pinned)
- Multi-stage: builder (full deps + tsc) -> production (runtime deps only)
- Non-root user: `appuser:appgroup` via Alpine `addgroup -S` / `adduser -S`
- Health check: `GET /health` endpoint exists in `src/index.ts` line 10
- Default port: 3000 (via `PORT` env var)
- HEALTHCHECK uses `wget` (available on Alpine; curl is not installed by default)

### Environment Variables (from .env)
- `PORT` (default 3000), `NODE_ENV`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `.env.example` created at project root

### Important Database Config Note
- `synchronize` is gated on `NODE_ENV !== 'production'` in `src/config/database.ts`
- Production migrations path: `src/migrations/**/*.ts` -- this may need updating to `dist/migrations/**/*.js` for production builds

### Files Created
- `Dockerfile` -- multi-stage, non-root, HEALTHCHECK
- `.dockerignore` -- excludes node_modules, dist, .env, tests, IDE files
- `.env.example` -- documents all required env vars

### Patterns
- Alpine images do NOT have curl; use `wget --spider` for health checks
- `npm ci --omit=dev` respects NODE_ENV=production and the --omit flag
- Test files under `src/__tests__/` are excluded from Docker context via `.dockerignore`
