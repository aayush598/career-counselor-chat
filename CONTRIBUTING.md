# Contributing to Career Counselor Chat

🙏 First of all, thank you for considering contributing!  
This project thrives on community involvement, and we appreciate your time and ideas.

The following guidelines will help you get started with contributing effectively.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Enhancements](#suggesting-enhancements)
   - [Submitting Pull Requests](#submitting-pull-requests)
3. [Development Setup](#development-setup)
4. [Coding Guidelines](#coding-guidelines)
5. [Git Commit Guidelines](#git-commit-guidelines)
6. [Issue & PR Process](#issue--pr-process)

---

## 📜 Code of Conduct

This project follows a [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure a welcoming and respectful environment for everyone.

By participating, you are expected to uphold this code. Please report unacceptable behavior to **[INSERT YOUR CONTACT EMAIL]**.

---

## 🤝 How Can I Contribute?

### Reporting Bugs

If you find a bug:

1. **Search** existing issues to see if it’s already reported.
2. If not found, [open a new issue](../../issues) and include:
   - A clear description of the bug.
   - Steps to reproduce it.
   - Expected vs actual behavior.
   - Screenshots/logs if applicable.
   - Your environment (OS, Node.js version, browser, etc.).

### Suggesting Enhancements

We welcome ideas! Please:

1. Search existing issues/discussions.
2. Clearly describe your proposal and motivation.
3. Suggest potential implementation details if possible.

### Submitting Pull Requests

1. Fork the repository.
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes.
4. Run tests and ensure linting passes.
5. Push your branch and open a PR:
   - Describe what your PR does.
   - Link to related issues (if any).
   - Add screenshots for UI changes.

---

## 🛠 Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) (preferred) or `npm`
- [Supabase](https://supabase.com/) project with URL + API key
- Environment variables configured (`.env.local`)

### Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/career-counselor-chat.git
cd career-counselor-chat
```

### Install Dependencies

```bash
npm install
```

### Setup Environment Variables

Create a `.env.local` file in the root and configure:

```env
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://...
```

### Run Development Server

```bash
npm run dev
```

Now visit [http://localhost:3000](http://localhost:3000).

---

## 🎨 Coding Guidelines

### Code Style

- Use **TypeScript**.
- Prefer functional components with hooks (`useState`, `useEffect`, `useSession`, etc.).
- Follow **React + Next.js conventions** for folder structure.
- Use **Tailwind CSS** for styling.
- Keep components small and composable.
- Use **TRPC** for type-safe API calls.
- Avoid inline styles unless absolutely necessary.

### File Naming

- Components: `PascalCase.tsx` (e.g., `Navbar.tsx`)
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`

### Testing

- Add tests where possible.
- Ensure no existing tests break before submitting.

---

## 📝 Git Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).
This makes history readable and helps with changelog generation.

**Format:**

```
<type>(scope): short summary
```

**Types:**

- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only changes
- `style` — formatting, missing semi colons, etc.
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding or correcting tests
- `chore` — build process or auxiliary tool changes

**Example:**

```
feat(auth): add user registration endpoint
fix(ui): resolve dark mode toggle issue
docs: update README with setup steps
```

---

## 🔄 Issue & PR Process

1. Pick or create an issue.
2. Assign yourself (if possible).
3. Create a branch from `main`.
4. Commit changes using [commit guidelines](#-git-commit-guidelines).
5. Push branch and open a PR.
6. Wait for review:
   - All CI checks must pass.
   - At least 1 maintainer approval is required.

7. Once approved, it will be merged into `main`.

---

## 💬 Questions?

Feel free to start a [discussion](../../discussions) or reach out via issues.
We’re excited to build **Career Counselor Chat** together! 🚀
