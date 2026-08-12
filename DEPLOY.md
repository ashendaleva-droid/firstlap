# Деплой «Первый круг» на Vercel

Это полноценное Next.js-приложение с регистрацией/авторизацией (NextAuth) и базой данных (PostgreSQL через Prisma). Ниже — пошаговая инструкция от нуля до рабочей ссылки.

## 1. Выложить код на GitHub

1. Создай новый репозиторий на GitHub (пустой).
2. В папке проекта:
   ```bash
   git init
   git add .
   git commit -m "Первый круг: MVP с регистрацией"
   git branch -M main
   git remote add origin https://github.com/ВАШ_ЛОГИН/pervyi-krug.git
   git push -u origin main
   ```

## 2. Завести базу данных

Проще всего — прямо в Vercel:

1. На [vercel.com](https://vercel.com) → **Storage** → **Create Database** → **Postgres** (или Neon, это то же самое под капотом).
2. После создания Vercel покажет несколько переменных окружения (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` и т.д.) — они пригодятся на шаге 4.

Альтернатива: бесплатная база на [neon.tech](https://neon.tech) или [supabase.com](https://supabase.com) — тоже подходит, просто скопируй connection string.

## 3. Импортировать проект в Vercel

1. **New Project** → выбери свой GitHub-репозиторий → **Import**.
2. Framework Preset определится автоматически как **Next.js**.
3. Пока не нажимай Deploy — сначала добавь переменные окружения (шаг 4).

## 4. Переменные окружения

В настройках проекта на Vercel → **Settings → Environment Variables** добавь:

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | Connection string с pooling (у Vercel Postgres — это `POSTGRES_PRISMA_URL`) |
| `DIRECT_URL` | Connection string без pooling (у Vercel Postgres — это `POSTGRES_URL_NON_POOLING`); если провайдер даёт только одну строку — продублируй её сюда |
| `NEXTAUTH_SECRET` | Сгенерируй командой `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://ваш-проект.vercel.app` (после первого деплоя Vercel покажет точный адрес — обнови значение и передеплой) |

## 5. Применить миграции базы данных

Prisma-миграции нужно накатить один раз перед первым использованием сайта. Проще всего — локально, указав на ту же базу, что и в проде:

```bash
npm install
# создай .env локально (см. .env.example), впиши туда те же DATABASE_URL / DIRECT_URL, что в Vercel
npx prisma migrate dev --name init
npm run seed        # засеет каталог достижений (8 штук)
```

Команда `migrate dev` создаст папку `prisma/migrations` — обязательно закоммить и запушь её в GitHub:
```bash
git add prisma/migrations
git commit -m "Добавлены миграции БД"
git push
```

## 6. Деплой

Нажми **Deploy** в Vercel (или просто запушь в `main` — дальше будет автодеплой на каждый пуш).

После первого успешного деплоя:
1. Скопируй финальный URL проекта.
2. Обнови переменную `NEXTAUTH_URL` этим адресом.
3. Нажми **Redeploy**, чтобы переменная применилась.

## 7. Проверка

Открой сайт → **Зарегистрироваться** → выбери роль «Пилот» → создай аккаунт. Затем зарегистрируй второй аккаунт с ролью «Тренер», внеси первую тренировку — прогресс, XP и достижения обновятся у пилота автоматически.

Чтобы связать родителя с ребёнком: при регистрации с ролью «Родитель» укажи email уже существующего пилота.

---

### Локальный запуск для разработки

```bash
npm install
cp .env.example .env    # заполни своими значениями
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Открой http://localhost:3000
