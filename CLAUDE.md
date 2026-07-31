# StoryFlow-lite — functional spec (for Claude)

A demo node-graph editor for game events, styled after StoryFlow / Articy
Draft X / Unreal Blueprints. It runs entirely in the browser — nothing is
saved on a server. The goal: a game designer assembles an event out of
nodes and connectors, then immediately plays through it to check how it
feels.

This file describes **what the tool does and how it behaves** — enough
for another Claude to assemble it from scratch. How it's actually built is
left to the programmer.

## The canvas is nested, not flat

It's not one big canvas — it's three levels deep, each level its own
canvas. A container node (a Folder, or a Functional) opens into its own
child canvas when you double-click it. Breadcrumbs at the top always show
where you are and let you jump back to any earlier level.

1. **Root level** — the organizational overview. Holds `Start` and
   `Folder` nodes.
2. **Inside a Folder** — the functional level. Holds `Start`,
   `Functional`, `End`, and `Unlock` nodes.
3. **Inside a Functional** — the script level, where an actual event gets
   built. Holds `Start`, `Event Actor`, `Location`, `Dialogue` (with
   `Option`s attached to it), `End`, and `Unlock`.

Only the node kinds valid for the level you're currently looking at can be
added there. `Start` can only exist once per canvas — the option to add
another one disables itself once one is present.

## Node kinds

### Start
No fields. One outgoing connector. Exists at every level, and is what
actually kicks off whatever "next thing" lives at that level — a Folder, a
Functional, or an Event Actor.

### Folder
An organizational grouping with a name. Has one incoming connector (fed by
a Start) and shows how many nodes live inside it. Double-click to step
into its own child canvas.

### Functional
Wraps a single event at the functional level. Has a name, one incoming
connector (fed by a Start), and one outgoing connector labeled "end of
script" — this is what the event inside it eventually reaches (an `End`
or `Unlock` at this same level). Double-click to step into its script.

### Event Actor — the centerpiece
The actual event. Fields:
- A name, capped at 60 characters, with a live character counter.
- An auto-generated ID, built from a location/region code plus a running
  number plus the event's own name — with a manual override available if
  the auto-generated one needs to be replaced.
- An image URL, shown as a preview thumbnail once it looks valid.
- Repeatable / Unique toggles.
- A run-limit field — visible, but intentionally not wired up yet (a
  planned feature, not usable in this prototype).

It has **two separate incoming connectors** that must never be confused
with each other:
- One is the **activation** connector — the thing that actually turns the
  event on. Fed by a Start, or by an Unlock coming from a different event.
- The other is a **conditions** connector — purely contextual, fed only by
  a Location. It says *where* the event happens; on its own it never
  turns anything on.

One outgoing connector leads into the event's first line of dialogue. A
Play button opens the event in a player view.

The ID formula's building blocks (region/sector/settlement/location name/
sequence number) don't have their own input fields yet — they can only be
set through the starter content or by importing a save file that already
has them.

### Dialogue
A block of open-ended text, plus one incoming connector. On the outgoing
side, either:
- one shared connector used as a "Continue" step, if there are no
  options, or
- a list of player-facing options once at least one is added (the shared
  Continue connector disappears in that case).

### Option
Not a node of its own — it's attached to a Dialogue, listed underneath it,
and can be dragged to reorder. Each option has its own text and its own
outgoing connector (its own consequence), leading to another Dialogue, an
End, or an Unlock. Each option also has a placeholder for a future
condition (making the option either invisible, or visible-but-locked) —
present in the UI so the intent is clear, but not actually settable yet.

### Location
A spatial trigger: X/Y/Z coordinates and an activation radius. Has a
placeholder for "irregular zones" (a shape other than a simple radius) —
not a real feature yet. One outgoing connector, and it is *only* ever
context — it can feed an Event Actor's conditions connector, never its
activation connector.

### End
A dead end. One incoming connector. Reaching it while playing closes the
event.

### Unlock
One incoming connector (fed by a Dialogue/Option consequence), and one
outgoing connector that — like a Start — can activate an Event Actor. Has
a label field identifying what's being unlocked. Has a placeholder for a
future persistent flag. Reaching it while playing shows a brief
"Unlocked: <label>" notice, then closes the event.

## Two kinds of connector, never mixed

Every connector on every node is one of exactly two kinds, and a wire can
only ever join two connectors of the *same* kind:

- **An actionable arrow** — anything that moves the story forward: a
  Start kicking something off, dialogue advancing to its next line or to
  an option's consequence, an Unlock activating the next event. Drawn as
  a plain arrow, no label needed — the shape alone says "this leads to
  that."
- **A context pin** — anything that only supplies background information
  without moving anything forward by itself: a Location telling an Event
  Actor where it happens, or (in the future) a condition on an option.
  Drawn as a small dot, labeled with what kind of context it carries.

This is enforced, not just a visual convention: you can't wire an arrow
connector into a context pin or vice versa, so it's impossible to
accidentally make "this happens in a certain place" behave as if it were
"the thing that makes this happen." Each node kind has its own header
color for quick identification, but connector color follows this arrow/pin
split instead — so two ends of any legal wire always match in color.

## Playing an event

Clicking Play on an Event Actor opens a player view:
- The event's image and name stay fixed at the top for the whole
  playthrough.
- The body shows the current line of dialogue.
- If that line has options, each becomes a button (one marked invisible
  stays hidden; one marked locked still shows with a lock icon and, in
  this demo, is still clickable — there's no real gating yet). If it has
  no options, there's a single Continue button instead.
- Following the chain eventually reaches either an End (the view closes)
  or an Unlock (a brief "Unlocked: ..." notice appears, then it closes).
- There's no separate memory of what a player has already done — playing
  just walks the current wiring live, exactly as the editor has it laid
  out at that moment.

## Editing behavior

- An "add node" list only offers the kinds valid for whatever level you're
  currently looking at.
- Nodes can be dragged around; connectors are dragged between to wire
  them (only matching-kind connectors accept each other); nodes and wires
  can be selected and deleted.
- Double-clicking a Folder or a Functional steps into what it contains;
  breadcrumbs show the current path and jump back to any earlier level.
- The canvas supports pan and zoom, with a minimap and zoom controls.
- The whole project can be exported to a save file and re-imported later;
  there's also a "reset to starter content" action.
- Work is auto-saved in the browser as you go, so reloading the page
  doesn't lose it — except that if the built-in starter content is ever
  updated, that update must always win over anything already cached in a
  visitor's browser, so nobody gets stuck looking at outdated starter
  content forever.

## Starter content

Loads pre-populated with two real, hand-written events (not placeholder
text) inside a shared folder:
- **Passenger** — a giant gets accused of stealing a cat that's actually
  just napping on their head; three options, three different flavorful
  consequences.
- **Field Harvest → Mill** — helping a farmer harvest an overgrown field
  unlocks a second event (a broken mill) that isn't reachable any other
  way; walking past instead skips straight to the end without unlocking
  anything. This pair exists specifically to demonstrate one event
  unlocking another.

## Things intentionally left unfinished

- An Unlock can only ever reach an Event Actor that lives inside the same
  script — it can't reach into a different Functional's content.
- The event ID's building-block fields have no dedicated inputs yet (see
  Event Actor above).
- Marking an option as hidden or locked isn't actually possible in the
  editor yet — the connector for it is present but inert.
- Repeatable/Unique are recorded but not enforced — playing an event
  doesn't remember whether it was already completed before.
