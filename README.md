# 💼 Career Counselor Chat App

AI-powered chat application to help users get **career advice** through interactive chat sessions.  
Built with **Next.js 13 (App Router)**, **tRPC**, **Drizzle ORM**, **NextAuth.js**, and **PostgreSQL**.

---

## 🚀 Features

- 🔑 **Authentication**
  - Register & login with email/password (hashed with bcrypt)
  - Session management via NextAuth
  - Protected `/chat/*` routes

- 💬 **Chat Sessions**
  - Create multiple chat sessions
  - Sessions tied to logged-in user (RLS enforced in code)
  - Session list with search, pagination, and previews

- 🎨 **UI/UX**
  - Responsive design with **TailwindCSS** + **shadcn/ui**
  - Light/Dark theme toggle with `next-themes`
  - Clean forms and accessible components

- 🧠 **AI Integration**
  - Connects to an AI client (`lib/aiClient.ts`) to generate career advice

- 🗄 **Database**
  - PostgreSQL database
  - Managed via Drizzle ORM migrations
  - Tables: `users`, `chat_sessions`, `messages`

---

## 🛠 Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TailwindCSS, shadcn/ui
- **Backend**: tRPC, NextAuth.js
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Credentials provider with bcrypt hashing
- **AI**: Custom `aiClient` wrapper (OpenAI or similar)

---

## 📂 Project Structure

```

src/
├── app/               # Next.js App Router pages
│    ├── chat/         # Protected chat pages
│    ├── login/        # Login page
│    ├── register/     # Registration page
│    └── api/          # Next.js API routes
├── components/        # Reusable UI components (Navbar, Buttons, Forms)
├── lib/               # Helpers (trpc client, AI client)
├── server/            # Backend (tRPC, routers, db, auth)
│    ├── db/           # Drizzle ORM setup & schema
│    ├── routers/      # tRPC routers (chat, auth)
│    └── trpc/         # tRPC config (router, procedure utils)
└── styles/            # Global styles (Tailwind)

```

---

## ⚙️ Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/aayush598/career-counselor-chat.git
cd career-counselor-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root:

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgres://user:password@localhost:5432/career_chat_db

# AI (if using OpenAI or similar)
OPENAI_API_KEY=your-openai-key
```

> 🔑 Generate `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

### 4. Database Setup

Run PostgreSQL migrations via Drizzle:

```bash
npm drizzle-kit generate
npm drizzle-kit push
```

Ensure your DB has the following tables:

- `users` → id, name, email, password_hash
- `chat_sessions` → id, user_id, title, timestamps
- `messages` → id, session_id, role, content, timestamps

### 5. Start Development Server

```bash
pnpm dev
```

Navigate to:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication Flow

- `/register` → Register with **name, email, password**
- `/login` → Login with email & password
- Protected routes (`/chat/*`) redirect to `/register` if not logged in
- NextAuth session stored in cookies

---

## 📡 API Endpoints (via tRPC)

- `chat.listSessions` → List user’s chat sessions (with pagination & search)
- `chat.createSession` → Create a new chat session
- `chat.getMessages` → Get messages for a session
- `chat.addMessage` → Add user message & trigger AI response

---

## 🖼 Screenshots

### Login / Register

![Register Page](https://dummyimage.com/600x400/000/fff&text=Register+Page)
![Login Page](https://dummyimage.com/600x400/000/fff&text=Login+Page)

### Chat Sessions

![Chat Dashboard](https://dummyimage.com/600x400/000/fff&text=Chat+Dashboard)

### Dark Mode

![Dark Mode](https://dummyimage.com/600x400/000/fff&text=Dark+Mode)

---

## 📦 Deployment

### Vercel

- Add environment variables in **Vercel Dashboard**
- Connect repo and deploy

### Docker (Optional)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

---

## 🤝 Contributing

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Add my feature"`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License © 2025 \[Aayush Gid]

---

## 👨‍💻 Author

Built with ❤️ by **Aayush Gid**
