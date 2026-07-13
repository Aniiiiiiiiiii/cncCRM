# Code N Clicks IT Solutions - Enterprise CRM Platform

A secure, enterprise-grade, SaaS-ready CRM dashboard built with custom Clean Architecture, repository service patterns, and a duotone design system.

---

## 🏗️ Folder Structure

```
cncCRM/
├── backend/                  # express.js TS service layer
│   ├── prisma/               # schema definitions & seeding scripts
│   ├── src/
│   │   ├── config/           # database SINGLETON, log configs, socket init
│   │   ├── controllers/      # routing logic (auth, leads, HR, accounting)
│   │   ├── middlewares/      # token verification, RBAC check, uploads
│   │   ├── routes/           # REST endpoints mapping
│   │   ├── services/         # auth operations & log streams
│   │   ├── types/            # express request overrides
│   │   ├── utils/            # app exception classes
│   │   ├── app.ts            # security loaders
│   │   └── server.ts         # socket bootloader
│   ├── package.json
│   └── tsconfig.json
└── frontend/                 # next.js 15 tailwind v4 client
    ├── src/
    │   ├── app/              # next.js app router & providers
    │   ├── components/       # common collapse sidebars & palette modals
    │   ├── hooks/            # query hooks
    │   ├── lib/              # custom axios wrappers
    │   ├── store/            # zustand authentication states
    │   └── types/            # typescript interfaces
    ├── package.json
    └── tsconfig.json
```

---

## 🔑 Database Setup & Self-Healing Authentications

The system is configured to connect to MySQL using the modern default authentication mechanism (`caching_sha2_password`).

1. **Verify your local MySQL Server** is running.
2. In the `backend/.env` file, the `DATABASE_URL` is set to connect to `localhost:3306` with database name `cnc_crm` and credentials:
   - User: `root`
   - Password: `An1meParadise@2026`
3. Run the following command inside `backend/` to push the schema and create the tables:
   ```bash
   npx prisma db push
   ```
4. Populate the database with highly realistic enterprise records:
   ```bash
   npm run prisma:seed
   ```

---

## ⚡ Deployment & Running Microservices

### Starting the Backend Server
```bash
cd backend
npm run dev
```
The Express server boots on `http://localhost:5000` with active WebSocket endpoints.

### Starting the Frontend Client
```bash
cd frontend
npm run dev
```
The Next.js application fires on `http://localhost:3000`.

---

## 🐋 Docker Compose & Production Orchestration

To run the entire ecosystem in isolated production container containers:

### [NEW] [docker-compose.yml](file:///g:/cncCRM/docker-compose.yml)
Create this file in the root workspace folder to build and orchestrate frontend, backend, and MySQL services in isolated production environments.

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    command: --default-authentication-plugin=caching_sha2_password
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: An1meParadise@2026
      MYSQL_DATABASE: cnc_crm
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:An1meParadise%402026@db:3306/cnc_crm
      - JWT_SECRET=super_secret_jwt_key_code_n_clicks_2026
      - JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_code_n_clicks_2026
      - SMTP_USER=codenclicksit@gmail.com
    depends_on:
      - db

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
    depends_on:
      - backend

volumes:
  mysql_data:
```

### [NEW] [backend/Dockerfile](file:///g:/cncCRM/backend/Dockerfile)
Builds the production-ready Node.js compile.
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### [NEW] [frontend/Dockerfile](file:///g:/cncCRM/frontend/Dockerfile)
Builds the static Next.js compile.
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm install --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 👤 Seeder Accounts Credentials
Test credentials loaded by `prisma/seed.ts` for immediate validation:

- **Super Admin**: `superadmin@codenclicks.com`
- **Sales Manager**: `salesmanager@codenclicks.com`
- **Developer**: `developer@codenclicks.com`
- **Password**: `An1meParadise@2026`
