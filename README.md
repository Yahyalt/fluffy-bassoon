# OpenMusic API

A RESTful API built with Hapi.js for managing music data.

## Prerequisites

- Node.js
- PostgreSQL
- npm

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd openmusic-app-back-end
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

4. Run database migrations:
```bash
npm run migrate up
```

## Running the Application

Development mode with auto-reload:
```bash
npm run start-dev
```

Production mode:
```bash
npm run start-prod
```

## Available Scripts

- `npm run start-prod`: Run in production mode
- `npm run start-dev`: Run in development mode with nodemon
- `npm run lint`: Run ESLint
- `npm run migrate`: Run database migrations
