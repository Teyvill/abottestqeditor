# StoryFlow-lite — демо-редактор ивентов

Веб-редактор нодового флоу для игровых ивентов в стиле StoryFlow / Articy Draft X:
бесконечный холст, вложенные графы (3 уровня), пины-соединения и режим Play,
проигрывающий собранный ивент как игроку.

Это демо/прототип. Без бэкенда, без БД, без авторизации — всё состояние живёт
в памяти вкладки (плюс необязательный автосейв в `localStorage`).

## Стек

- React + TypeScript + Vite
- [`@xyflow/react`](https://reactflow.dev/) (React Flow) — холст, ноды, пины, соединения
- `zustand` — состояние графов и навигации
- Tailwind CSS — стили

## Запуск локально

```bash
npm i
npm run dev
```

Откройте адрес, который выведет Vite (обычно `http://localhost:5173`).

Сборка прод-бандла:

```bash
npm run build
npm run preview   # локально проверить dist/
```

## Деплой на Netlify

**Вариант A — drag & drop:**

1. `npm run build`
2. Перетащите папку `dist/` на https://app.netlify.com/drop

**Вариант B — подключение репозитория:**

1. Запушьте репозиторий на GitHub/GitLab/Bitbucket
2. New site from Git → выберите репозиторий
3. Netlify подхватит `netlify.toml` (`command = "npm run build"`, `publish = "dist"`)
4. Deploy

`public/_redirects` (`/* /index.html 200`) уже настроен для SPA-роутинга.

## Что внутри

- **Три уровня вложенности графов**: Организационный (Start/Folder) →
  Функциональный (Start/Functional/End/Unlock) → Скриптовый
  (Event Actor/Location/Dialogue/Option/End/Unlock). Двойной клик по
  Folder/Functional — вход внутрь, хлебные крошки — навигация обратно.
- **Все 9 типов нод** из спеки, включая не-прототипные поля/пины — они видимы,
  но неактивны и помечены бейджем «later» с тултипом.
- **Пины и провода в стиле Blueprint**: цвет и форма пина зависят от типа
  соединения, а не от цвета ноды — `trigger` (белый треугольник, как exec-пин
  в Blueprints: Start/Location/Unlock → Folder/Functional/Event Actor) и
  `story` (бирюзовый кружок: текст ивента → Dialogue → Options/Continue →
  End/Unlock). Связанные пины всегда совпадают по цвету, провода получают
  стрелку-указатель направления. Start можно добавить и подключить на любом
  из трёх уровней — к Folder, к Functional или напрямую к Event Actor.
- **Режим Play** (кнопка ▶ на Event Actor) — модалка-плеер проходит по графу от
  первой Dialogue через Options/Continue до End (закрывает модалку) или Unlock
  (тост «Unlocked: ...» и закрытие).
- **Export/Import JSON** — кнопки в правом верхнем углу; экспортируется весь
  граф (все уровни вложенности). Автосейв в `localStorage` включён по
  умолчанию (флаг `AUTOSAVE_ENABLED` в `src/store.ts`) — легко выключить.
- **Сид-контент**: событие «The Passenger» (лес Линденмор) — открывается
  сразу с примером на всех трёх уровнях и разветвлённым Play-прохождением.

## Известное расхождение со спекой

В `src/types.ts` (`computeEventActorId`) формула авто-ID использует те же
кейс-конвенции, что и эталонный пример в задании
(`foSector1CapitalLindenmoorEvent01the-passenger`) — то есть kebab-case в
нижнем регистре для названия ивента, а не «прописными», как было написано в
тексте задания текстом. Следуем примеру, а не описанию.

## Структура проекта

```
src/
  types.ts        — типы нод/данных, формула авто-ID
  store.ts        — zustand: дерево графов, навигация, CRUD, export/import
  seed.ts         — сид-граф "the-passenger"
  nodes/          — кастомные React Flow ноды (Start, Folder, Functional,
                     EventActor, Dialogue+Option, Location, End, Unlock)
  components/     — Canvas, Palette, Breadcrumbs, Toolbar, PlayModal, Toast
```
