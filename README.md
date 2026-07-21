# Live Voting App

![CI](https://github.com/younggsad/Voting-App/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Full-stack веб-приложение для создания опросов и голосования в реальном времени.

Пользователи смогут создавать опросы, принимать участие в голосовании и получать актуальные результаты без перезагрузки страницы.

Проект построен как **монорепозиторий** с разделением frontend и backend приложений, общей системой качества кода и автоматическими проверками через CI/CD.

---

## Architecture

```
voting-app/
│
├── apps/
│   ├── client/              # React frontend
│   └── server/              # Node.js backend
│
├── packages/                # Shared packages
│
├── eslint.config.js         # Общая ESLint конфигурация
├── package.json             # Root workspace configuration
└── README.md
```

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- TypeScript

### Development Tools

- npm Workspaces
- ESLint 9 (Flat Config)
- Prettier
- Husky
- lint-staged

### CI/CD

- GitHub Actions

Автоматические проверки:

- ESLint
- Prettier format check
- TypeScript typecheck
- Production build

---

## Getting Started

### Install dependencies

Из корня проекта:

```bash
npm install
```

---

## Development

### Start frontend

```bash
npm run dev:client
```

Frontend:

```
http://localhost:5173
```

---

### Start backend

```bash
npm run dev:server
```

Backend:

```
http://localhost:4000
```

Health check:

```
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

---

## Available Scripts

| Command                | Description                   |
| ---------------------- | ----------------------------- |
| `npm run dev:client`   | Запуск frontend приложения    |
| `npm run dev:server`   | Запуск backend сервера        |
| `npm run build`        | Сборка всех приложений        |
| `npm run lint`         | Проверка ESLint               |
| `npm run lint:fix`     | Автоисправление ESLint ошибок |
| `npm run format`       | Форматирование через Prettier |
| `npm run format:check` | Проверка форматирования       |
| `npm run typecheck`    | Проверка TypeScript типов     |
| `npm run test`         | Запуск тестов                 |

---

## Code Quality

Проект использует автоматические проверки перед коммитом через Husky и lint-staged.

Перед созданием коммита выполняются:

- ESLint проверка;
- автоматическое форматирование Prettier;
- проверка изменённых TypeScript файлов.

Цель — поддержание единого стиля кода и предотвращение попадания ошибок в основную ветку.

---

## Git Flow

Используется Git Flow подход:

```
main
 └── develop
      ├── feature/*
      ├── fix/*
      └── release/*
```

### Branches

- `main` — стабильная production-ветка
- `develop` — основная ветка разработки
- `feature/*` — новые возможности
- `fix/*` — исправления ошибок
- `release/*` — подготовка релиза

---

## Pull Requests

Каждый Pull Request проходит автоматические проверки:

- lint;
- format check;
- typecheck;
- build.

Изменения попадают в основные ветки только после успешного прохождения CI.

---

## License

This project is licensed under the MIT License.
