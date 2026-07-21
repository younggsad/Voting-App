# Live Voting App

![CI](https://github.com/younggsad/Voting-App/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Веб-приложение для создания опросов и голосования в реальном времени: результаты
обновляются у всех участников мгновенно, без перезагрузки страницы.

Full-stack пет-проект: React/TypeScript на фронтенде, Node.js на бэкенде,
настроенный CI/CD и git flow.

## Стек

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js
- **Линтинг/форматирование**: ESLint + Prettier + Husky
- **CI/CD**: GitHub Actions

## Запуск локально

```bash
npm install
npm run dev
```

## Доступные команды

| Команда                | Что делает                            |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Запуск дев-сервера                    |
| `npm run build`        | Сборка продакшен-версии               |
| `npm run lint`         | Проверка кода линтером                |
| `npm run lint:fix`     | Автоисправление линтером              |
| `npm run format`       | Форматирование кода Prettier          |
| `npm run format:check` | Проверка форматирования без изменений |
| `npm run typecheck`    | Проверка типов TypeScript             |

## Git Flow

- `main` — стабильная, защищённая ветка
- `develop` — интеграционная ветка, защищена
- `feature/*` — ветки под новую функциональность, мержатся в `develop` через PR
- `release/*` — стабилизация версии перед мержем в `main`

Каждый PR проходит CI (lint, format check, typecheck, build) перед мержем.
