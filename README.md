# Facebook Community Sharing Platform — Frontend

A React + TypeScript frontend for a campaign-based community sharing platform. Admins create campaigns for workers to complete (e.g. sharing/promoting content in Facebook groups), workers submit proof of work, admins review submissions, and approved work pays out through an in-app wallet.

## Features

- **Authentication** — login flow with role-based access (`worker` / `admin`) via protected routes.
- **Campaigns** — admins create and manage campaigns; workers browse and join available campaigns.
- **Submissions** — workers submit proof of completed work; admins review and approve/reject via a review queue.
- **Groups** — manage the Facebook groups used for campaign distribution.
- **Wallet & Withdrawals** — workers track earnings; admins manage withdrawal requests.
- **Leaderboard** — ranks top-performing workers.
- **Analytics** — admin dashboard with platform-wide stats.

## Tech Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool and dev server
- [Redux Toolkit](https://redux-toolkit.js.org/) + [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) — state management and API data fetching
- [React Router](https://reactrouter.com/) — routing
- [React Bootstrap](https://react-bootstrap.github.io/) — UI components
- [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup) — forms and validation
- Mock Service Worker–style in-memory mocks (`src/mocks`) for local API simulation

## Project Structure

```
src/
├── api/            # Base RTK Query API configuration
├── app/            # Redux store setup and typed hooks
├── components/     # Shared/reusable UI components
├── features/       # Feature modules (auth, campaigns, submissions, groups, wallet, leaderboard, analytics, dashboard)
├── mocks/          # Mock backend handlers and in-memory database
├── pages/          # Top-level pages (e.g. Home)
├── routes/         # Route definitions and protected route logic
├── styles/         # Global styles
├── types/          # Shared TypeScript types
└── utils/          # Utility helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the Vite dev server with hot module reloading.

### Build

```bash
npm run build
```

Type-checks the project and builds a production bundle.

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Type check

```bash
npm run typecheck
```

## License

This project is private and not licensed for public use.
