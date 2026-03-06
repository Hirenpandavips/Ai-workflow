# my-ai-workflow

## Project Overview
JWT Auth REST API — Node.js + TypeScript + Express + TypeORM + PostgreSQL.

## Tech Stack
- Language: TypeScript (strict, no `any`)
- Framework: Express
- ORM: TypeORM with PostgreSQL
- Auth: bcryptjs + jsonwebtoken
- Tests: Jest + Supertest (unit + integration)
- Linting: ESLint + Prettier

## Key Commands
- `npm run dev`          → Start dev server (ts-node-dev)
- `npm run build`        → Compile TypeScript to dist/
- `npm test`             → Run all Jest tests
- `npm run test:coverage`→ Run tests with coverage report
- `npm run lint`         → Lint all TypeScript files
- `npm run lint:fix`     → Auto-fix lint issues

## Project Structure
```
src/
├── config/         → Database connection (AppDataSource)
├── entity/         → TypeORM entities (User, etc.)
├── middleware/      → Express middleware (auth, error handling)
├── routes/         → Route handlers — one file per resource
├── services/       → Business logic — always unit-testable
├── types/          → Shared TypeScript interfaces/DTOs
└── __tests__/      → Jest tests mirroring src structure
```

## Architecture Rules
- Services contain ALL business logic — routes are thin wrappers
- Every service function must have a corresponding unit test
- Routes only call service functions and handle HTTP status codes
- DTOs (RegisterDto, LoginDto) live in src/types/index.ts

## Coding Rules
- NEVER use `any` type — use `unknown` if type is truly unknown
- NEVER put business logic directly in route handlers
- ALWAYS use async/await — never raw .then() chains
- ALWAYS hash passwords with bcrypt before saving
- NEVER log sensitive data (passwords, tokens) to console
- ALWAYS return consistent error shape: `{ message: string }`
- Run `npm run lint:fix` after making code changes
- Run `npm test` before declaring any task complete

## Git Rules
- Never commit to `main` directly
- Commit message format: `feat:`, `fix:`, `test:`, `chore:`
- NEVER run `git push --force`
- NEVER commit `.env` — only `.env.example`

## What Claude Should NEVER Do
- Never modify `.env` file
- Never delete any test files
- Never skip running tests before saying "done"
- Never use `synchronize: true` in production DB config
- Never store plain-text passwords