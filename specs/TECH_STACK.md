# Tech Stack

## Overview
Full-stack running training app (Runna clone) with Strava integration.

## Frontend

### Core
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v6

### Styling
- **CSS Framework**: TailwindCSS
- **Approach**: Mobile-first responsive design

### UI Library
- **Component Library**: shadcn/ui


### State Management
- **Local State**: React useState
- **Server State**: TanStack Query (React Query) - for API caching and synchronization

### Key Libraries (to install as needed)
- `dayjs` - date manipulation
- `recharts` or `chart.js` - workout charts/visualizations (future)
- `axios` - HTTP client

## Backend

### Core
- **Framework**: NestJS
- **Language**: TypeScript
- **Runtime**: Node.js 18+ and PNPM

### Database
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Migrations**: Prisma Migrate

### Authentication & Authorization
- **Strategy**: Passport.js
- **OAuth Provider**: Strava OAuth 2.0
- **Session/Token**: JWT tokens
- **Libraries**:
  - `@nestjs/passport`
  - `@nestjs/jwt`
  - `passport`
  - `passport-oauth2`

### API Design
- **Style**: RESTful API
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI (via @nestjs/swagger)

### Key Libraries
- `@nestjs/config` - environment configuration
- `@nestjs/schedule` - cron jobs for webhook processing
- `bcrypt` - password hashing (if needed for future local auth)

## Database

### Primary Database
- **Type**: PostgreSQL
- **ORM**: Prisma
- **Schema**: See DATABASE_SCHEMA.md

### Data Types
- UUIDs for primary keys
- JSONB for flexible data (raw Strava responses)
- Timestamps for audit trails

## External APIs

### Strava API v3
- **Authentication**: OAuth 2.0
- **Webhooks**: Event subscriptions for activity updates
- **Rate Limits**: 
  - 200 requests per 15 minutes
  - 2,000 requests per day
- **Endpoints Used**:
  - `/oauth/authorize` - user authorization
  - `/oauth/token` - token exchange
  - `/api/v3/athlete` - athlete profile
  - `/api/v3/activities/{id}` - activity details
  - `/api/v3/push_subscriptions` - webhook management

## Development Tools

### Code Quality
- **Linter**: ESLint
- **Formatter**: Prettier
- **Pre-commit**: Husky + lint-staged (optional)

### Testing (Future)
- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest (built-in with NestJS)
- **E2E**: Playwright (optional)

## Deployment (Planned)

### Frontend
- **Platform**: Vercel
- **Build**: Automatic on git push
- **Environment**: Production + Preview

### Backend
- **Platform**: Railway / Render / Fly.io
- **Database**: Included with Railway or separate Supabase
- **Environment Variables**: Managed via platform dashboard

### CI/CD
- GitHub Actions (future)
- Automated tests before deploy

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/runna_clone
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_CALLBACK_URL=http://localhost:3000/auth/strava/callback
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_STRAVA_CLIENT_ID=your_client_id
```

## Development Workflow

1. **Local Development**:
   - Backend: `npm run start:dev` (NestJS with hot reload)
   - Frontend: `npm run dev` (Vite dev server)
   - Database: Local PostgreSQL or Docker container

2. **Database Migrations**:
   ```bash
   npx prisma migrate dev --name description
   npx prisma generate
   ```

3. **API Testing**:
   - Swagger UI: http://localhost:3000/api
   - Postman/Insomnia collections (optional)

## Architecture Decisions

### Why NestJS?
- TypeScript-first
- Built-in dependency injection
- Modular architecture
- Great for scalable backend services
- Excellent documentation

### Why Prisma?
- Type-safe database client
- Excellent TypeScript support
- Easy migrations
- Introspection and schema visualization
- Great developer experience

### Why Vite?
- Fast HMR (Hot Module Replacement)
- Optimized build output
- Native ESM support
- Better than Create React App for modern apps

### Why PostgreSQL?
- Robust relational database
- JSONB support for flexible data
- Excellent with Prisma
- Free tier available on many platforms
- Industry standard

## Future Considerations

### Scalability
- Redis for caching (if needed)
- Queue system for webhook processing (Bull/BullMQ)
- Database read replicas

### Monitoring
- Sentry for error tracking
- LogRocket for session replay
- Application performance monitoring (APM)

### Features
- Real-time updates (WebSockets/Server-Sent Events)
- Mobile app (React Native)
- Advanced analytics