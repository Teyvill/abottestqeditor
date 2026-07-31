# StoryFlow-lite — project spec (for Claude)

A demo node-graph editor for game events, styled after StoryFlow / Articy
Draft X / Unreal Blueprints. Static SPA, no backend, deploys to Netlify.
Goal: let a game designer assemble an event with nodes + pins and
immediately play through it in Play mode.

This file is the engineering spec for future Claude Code sessions: what's
already built, how it's wired, and which decisions it rests on. End-user
run/deploy instructions live in `README.md`.

## Stack

React + TypeScript + Vite, `@xyflow/react` (React Flow) for the canvas,
`zustand` for state, Tailwind CSS for styling. All state lives in memory,
plus an autosave to `localStorage` (see "Autosave and SEED_VERSION" below).

## Nesting model

A tree of graphs, not a single canvas. `useStore` (`src/store.ts`) holds:

```ts
graphs: Record<string, { nodes: FlowNode[]; edges: FlowEdge[] }>
path: { containerId: string; label: string; level: number }[]
```

`"root"` is the key for the top-level (org-chart) canvas. When a `Folder`
or `Functional` node is created, a child graph `graphs[nodeId]` is lazily
created for it (seeded with a single `Start` node). Double-clicking a
Folder/Functional (`enterContainer`) pushes an entry onto `path` and the
canvas re-renders `graphs[nodeId]`. Breadcrumbs (`Breadcrumbs.tsx`) are
clickable and truncate `path` to the clicked index; the "↑ up" button does
the same for one level up.

Three graph levels:

1. **Root / organizational** (`path[0].level === 1`): `Start`, `Folder`.
2. **Functional** (inside a `Folder`, `level === 2`): `Start`,
   `Functional`, `End`, `Unlock`.
3. **Script** (inside a `Functional`, `level === 3`): `Start`,
   `Event Actor`, `Location`, `Dialogue` (+ `Option` inside Dialogue),
   `End`, `Unlock`.

The node palette (`Palette.tsx`, `LEVEL_ITEMS`) is context-aware per
level — it only shows the kinds valid for the current canvas. `Start` is a
singleton per canvas at every level (its palette button disables itself
once one exists).

## Node kinds and their pins

All pin logic lives in `src/nodes/pinTypes.ts` + `src/nodes/Pin.tsx`
(`PinRow`) — see the `flow`/`pin` section below. Here's what each node has,
its handle `id`s, and their type.

### Start (`src/nodes/StartNode.tsx`)
- One source pin `out`, type `flow`, unlabeled (just the arrow).
- Entry point. Can exist at any of the three levels (see the palette), one
  per canvas.

### Folder (`FolderNode.tsx`)
- Field `name: string`.
- Target pin `trigger` (flow, unlabeled) on the left — accepts `Start.out`.
- Badge showing node count inside (`graphs[id]?.nodes.length`).
- Double-click → enters its child graph.

### Functional (`FunctionalNode.tsx`)
- Field `name: string`.
- Target pin `trigger` (flow, unlabeled) on the left — accepts `Start.out`.
- Source pin `impact` (flow, labeled "end of script") on the right — feeds
  `End`/`Unlock` in the same (functional-level) graph.
- Badge with node count inside, double-click → enters the script graph.

### Event Actor (`EventActorNode.tsx`) — the central node
Fields (`EventActorData` in `types.ts`):
- `name: string`, capped at 60 chars, with a live counter in the field
  label.
- `idOverride: string | null` plus the auto-ID (see below) with an
  override button.
- `image: string` — a URL; if it's a valid http(s) URL, a preview
  thumbnail is shown.
- `repeatable: boolean`, `unique: boolean` — checkboxes.
- `maxRuns: number` — a **"later" stub**, input is disabled.
- ID-formula source fields: `continent`, `sector`, `settlement`,
  `locationName`, `seq` — currently just defaulted strings with no
  dedicated inputs in the UI (see TODO below if that's ever needed; right
  now they're only editable via the seed defaults or JSON import).

Pins — **two independent connectors on the left**, not one:
- Target pin `trigger` (flow, unlabeled) — accepts `Start.out` or
  `Unlock.out`. This is what actually **activates** the event.
- Target pin `context` (pin, labeled "conditions (Location)") — accepts
  only `Location.out`. This is context (where), it doesn't advance
  anything.

Right side: source pin `text` (flow, labeled "event text") — leads to the
first `Dialogue`.

The `▶ Play` button at the bottom of the node opens `PlayModal`.

Auto-ID formula (`computeEventActorId` in `types.ts`):
```
`${continent}${sector}${settlement}${locationName}Event${seq}${kebab(name)}`
```
Reference example from the original brief:
`foSector1CapitalLindenmoorEvent01the-passenger`. There's a **TODO comment**
in the code: the brief's prose said "uppercase", but the reference example
itself is lower-case kebab; implemented to match the example, not the
prose.

### Dialogue (`DialogueNode.tsx`)
- Target pin `in` (flow, labeled "in") on the left.
- `text: string` — a textarea, no length limit.
- If `options.length === 0`: a source pin `impact` (flow, labeled "impact
  (Continue)") appears on the right — in Play this becomes the Continue
  button.
- `Option` is **not a standalone React Flow node** — it's an array
  `options: OptionItem[]` inside the Dialogue's data. It renders as
  "magnetized" rows under the text, reorderable via native HTML5
  drag-and-drop (`reorderOptions` in the store). Each row has:
  - a target pin `opt-cond-${optionId}` (pin, `active={false}` — a stub;
    its tooltip explains the future `hidden`/`locked` condition types).
  - a source pin `opt-${optionId}` (flow) — that option's "impact", leads
    to a `Dialogue`/`End`/`Unlock`.
  - When `options.length > 0`, the Dialogue's shared right-side `impact`
    pin is hidden (only the per-option pins remain).

### Location (`LocationNode.tsx`)
- `x, y, z: number` (three inputs in a row), `radius: number`
  ("Activation radius (m)").
- A "later" stub: "irregular zones" (badge only, no real behavior).
- Source pin `out` (**pin**, labeled "conditions") on the right — the only
  pin in the project whose handle id is literally `out` but resolves as
  `pin`, not `flow` (see `resolvePinType`'s special case for
  `nodeKind === 'location'`). It only ever leads into an Event Actor's
  `context` pin.

### End (`EndNode.tsx`)
- Only a target pin `in` (flow, labeled "in"). In Play, reaching it closes
  the modal.

### Unlock (`UnlockNode.tsx`)
- Target pin `in` (flow, labeled "in") on the left — fed by a
  Dialogue/Option's Impact.
- Field `label: string` ("Unlock id / label").
- A "later" stub: "state variable" (a future persistent flag).
- Source pin `out` (flow, unlabeled) on the right — leads into another
  Event Actor's `trigger` pin. In Play: shows a toast `Unlocked: <label>`
  and closes the modal.

## Connector model: `flow` vs `pin`

A key architectural decision (from a review pass): **a pin's type is
determined by what it *does*, not by the node's color or kind** —
`src/nodes/pinTypes.ts`:

- **`flow`** — actionable, moves the graph forward. Rendered as a white
  arrow (`clip-path` triangle), with no "trigger" text label — just the
  shape. Covers every Start→container/actor link, Event Actor→Dialogue,
  Dialogue/Option→Dialogue/End/Unlock, Unlock→Event Actor, and
  Functional→End.
- **`pin`** — context/condition, doesn't activate anything by itself.
  Rendered as a gray circle (`#94a3b8`), with a label. Currently only:
  Location→Event Actor, and the (inactive) Option condition stub.

`resolvePinType(nodeKind, handleId)` is the single function that drives
both the pin's own color (`Pin.tsx`) and the color/arrowhead of the wire
connecting it (`Canvas.tsx`, `styledEdges`), as well as connection
validation. **Never let pin color and wire color diverge by going through
different code paths** — both must call this same function, or connected
ends will visually mismatch.

### Connection validation

`Canvas.tsx` → `isValidConnection`: a connection is allowed only if
`resolvePinType` of the source and target **match** (`flow↔flow` or
`pin↔pin`), and `source !== target` (no self-loops). React Flow's default
`strict` connection mode already blocks source→source/target→target, so
"output→output" is impossible regardless of this extra check.

If you add a new `handleId`, make sure to register it in `HANDLE_TYPE` in
`pinTypes.ts` (or add a special case like the `out`+`location` one) —
otherwise it silently resolves to `flow` by default.

## Play mode (`PlayModal.tsx`)

Opened via the `▶ Play` button on an Event Actor (`openPlay(actorId)` in
the store). The player walks **the currently open graph**
(`currentGraph()`):

1. Find the edge `source === actorId && sourceHandle === 'text'` — that's
   the starting `Dialogue`.
2. Render the actor's `image` + `name` at the top (static for the whole
   playthrough), and the current Dialogue's text in the body.
3. If the Dialogue has `options` — render a button per option (skipping
   any with `conditionType === 'hidden'`; `locked` renders with a 🔒 but
   stays clickable — there's no real gating in the prototype). Clicking one
   looks up the edge `source === dialogueId && sourceHandle ===
   'opt-${optionId}'`.
4. If there are no options — render a Continue button, which looks up the
   edge with `sourceHandle === 'impact'`.
5. `goTo(targetId)`: if the node isn't found, or it's an `End` →
   `closePlay()`. If it's an `Unlock` → `showToast('Unlocked: ' + label)`
   + `closePlay()`. Otherwise — `setCurrentId(targetId)` (the next
   Dialogue).

There's no separate player-state model — it's a plain edge-following
graph walk.

## Autosave and SEED_VERSION

`localStorage['storyflow-lite-autosave-v1']` stores `{ graphs,
seedVersion }`. On startup (`initialGraphs()` in `store.ts`), the autosave
is used **only if** `seedVersion === SEED_VERSION` (exported from
`seed.ts`). Otherwise, a fresh `buildSeed()` is loaded instead.

**Important to remember**: if you edit `buildSeed()`, **always bump
`SEED_VERSION`** — otherwise any browser with an older autosave (i.e.
anyone who's already opened the page before) won't see the change and will
silently keep showing its stale cached graph. This already caused a real
bug once ("the new seed content isn't showing up"), fixed by adding this
versioning — don't regress that protection.

Autosave is a flagged feature (`AUTOSAVE_ENABLED` in `store.ts`) and can be
disabled with a single constant.

## Seed content

`src/seed.ts` isn't invented — its dialogue/option text is copied
**verbatim** from the Lindenmoor design doc (`Lindenmoor. Ивенты WIP`, a
PDF the user attached). Root: `Start → Folder "Lindenmoor — Events"`.
Inside it are two `Functional` nodes, both fired from that level's shared
`Start`, both feeding a shared `End`:

1. **Passenger** (`ID.passengerFunctional`) — the cat-on-the-giant's-head
   event. Inside: a `Start` and a `Location` both feed the "Passenger"
   Event Actor (the first into `trigger`, the second into `context`). An
   intro Dialogue with 3 options (`Put the cat back` / `Keep the cat` /
   `Shake the cat off`), each leading to its own result line → shared
   `End`.
2. **Field Harvest** (`ID.fieldFunctional`) — "Bountiful Harvest" unlocks
   "Mill". Demonstrates `Unlock` connecting two Event Actors **within one
   script graph** (there's no cross-graph edge support — Unlock can't
   reach an actor in a different Functional).
   - Event Actor "Bountiful Harvest": a `Start` + a `Location` feed its
     pins. Intro with 2 options: `Help harvest it` → result → `Unlock`
     (`label: 'field-mill-available'`) → the "Mill" Event Actor's `trigger`
     pin; `Walk right by` → result → shared `End`.
   - Event Actor "Mill": its `trigger` comes from the `Unlock` (not from a
     Start — intentionally, the mill shouldn't be available from the
     start), plus its own `Location` feeding `context`. Intro with 3
     options, each → its own result line → shared `End`.

Node IDs in the seed are deterministic strings (the `ID.*` object), not
`nextId()` — so the seed diffs cleanly and edges can reference constants
instead of UUIDs.

## File layout

```
src/
  types.ts          — NodeKind, *Data interfaces, computeEventActorId
  store.ts           — zustand: the graphs tree, path, CRUD actions,
                        onNodesChange/onEdgesChange/onConnect, export/import,
                        autosave, resetSeed
  seed.ts             — buildSeed() + SEED_VERSION
  nodes/
    pinTypes.ts        — PinType, PIN_TYPE_COLOR, resolvePinType — the
                          single source of truth for pin color/shape AND
                          wire color
    Pin.tsx             — <PinRow>, renders the handle (triangle or circle)
    NodeShell.tsx       — shared node chrome: header colored by kind,
                          KIND_COLORS, LaterBadge, Field, inputCls
    {Start,Folder,Functional,EventActor,Dialogue,Location,End,Unlock}Node.tsx
    index.ts            — nodeTypes map for <ReactFlow>
  components/
    Canvas.tsx          — <ReactFlow>, styledEdges (color + arrowhead via
                          resolvePinType), isValidConnection
    Palette.tsx          — LEVEL_ITEMS, context-aware node adding
    Breadcrumbs.tsx       — path navigation
    Toolbar.tsx            — Export/Import JSON, Reset demo
    PlayModal.tsx           — the player, graph traversal
    Toast.tsx                — toast for Unlock
```

## Known deliberate limitations / future TODOs

- Cross-graph edges aren't supported — `Unlock`/`Start` can only reach
  nodes **in the same graph**. If "unlock an event in a different
  Functional" is ever needed, that requires a different model (e.g. a
  global registry of unlock flags instead of a direct edge).
- The ID-formula fields (`continent`/`sector`/`settlement`/`locationName`/
  `seq`) on Event Actor have no dedicated inputs in the UI — they're only
  editable via the code defaults or JSON import/export. If needed, add
  small inputs to `EventActorNode.tsx` next to the ID field.
- `OptionItem.conditionType` (`hidden`/`locked`) exists as a data type, but
  there's no UI to actually set it (the `opt-cond-*` pin stub is inactive).
  If needed, that's the future "sub-editor inside a pin" feature the
  original brief explicitly scoped out of the prototype.
- `EventActor.repeatable`/`unique` are only tracked as data fields — Play
  doesn't check "already completed" (there's no persistent player state
  across Play runs).
