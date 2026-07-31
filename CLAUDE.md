# StoryFlow-lite — спека проекта (для Claude)

Демо нодового редактора игровых ивентов в стиле StoryFlow / Articy Draft X /
Unreal Blueprints. Статик SPA, без бэкенда, деплой на Netlify. Цель — дать
геймдизайнеру собрать ивент мышкой (ноды + пины) и тут же пройти его в
режиме Play.

Этот файл — предметная спека для будущих сессий Claude Code: что уже
построено, как оно устроено и на каких решениях стоит. Пользовательская
инструкция по запуску/деплою — в `README.md`.

## Стек

React + TypeScript + Vite, `@xyflow/react` (React Flow) для холста, `zustand`
для стейта, Tailwind CSS для стилей. Всё состояние — в памяти вкладки, плюс
автосейв в `localStorage` (см. «Автосейв и SEED_VERSION» ниже).

## Модель вложенности

Дерево графов, а не один холст. `useStore` (`src/store.ts`) хранит:

```ts
graphs: Record<string, { nodes: FlowNode[]; edges: FlowEdge[] }>
path: { containerId: string; label: string; level: number }[]
```

`"root"` — ключ верхнеуровневого (органиграфа) холста. Когда создаётся
`Folder` или `Functional`, для него лениво создаётся дочерний граф
`graphs[nodeId]` (сразу с одной `Start`-нодой). Двойной клик по
Folder/Functional (`enterContainer`) добавляет запись в `path` и холст
перерисовывается на `graphs[nodeId]`. Хлебные крошки (`Breadcrumbs.tsx`)
кликабельны и обрезают `path` до нужного индекса; кнопка «↑ up» — то же
самое для последнего уровня.

Три уровня графов:

1. **Root / организационный** (`path[0].level === 1`): `Start`, `Folder`.
2. **Функциональный** (внутри `Folder`, `level === 2`): `Start`,
   `Functional`, `End`, `Unlock`.
3. **Скриптовый** (внутри `Functional`, `level === 3`): `Start`,
   `Event Actor`, `Location`, `Dialogue` (+ `Option` внутри Dialogue),
   `End`, `Unlock`.

Палитра нод (`Palette.tsx`, `LEVEL_ITEMS`) контекстна уровню — показывает
только допустимые для текущего холста типы. `Start` — синглтон на каждом
уровне (кнопка дизейблится, если на холсте уже есть Start).

## Типы нод и их пины

Вся логика пинов вынесена в `src/nodes/pinTypes.ts` + `src/nodes/Pin.tsx`
(`PinRow`) — см. следующий раздел про `flow`/`pin`. Ниже — что у какой ноды
есть, `id` хэндла и его тип.

### Start (`src/nodes/StartNode.tsx`)
- Один source-пин `out`, тип `flow`, без подписи (просто стрелка).
- Точка входа. Может быть на любом из трёх уровней (см. Палитру), но по
  одной на холст.

### Folder (`FolderNode.tsx`)
- Поле `name: string`.
- Target-пин `trigger` (flow, без подписи) слева — принимает `Start.out`.
- Бейдж с числом нод внутри (`graphs[id]?.nodes.length`).
- Двойной клик → войти в дочерний граф.

### Functional (`FunctionalNode.tsx`)
- Поле `name: string`.
- Target-пин `trigger` (flow, без подписи) слева — принимает `Start.out`.
- Source-пин `impact` (flow, подпись «end of script») справа — ведёт в
  `End`/`Unlock` того же (функционального) графа.
- Бейдж с числом нод внутри, двойной клик → войти в скриптовый граф.

### Event Actor (`EventActorNode.tsx`) — центральная нода
Поля (`EventActorData` в `types.ts`):
- `name: string`, максимум 60 символов, со счётчиком в лейбле поля.
- `idOverride: string | null` + авто-ID (см. ниже) с кнопкой override.
- `image: string` — URL; если валидный http(s) URL, показывается превью.
- `repeatable: boolean`, `unique: boolean` — чекбоксы.
- `maxRuns: number` — **заглушка «later»**, инпут задизейблен.
- Поля-источники формулы ID: `continent`, `sector`, `settlement`,
  `locationName`, `seq` — сейчас это просто скрытые в дефолтах строки,
  отдельных инпутов под них в UI нет (см. TODO ниже, если понадобится
  добавить — сейчас они правятся только через сид/JSON-импорт).

Пины — **два независимых слева**, а не один:
- Target-пин `trigger` (flow, без подписи) — принимает `Start.out` или
  `Unlock.out`. Это то, что реально **включает** ивент.
- Target-пин `context` (pin, подпись «conditions (Location)») — принимает
  только `Location.out`. Это контекст (где), не двигает граф.

Справа: source-пин `text` (flow, подпись «event text») — ведёт в первую
`Dialogue`.

Кнопка `▶ Play` внизу ноды открывает `PlayModal`.

Формула авто-ID (`computeEventActorId` в `types.ts`):
```
`${continent}${sector}${settlement}${locationName}Event${seq}${kebab(name)}`
```
Пример-эталон из исходной спеки:
`foSector1CapitalLindenmoorEvent01the-passenger`. Есть **TODO-комментарий**
в коде: исходный текст спеки говорил «прописными», но эталонный пример —
kebab-case в нижнем регистре; реализовано по примеру, не по тексту.

### Dialogue (`DialogueNode.tsx`)
- Target-пин `in` (flow, подпись «in») слева.
- `text: string` — textarea, без лимита.
- Если `options.length === 0`: справа source-пин `impact` (flow, подпись
  «impact (Continue)») — в Play это кнопка Continue.
- `Option` — **не отдельная React Flow нода**, а массив `options:
  OptionItem[]` в данных Dialogue. Рендерится как «примагниченные» строки
  под текстом, перетаскиваются нативным HTML5 drag-and-drop
  (`reorderOptions` в сторе). У каждой строки:
  - target-пин `opt-cond-${optionId}` (pin, `active={false}` — заглушка;
    тултип объясняет будущие типы `hidden`/`locked`).
  - source-пин `opt-${optionId}` (flow) — «impact» этой опции, ведёт в
    `Dialogue`/`End`/`Unlock`.
  - Когда `options.length > 0`, общий правый `impact`-пин Dialogue
    скрывается (у ноды остаются только пер-опционные пины).

### Location (`LocationNode.tsx`)
- `x, y, z: number` (три инпута в ряд), `radius: number` («Activation
  radius (m)»).
- Заглушка «later»: «irregular zones» (бейдж, без функционала).
- Source-пин `out` (**pin**, подпись «conditions») справа — единственный
  пин в проекте, который физически называется `out`, но резолвится как
  `pin`, а не `flow` (см. `resolvePinType`, специальный case по
  `nodeKind === 'location'`). Ведёт только в `context`-пин Event Actor.

### End (`EndNode.tsx`)
- Только target-пин `in` (flow, подпись «in»). В Play — закрывает модалку.

### Unlock (`UnlockNode.tsx`)
- Target-пин `in` (flow, подпись «in») слева — из Impact-а Dialogue/Option.
- Поле `label: string` («Unlock id / label»).
- Заглушка «later»: «state variable» (будущий персистентный флаг).
- Source-пин `out` (flow, без подписи) справа — ведёт в `trigger`-пин
  другого Event Actor. В Play: тост `Unlocked: <label>` и закрытие модалки.

## Модель коннекторов: `flow` vs `pin`

Ключевое архитектурное решение (по итогам ревью): **тип пина определяется
не цветом/типом ноды, а тем, что именно он делает** —
`src/nodes/pinTypes.ts`:

- **`flow`** — двигает граф вперёд, actionable. Белая стрелка
  (`clip-path` треугольник), без текстовой подписи «trigger» — просто
  форма. Все связи Start→контейнер/актор, Event Actor→Dialogue,
  Dialogue/Option→Dialogue/End/Unlock, Unlock→Event Actor, Functional→End.
- **`pin`** — контекст/условие, сам по себе ничего не запускает. Серый
  кружок (`#94a3b8`), с подписью. Сейчас это только: Location→Event Actor,
  и заглушка условия Option (`opt-cond-*`, неактивна).

`resolvePinType(nodeKind, handleId)` — единая функция резолва и для цвета
пина (`Pin.tsx`), и для цвета/стрелки провода (`Canvas.tsx`,
`styledEdges`), и для валидации соединений. **Не разводите цвет пина и
цвет провода в разных местах** — оба обязаны идти через эту функцию,
иначе связанные концы разъедутся по цвету.

### Валидация соединений

`Canvas.tsx` → `isValidConnection`: соединение разрешено только если
`resolvePinType` источника и цели **совпадает** (`flow↔flow` или
`pin↔pin`), и `source !== target` (не самому себе). React Flow сам
блокирует source→source/target→target по `connectionMode` (default
`strict`), так что «выход→выход» уже невозможен независимо от этого.

Если добавляете новый `handleId` — обязательно впишите его в
`HANDLE_TYPE` в `pinTypes.ts` (или в спец-кейс вроде `out`+`location`),
иначе он молча зарезолвится как `flow` по умолчанию.

## Режим Play (`PlayModal.tsx`)

Открывается кнопкой `▶ Play` на Event Actor (`openPlay(actorId)` в сторе).
Плеер работает **по текущему графу** (`currentGraph()`), обход:

1. Ищем edge `source === actorId && sourceHandle === 'text'` → это
   стартовая `Dialogue`.
2. Рендерим картинку (`image`) + имя актора вверху (статично на всё
   прохождение), текст текущей Dialogue в теле.
3. Если у Dialogue есть `options` — кнопки по каждой (кроме
   `conditionType === 'hidden'`; `locked` рисуется с 🔒, но кликабельна —
   в прототипе условий нет). Клик ищет edge
   `source === dialogueId && sourceHandle === 'opt-${optionId}'`.
4. Если опций нет — кнопка Continue, ищет edge с `sourceHandle ===
   'impact'`.
5. `goTo(targetId)`: если нода не найдена или это `End` → `closePlay()`.
   Если `Unlock` → `showToast('Unlocked: ' + label)` + `closePlay()`.
   Иначе — `setCurrentId(targetId)` (следующая Dialogue).

Никакой отдельной модели состояния игрока — чистый обход графа по рёбрам.

## Автосейв и SEED_VERSION

`localStorage['storyflow-lite-autosave-v1']` хранит `{ graphs,
seedVersion }`. При старте (`initialGraphs()` в `store.ts`) автосейв
используется, **только если** `seedVersion === SEED_VERSION` (экспорт из
`seed.ts`). Иначе — грузится свежий `buildSeed()`.

**Это важно помнить**: если правите `buildSeed()`, **обязательно
увеличивайте `SEED_VERSION`** — иначе браузеры со старым автосейвом
(любой, кто уже открывал страницу) не увидят изменения и будут молча
показывать старый закэшированный граф. Это уже один раз стало причиной
бага («новый сид не виден»), пофикшено версионированием — не
регрессируйте эту защиту.

Автосейв — фича «за флагом» (`AUTOSAVE_ENABLED` в `store.ts`), легко
выключается одной константой.

## Сид-контент

`src/seed.ts` — не выдуманный, а взят **дословно** (диалоги/опции) из
дизайн-дока Lindenmoor (`Lindenmoor. Ивенты WIP`, приложенный PDF).
Корень: `Start → Folder "Lindenmoor — Events"`. Внутри — два `Functional`,
оба запускаются от общего `Start` этого уровня, оба ведут в общий `End`:

1. **Passenger** (`ID.passengerFunctional`) — «Пассажир»/кот на голове
   гиганта. Внутри: `Start` и `Location` — оба фидят Event Actor
   «Passenger» (первый в `trigger`, второй в `context`). Intro-диалог с 3
   опциями (`Put the cat back` / `Keep the cat` / `Shake the cat off`),
   каждая ведёт в свою реплику-результат → общий `End`.
2. **Field Harvest** (`ID.fieldFunctional`) — «Завидный урожай» →
   разблокирует → «Мельница». Демонстрирует `Unlock`, соединяющий два
   Event Actor **в одном скриптовом графе** (кросс-граф связей в модели
   нет — Unlock не может достучаться до актора в другом Functional).
   - Event Actor «Bountiful Harvest»: `Start` + `Location` → его пины.
     Intro с 2 опциями: `Help harvest it` → результат → `Unlock`
     (`label: 'field-mill-available'`) → `trigger`-пин Event Actor «Mill»;
     `Walk right by` → результат → общий `End`.
   - Event Actor «Mill»: его `trigger` приходит от `Unlock` (не от Start —
     специально, мельница не должна быть доступна с самого начала), плюс
     собственный `Location` в `context`. Intro с 3 опциями, каждая → своя
     реплика-результат → общий `End`.

ID-шники нод в сиде — детерминированные строки (`ID.*` объект), не
`nextId()` — чтобы дифф сида был читаемым и edges можно было завязать на
константы, а не UUID.

## Структура файлов

```
src/
  types.ts          — NodeKind, *Data интерфейсы, computeEventActorId
  store.ts           — zustand: graphs-дерево, path, CRUD-экшены,
                        onNodesChange/onEdgesChange/onConnect, export/import,
                        автосейв, resetSeed
  seed.ts             — buildSeed() + SEED_VERSION
  nodes/
    pinTypes.ts        — PinType, PIN_TYPE_COLOR, resolvePinType — источник
                          истины для цвета/формы пинов И цвета проводов
    Pin.tsx             — <PinRow>, рендер хэндла (треугольник/кружок)
    NodeShell.tsx       — общая обвязка ноды: хедер с цветом по kind,
                          KIND_COLORS, LaterBadge, Field, inputCls
    {Start,Folder,Functional,EventActor,Dialogue,Location,End,Unlock}Node.tsx
    index.ts            — nodeTypes для <ReactFlow>
  components/
    Canvas.tsx          — <ReactFlow>, styledEdges (цвет+стрелка по
                          resolvePinType), isValidConnection
    Palette.tsx          — LEVEL_ITEMS, контекстное добавление нод
    Breadcrumbs.tsx       — навигация по path
    Toolbar.tsx            — Export/Import JSON, Reset demo
    PlayModal.tsx           — плеер, обход графа
    Toast.tsx                — тост для Unlock
```

## Известные умышленные ограничения / TODO на будущее

- Кросс-граф edges не поддерживаются — `Unlock`/`Start` могут достать
  только до нод **в том же графе**. Если понадобится «разблокировать
  ивент в другом Functional» — нужна отдельная модель (например, глобальный
  реестр «unlock-флагов» вместо прямого edge).
- Поля формулы ID (`continent`/`sector`/`settlement`/`locationName`/`seq`)
  у Event Actor не имеют своих инпутов в UI — редактируются только через
  дефолты в коде или JSON import/export. Если понадобится — добавить
  маленькие инпуты в `EventActorNode.tsx` рядом с ID-полем.
- `OptionItem.conditionType` (`hidden`/`locked`) — тип данных существует,
  но в UI нет способа его выставить (заглушка `opt-cond-*` пина
  неактивна). Если понадобится — это будущая «под-редактор в пине»
  фича, явно вынесенная за рамки прототипа исходной спекой.
- Единственный `EventActor.repeatable`/`unique` учитываются только как
  поля данных — Play не проверяет «уже пройдено ли» (нет персистентного
  состояния игрока между запусками Play).
