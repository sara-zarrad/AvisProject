# Avis Backend 

A modern, robust RESTful backend API built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL** using **Prisma ORM**.

---

##  Features

- **TypeScript & Express**: Strongly typed request handlers, middlewares, and routes.
- **PostgreSQL & Prisma ORM**: Relational database schema with type-safe queries, automatic migrations, and Prisma Studio UI.
- **JWT Authentication & Bcrypt**: User registration, secure password hashing, login, and user profile endpoints.
- **Role-Based Authorization**: User and Admin roles (with moderation capabilities for admins).
- **Avis / Reviews API**:
  - Full CRUD operations (Create, Read, Update, Delete)
  - Filtering by rating (1-5), status (`PENDING`, `APPROVED`, `REJECTED`), and search queries
  - Pagination support
  - Aggregated review statistics (`/api/reviews/stats`)
- **Security & Best Practices**: Helmet headers, CORS configuration, Zod input validation, Morgan logging, centralized error handling.

---

## 🛠️ Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (Running locally or in the cloud)

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and adjust your PostgreSQL credentials:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/avis_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Prisma Client & Run Migrations
```bash
# Push schema to PostgreSQL or create a migration
npx prisma migrate dev --name init

# Or push schema directly without migration files:
npx prisma db push
```

### 4. Start the Server

- **Development Mode** (with hot reload):
  ```bash
  npm run dev
  ```

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

- **Prisma Studio** (Database GUI):
  ```bash
  npx prisma studio
  ```

---

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health and uptime status

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes (Bearer Token) |

### Avis / Reviews (`/api/reviews`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reviews` | Get list of reviews (supports `?page=1&limit=10&rating=5&status=APPROVED&search=hotel`) | No |
| `GET` | `/api/reviews/stats` | Get review count, average rating & distribution | No |
| `GET` | `/api/reviews/:id` | Get single review details | No |
| `POST` | `/api/reviews` | Create a new review | Yes (Bearer Token) |
| `PUT` | `/api/reviews/:id` | Update own review (or admin) | Yes (Bearer Token) |
| `DELETE` | `/api/reviews/:id` | Delete own review (or admin) | Yes (Bearer Token) |
| `PATCH` | `/api/reviews/:id/moderate` | Approve or reject review | Yes (Admin only) |

---

## 🗄️ Database Schema

### `User`
- `id` (UUID, Primary Key)
- `email` (Unique)
- `name` (String)
- `password` (Hashed)
- `role` (`USER` | `ADMIN`)
- `createdAt` / `updatedAt`

### `Review`
- `id` (UUID, Primary Key)
- `title` (String)
- `comment` (String)
- `rating` (Integer, 1–5)
- `status` (`PENDING` | `APPROVED` | `REJECTED`)
- `authorId` (Foreign Key -> `User.id`)
- `createdAt` / `updatedAt`
