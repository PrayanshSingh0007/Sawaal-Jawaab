# Sawaal Jawaab

**When speaking is difficult, communication shouldn't stop.**

A communication tool for the moment someone has to ask a stranger something —
at a hospital counter, a bank, a ticket window — and speaking is hard.

The whole product is one journey:

```
ASK  →  POLISH  →  SHOW  →  UNDERSTAND
```

Ask it any way you like. It becomes one clear sentence. Your phone turns into a
card the other person can read. Their reply comes back in plain words, with the
one thing you have to do next at the top.

---

## Two surfaces, one product

```
26_SawaalJawaab/
  README.md      you are here
  mobile/        the app  — Expo · React Native · expo-router
  frontend/      the web  — Vite · React · TypeScript
```

**`mobile/` is the app** the person who finds speaking difficult installs.

**`frontend/` is not a leftover.** It is the page the QR code opens. Someone
at a hospital counter cannot install an app in order to reply to you, so the
reply and family-helper views have to be a plain web page that works in
seconds with no account. It doubles as the browser demo.

### Run the app

```bash
cd mobile && npm install && npx expo start
```

Scan the QR with **Expo Go** on your phone. No Xcode or Android Studio needed.
For a real `.apk` / `.ipa`, use `eas build` — it compiles in the cloud.

### Build an installable APK

One-time, because a build has to belong to an Expo account:

```bash
cd mobile
npx eas login        # free account
npx eas init         # writes the project id into app.json
```

Then, any time:

```bash
npx eas build -p android --profile preview
```

It compiles in the cloud — no Android Studio, no Java, nothing installed
locally — and hands back a download link for a `.apk` you can send to anyone.

| Profile | Output | For |
| --- | --- | --- |
| `preview` | `.apk` | The one you want. Sideload it, share the link. |
| `development` | `.apk` + dev client | Needed to add native modules such as dictation. |
| `production` | `.aab` | Play Store upload. |

iOS is set up too, but the `preview` profile builds for the **simulator**,
which needs Xcode; a build that runs on a real iPhone needs a paid Apple
Developer account. On this machine, Android is the practical route.

### Run the web page

```bash
cd frontend && npm install && npm run dev
```

Neither needs an API key, an account or a backend. The core journey works
immediately and works offline.

---

## The one rule that shaped the engineering

**The Show screen never waits.**

The question is on screen the moment the person arrives — rendered from their
own raw text, with a real QR code generated on-device. AI, if it is available,
improves the sentence *before* that point, never blocks it. There is no spinner
on the most important screen in the app.

Everything else follows from the same idea:

| If this is unavailable | This still works |
| --- | --- |
| Internet / AI | The offline sentence engine writes all three versions |
| Speech synthesis | The big text and the QR code |
| Microphone | Typing and the symbol board |
| Supabase | Handing the phone over, and the on-device reply sheet |
| IndexedDB | The current question, packs, and the emergency card |

---

## Screens

**Core journey** — Welcome · How do you talk? · Text size · Home/Ask · Symbol
board · Polish · **Show** · Understand

**Around it** — Situation packs · Pack detail · Practice · Emergency card ·
History · More · Settings

**For the other person** — Counter view (opened by scanning the code) ·
Companion (a temporary link for a family helper)

---

## What is shared

The whole decision-making core is platform-agnostic TypeScript and is the same
file on both sides — the offline sentence engine, the reply simplifier, the
prompts, the packs, the symbols and every type. Only the edges differ:

| | `frontend/` | `mobile/` |
| --- | --- | --- |
| Storage | IndexedDB | AsyncStorage |
| Reading aloud | `speechSynthesis` | `expo-speech` |
| Dictation | Web Speech API | needs a dev build; degrades to typing |
| QR | `qrcode.react` | `react-native-qrcode-svg` |
| Glass | `backdrop-filter` | `expo-blur` |
| Gradients & ground | CSS radial gradients | `react-native-svg` + `expo-linear-gradient` |
| Elevation | CSS `box-shadow` | RN `boxShadow` (New Architecture) |
| Haptics | — | `expo-haptics` |

The neumorphic system survived the port intact: React Native on the New
Architecture supports multi-layer and `inset` shadows, so `--e1`, `--sunk` and
the rest are the same strings on both platforms rather than being flattened
into a single drop shadow.

---

## Web architecture

```
frontend/src/
  styles/      tokens · base · components · screens   (one design system, no duplicated CSS)
  lib/
    ai/        index (the service the UI calls)
               offline (the deterministic engine — the product's floor)
               remote  (model calls, time-boxed, never throws)
               prompts (the rules the model must follow, in one readable place)
    db.ts      IndexedDB: history, phrases, emergency profile
    handoff.ts QR + companion transport (on-device, optionally shared)
    speech.ts  reading aloud, dictation, microphone level
  state/       AppState (settings, a11y, announcements) · FlowState (the journey) · router
  components/  the component library — nothing is styled twice
  screens/     one file per screen, no monolith
  data/        packs, symbols, languages
```

UI never talks to storage, the network, or a model directly. It calls
`buildSentence`, `simplifyReply`, `buildSymbolSentence`, `practiceConversation` —
all of which resolve, none of which throw, and each of which reports whether an
AI or the on-device engine answered so the interface can say so honestly.

---

## The offline sentence engine

Not a stub. It is what runs when there is no internet, and it is deterministic
and auditable:

| Input | Short | Polite |
| --- | --- | --- |
| `where submit medical report` | Where do I submit the medical report? | Excuse me, could you please tell me where I submit the medical report? |
| `how much ticket` | How much does the ticket cost? | Excuse me, could you please tell me how much the ticket costs? |
| `where toilet` | Where is the toilet? | Excuse me, could you please tell me where the toilet is? |

It never invents a name, number, date, amount, medicine or place. When a needed
fact is missing it returns **one** clarifying question rather than guessing.

### Reply simplifier

Money, doses, times, dates and counter numbers are lifted out of the sentence,
the language around them is plainer-ed, and then they are put back byte for byte:

> **In:** "Kindly proceed to counter 4 on the ground floor before 2 PM. You are
> requested to bring your Aadhaar card and the original report. The charge is Rs 350."
>
> **Action:** `Counter 4 · Before 2 PM · Bring Aadhaar card`
>
> **Out:** "Go to counter 4 on the ground floor before 2 PM. Bring your Aadhaar
> card and the original report. The charge is Rs 350."

Below 0.7 confidence the original reply is shown unchanged, with a note saying why.

---

## Accessibility

Built in, not bolted on. Every feature is named for what it does — there is no
"disability mode" anywhere in this product.

- **WCAG 2.2 AA contrast, verified.** A DOM-wide contrast audit across every
  route reports zero failures. `--ink-3` is reserved for ornament; a separate
  `--accent-ink` exists because `--accent` and `--accent-deep` do not clear
  4.5:1 as small text on warm grounds.
- **Text size** — four steps to 160%. Type is in `rem`, structure in `px`, so
  text grows and layouts absorb it. Verified: no horizontal scrolling at any
  step, at every width from **320px to 1440px**. Below 360px the symbol board
  becomes three columns rather than shrinking every target, and the pack grid,
  size options and segmented controls reflow instead of clipping.
- **High contrast** — the same layout with the softness removed: flat surfaces,
  hard edges, flat accent fills.
- **Reduced motion** — honours the system setting, and can be forced either way.
- **Dyslexia-friendly font** — Atkinson Hyperlegible with wider spacing.
- **Read everything aloud** — announces each screen and speaks controls as they
  take focus.
- **Keyboard** — full traversal, one visible focus treatment, focus-trapped
  sheets, a skip link, semantic landmarks and one `h1` per screen.
- **Touch targets** — 56px minimum for actions, 88px symbol tiles.
- **Live regions** — replies, hints and state changes are announced.
- Nothing depends on colour alone: every toggle also says "On"/"Off", every
  icon has a label, and the action chip always says "Do this".

---

## Privacy

- History, phrases and the emergency card live in IndexedDB **on the device**.
- The emergency card never leaves the phone, and never syncs.
- No analytics.
- **Delete all data** really deletes: object stores cleared, database dropped,
  local settings removed. One confirmation, no dark patterns.
- A question leaves the device only when you show it or open a helper link.

---

## Optional configuration

Everything below is optional. Copy `.env.example` to `.env`.

**`ANTHROPIC_API_KEY`** — server-side only. The dev proxy in `vite.config.ts`
holds it and the browser bundle never sees it; without it the offline engine
runs. `VITE_AI_MODEL` overrides the model (default `claude-sonnet-4-6`; set it
to `claude-sonnet-5` for the current Sonnet). For production, replace the dev
middleware with an equivalent server route.

**`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`** — enables cross-device QR
handoff and Companion links. Without them, handoff works on-device: hand the
phone over and tap **Reply here**, which is the everyday case anyway.

```sql
create table handoffs (
  id          text primary key,
  question    text not null,
  reply       text,
  suggestion  text,
  expires_at  timestamptz not null,
  created_at  timestamptz default now()
);
```

---

## Performance

Route-split, with the ask journey in the first payload and everything else
fetched on first open.

| Chunk | gzip | When it loads |
| --- | --- | --- |
| `react` | 43.2 kB | once, cached across deploys |
| `index` (shell + ask journey) | 28.1 kB | first paint |
| `qr` | 8.8 kB | first paint (the Show screen needs it) |
| CSS | 8.5 kB | first paint |
| `packs` (120 phrases) | 2.2 kB | opening Packs |
| Settings · Practice · Emergency · History · More · Companion · Symbols | 1–2 kB each | on first open |

Two things that mattered more than bytes:

- **The microphone level is not React state.** It used to re-render the whole
  Home screen on every animation frame while someone was speaking. The level
  now lives in a ref and the waveform writes bar heights straight to the DOM,
  so speaking re-renders nothing.
- **The ambient grain no longer blends.** A full-viewport `mix-blend-mode:
  multiply` layer forced the whole page to re-composite on every scroll; plain
  opacity is visually identical here and free.

---

## Liquid glass

Three things together read as glass rather than as a blur: the blur itself, a
saturation lift so colour blooms through from behind, and a **specular rim** —
a hairline gradient border, bright where light lands at the top-left, gone
across the middle, returning as a soft bounce at the far edge. It is drawn with
`mask-composite: exclude` so it follows any radius.

What makes it *liquid* is that the light moves: a highlight tracks the pointer
on devices that have one, and the navigation's active state is **one pill that
flows to where you are going** rather than four that blink on and off.

Applied only to things that float above the page — the navigation, sheets, the
practice composer. Never on content, and never stacked on other glass.

It degrades in three directions:

- no `backdrop-filter` support → a solid ceramic surface
- **high contrast** → flat white, hard border, rim and highlight removed
- **`prefers-reduced-transparency`** → the optics go, the layout is untouched

---

## Design

One warm ceramic surface, one accent, light from the top-left.

- **Palette** — canvas `#EDEAE5`, surface `#FAF9F6`, accent `#F2622E`. Orange is
  the only strong colour in the product.
- **Elevation** — a fixed set of neumorphic shadows; raised at rest, sunk when
  pressed. Elevation carries hierarchy, not decoration.
- **Glass** — see *Liquid glass* above. Only on floating navigation, sheets and
  the practice composer. Never stacked, always with a solid fallback.
- **Motion** — 120ms for a press, 240–320ms between screens, on
  `cubic-bezier(0.32, 0.72, 0, 1)`. The Show screen blooms from `scale(0.94)`.
- **Desktop** — the app does not stretch. It becomes a single warm sheet resting
  on the ceramic ground, with a 720px reading column.

Icons are one hand-drawn family on a 24px grid at 1.75 stroke — no emoji, no
icon library, and never an icon without a label.

---

## Icons

`mobile/assets/` is generated, not hand-drawn — `icon.png`, `adaptive-icon.png`,
`splash-icon.png` and `favicon.png` all come from the same 40-unit mark the app
draws at runtime, so they cannot drift apart.

The one deliberate inversion: inside the app the ground is warm ceramic and the
accent is reserved for controls, but a beige icon disappears against most
wallpapers. The home-screen icon is therefore the accent carrying the whole
tile, with the mark in cream — lit from the top-left, like everything else.

---

## Mobile architecture

```
mobile/
  app/                 expo-router routes
    _layout.tsx        fonts, providers, the ceramic ground, stack transitions
    index.tsx          welcome
    onboarding/        how do you talk · text size
    (tabs)/            ask · packs · history · more
    polish · show · understand · symbols · practice · settings · emergency
    pack/[id].tsx
  components/          the component library — nothing is styled twice
  lib/                 ai/ · store · speech · handoff · id   (shared core + native edges)
  state/               AppState (settings, a11y, haptics) · FlowState (the journey)
  theme/tokens.ts      colour · elevation · radius · space · type
  data/                packs, symbols, languages
```

Styling is design tokens plus `StyleSheet` objects rather than NativeWind
classes: the palette and the neumorphic elevation are the design, and a
`boxShadow` string carrying four layers is not something a utility class can
express. NativeWind is wired up (babel preset, `global.css`, the palette in
`tailwind.config.js`) and ready for anything new.

### What is different about the mobile build

- **Speech is better.** `expo-speech` uses the voice the person has already set
  up on their phone, and works with no internet at all.
- **Haptics.** A light tap on every press, a success tap on the primary action.
  Silent when the person has asked for reduced motion.
- **Dictation needs a development build.** Expo Go does not bundle a speech-to-
  text module, so the app reports it unavailable and offers typing and the
  picture board — the same graceful path the web takes in a browser without
  recognition. To switch it on:

  ```bash
  npx expo install expo-dev-client @react-native-voice/voice
  npx eas build -p android --profile development
  ```

  then implement `startDictation` in `lib/speech.ts` against it and flip
  `dictationAvailable()`. Every call site already handles both answers, so
  nothing else changes.
- **The QR points at the web, never at the app**, for the reason above.
