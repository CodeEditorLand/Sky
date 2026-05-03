# Changelog - Sky

Sky is our UI component layer - the Astro-driven renderer that hosts the
workbench inside our Tauri webview. This file records what we built in our
voice, version by version. Format adapted from
[Keep a Changelog](https://keepachangelog.com/).

## [v2.2] - Bundled-Electron Profile: Correctness Pass

We brought the Sky bundle to parity with the bundled-electron workbench profile
and added the bridge calls that close the event-race window between Cocoon's
extension activation cascade and our renderer-side listeners.

### Added

- **`sky:replay-events` invoke at the end of `InstallSkyBridge`**. The renderer
  asks Mountain to drain tree-view registrations, SCM providers,
  extension-registered commands, and per-terminal output-buffer state into our
  newly-installed listeners, so events Mountain emitted during the ~600 ms
  Cocoon activation cascade still reach the workbench.
- **Channel-event bridge** in our Tauri IPC proxy. We taught
  `TauriChannel.listen` how to translate `<channel>.<event>` subscriptions into
  real `sky://` Tauri event listeners with payload-shape remappers. Without
  this, the workbench's `localPty.onProcessData` callback was a no-op disposable
  and xterm never received PTY output. Initial bridge entries:
  `localPty.onProcessData` ↔ `sky://terminal/data`, `onProcessReady` ↔
  `sky://terminal/create`, `onProcessExit` ↔ `sky://terminal/exit`.
- **Promise-protocol short-circuit** in `TauriChannel.call`.
  `then`/`catch`/`finally`/`constructor`/`valueOf`/`toString`/
  `toJSON`/`@@iterator`/`@@asyncIterator` now return `undefined` synchronously,
  so each workbench wake stops invoking `<channel>:then` and logging
  `Unknown IPC command`.
- **Search-result mapper** updated to the workbench's current `ITextSearchMatch`
  shape (`previewText` + `rangeLocations` of `{source, preview}` pairs). The old
  `{preview: {text, matches}, ranges}` shape was silently rejected by
  `searchResult.add(...)`, which is why the search panel showed "0 results"
  despite the Rust searcher returning 466 files / 2560 line-matches.

## [v2.1] - Full Workbench Lift, Telemetry Bridges, Bundle Profiles

We cleaned up the workbench-host substrate and wired the renderer's telemetry
path to our local OTLP collector and PostHog.

### Added

- **`Source/Workbench/Electron/OTELBridge.ts`** (~153 lines) - a
  `PerformanceObserver` capturing `land:*` marks and forwarding them as
  OTLP/HTTP spans with retry logic.
- **`Source/Workbench/Electron/PostHogBridge.ts`** (~159 lines) - error tracking
  and analytics via CDN with per-component buffering and a `$component` taxonomy
  so we can slice signals by element.
- **`Source/Workbench/TelemetryBridge.astro`** (~17 lines) - the shared Astro
  shell that loads both bridges from one place.
- **Terminal addon dependencies** promoted to stable releases: `xterm`,
  `xterm-addon-*`.
- **Extension-scanning retry** with `node_modules` fallback.
- **Batched performance marks** to prevent OTLP rate-limiting.

### Changed

- **`enableWorkspaceTrust: false`** across all 5 workbench profiles (`Browser`,
  `BrowserProxy`, `Electron`, `Mountain`, `index`). The workspace-trust prompt
  assumes Electron's window-managed dialogs; we replace it with a Tauri-native
  flow elsewhere.
- **Workbench loading instrumentation** moved from `console.log` to
  `performance.mark()` so OTEL captures it without a parser pass.
- **Wind import path** corrected to
  `@codeeditorland/wind/Target/Function/Install`.
- **`astro.config.ts`** extended with 83+ lines for telemetry and a Vite OTLP
  proxy so dev-server traces go to localhost without CORS.
- **PostHog surveys disabled** at the renderer level; endpoint decision
  finalised.
- **327 lines of obsolete bootstrap code** removed.
- **Blob-patch refactor** to rewrite `vscode-file://` URLs.
- Astro 6.1.1 → 6.1.7, Vite 8.0.2 → 8.0.3.

## [v2.0] - Editor Launch (Astro 6 + Vite 8)

We brought the Sky bundle onto the next generation of our build substrate.

### Added

- **Astro 6 migration**: 5.16.6 → 6.1.1.
- **TypeScript 6.0.2** upgrade.
- **Vite 8.0.3** (from 7.3.0).

### Changed

- **`astro.config.ts` major rewrite**: ~98 lines added, ~165 removed to fit the
  Astro 6 plugin/config shape.
- **`Source/Function/CopyVSCode.js`** refactored for VS Code asset handling so
  the post-build pipeline lifts assets cleanly into the bundled tree.
- **Deleted 80 HTML files** from ephemeral `Target/` (414 deletions in total) -
  leftovers from the old per-page generation that the Astro 6 streaming format
  makes redundant.
- **PascalCase import naming** enforced in our TypeScript config.
- **Build pipeline integration simplified** so bundled and unbundled workbench
  profiles share more of the same wiring.

## [v1.3] - Dependency Maintenance

Astro 5.14.1 → 5.16.6. Vite 7.1.6 → 7.3.0. 85-file `.gitattributes` cleanup
(binary/text normalisation). No source code changes; architecture stable.

## [v1.2] - Full-Stack Integration

We landed `jsconfig.json` for the JS module surface and added
`Source/Function/sky-ipc-router.ts` plus `Source/Function/sky-host-bridge.ts`
for the workbench-host wiring. Astro 5.10.1 → 5.14.1, plus `nls.messages.js`
updates and routine zod / vite / astro bumps.

## [v1.1] - Architecture Buildout (Tauri Workbench Bootstrap)

The pivotal quarter - we stood up the Tauri workbench bootstrap that v1.2 / v2.x
would build on.

### Added

- **`Source/Function/WorkBench.ts`** (~200 lines) - IPC shim, process env,
  configuration resolution.
- **`Source/Workbench/Default.astro`** as the entry point, plus `Browser.astro`,
  `BrowserTest.astro`, and `Electron/Layout.astro`.
- **`Source/pages/Application.astro`** (replaces the older `Wind.astro`) and
  `Source/pages/Isolation.astro`.
- **37 keyboard-layout files** in `Target/Static/Application/keybinding/` (vi,
  en, ru, de, fr, es, …).
- **`codicon.CfDBERGQ.ttf`** font (86 KB).
- **`Application/nls.messages.js`** (~330 lines).
- **Favicon overhaul**.

### Changed

- **Workbench imports**: `electron-sandbox` → `electron-browser`.
- Vite 6.3.5 → 7.0.0 (breaking change). Astro 5.5.6 → 5.10.1.

### Removed

- `/Source/Map/VSCode/Notation.json` (obsolete CSS mapping).
- `/Source/pages/Wind.astro` (superseded by `WorkBench.ts`).
- `Application.astro.mjs`, `Wind.astro.mjs`.

## [v1.0] - Integration Phase

Astro 5.2.0 → 5.5.6. Vite 6.0.x → 6.2.4. Firebase 11.5.0 → 11.6.0. Stable
architecture; minimal source changes.

## [v0.2] - Architecture Solidification (Astro 5)

We finished the Astro 5 migration:

### Added

- `.astro/` generated types + content collections.
- `/chunks/astro/server_*.mjs` SSR module format.

### Changed

- Moved from `/Editor/index.html` + `/VSCode/index.html` to the streaming Astro
  server format.
- Removed Vite `manifest.json` static linking; adopted Astro 5 pre-rendering.
- ~1,900+ insertions in `Target/` (new Astro SSR-compatible structure).
- Astro 5.0.0 → 5.1.1, Vite 6.x integration, solid-devtools and
  `@astrojs/solid-js` 5.0.0+.

### Removed

- Legacy `/_noop-*` middleware.

## [v0.1] - Rapid Development

We added two render profiles, `Source/pages/VSCode.astro` (VS Code rendering
profile) and `Source/pages/Editor.astro` (editor profile), and brought up
Firebase for authentication. `astro.config.ts` was extended for dual-profile
builds, and we did a large bundle reorganisation that removed our old Monaco /
highlight.js bundles (~250 manifest changes).

## [v0.0] - Project Inception

The first scaffold:

- **Astro 4.x** framework setup.
- **SWUP page transitions** (`Source/Script/SWUP.ts`).
- **Tailwind CSS** foundation.
- **`Global.css`** and **`Base.css`** stylesheet system.
- **`Source/pages/index.astro`**.
