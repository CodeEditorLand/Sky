# Changelog

All notable changes to Sky (UI Component Layer) are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/).

## [v2.1] — Q2 2026: Full Workbench Lift

### Added

- `Source/Workbench/Electron/OTELBridge.ts` (153 lines) —
  PerformanceObserver capturing `land:*` marks → OTLP/HTTP with retry logic
- `Source/Workbench/Electron/PostHogBridge.ts` (159 lines) — error tracking
  and analytics via CDN with per-component buffering and $component taxonomy
- `Source/Workbench/TelemetryBridge.astro` (17 lines) — shared component
  loading bridges
- Terminal addon dependencies: xterm, xterm-addon-* promoted to stable releases
- Extension scanning retry logic with node_modules fallback
- Batch performance marks to prevent rate limiting

### Changed

- `enableWorkspaceTrust: false` across all 5 workbench profiles (Browser,
  BrowserProxy, Electron, Mountain, index)
- Workbench loading refactored to use `performance.mark()` instead of
  console.log
- Wind import path fixed: `@codeeditorland/wind/Target/Function/Install`
- astro.config.ts extended with 83+ lines for telemetry and Vite OTLP proxy
- Removed 327 lines of obsolete bootstrap code
- Blob patch refactored to rewrite vscode-file:// URLs
- PostHog surveys disabled; endpoint decision finalized
- Astro 6.1.1 → 6.1.7, Vite 8.0.2 → 8.0.3

## [v2.0] — Q1 2026: Editor Launch Sprint

### Added

- Astro 6 migration: 5.16.6 → 6.1.1 (March 21)
- TypeScript 6.0.2 upgrade (March 26)
- Vite 8.0.3 (from 7.3.0)

### Changed

- astro.config.ts major rewrite (98 lines added, 165 removed)
- `Source/Function/CopyVSCode.js` refactored for VS Code asset handling
- Deleted 80 HTML files from ephemeral Target/ (414 total deletions)
- PascalCase import naming enforced in TypeScript config
- Build pipeline integration simplified

## [v1.3] — Q4 2025: Dependency Maintenance

### Changed

- Astro 5.14.1 → 5.16.6
- Vite 7.1.6 → 7.3.0
- 85-file gitattributes cleanup (binary/text normalization)
- No source code changes; architecture stable

## [v1.2] — Q3 2025: Full Stack Integration

### Added

- `jsconfig.json` — JavaScript configuration
- `Source/Function/sky-ipc-router.ts` — module path fixes
- `Source/Function/sky-host-bridge.ts`

### Changed

- Astro 5.10.1 → 5.14.1
- nls.messages.js module updates
- Dependency bumps: zod, vite, astro

## [v1.1] — Q2 2025: Architecture Buildout

**Critical milestone: Tauri workbench bootstrap.**

### Added

- `Source/Function/WorkBench.ts` (200 lines) — IPC shim, process env,
  configuration resolution
- `Source/Workbench/Default.astro` — entry point
- `Source/Workbench/Browser.astro`
- `Source/Workbench/BrowserTest.astro`
- `Source/Workbench/Electron/Layout.astro`
- `Source/pages/Application.astro` (replaces Wind.astro)
- `Source/pages/Isolation.astro`
- 37 keyboard layout files in `Target/Static/Application/keybinding/` (vi, en,
  ru, de, fr, es, etc.)
- codicon.CfDBERGQ.ttf font (86KB)
- Application/nls.messages.js (330 lines)
- Favicon overhaul

### Changed

- Workbench imports: `electron-sandbox` → `electron-browser`
- Vite 6.3.5 → 7.0.0 (breaking change)
- Astro 5.5.6 → 5.10.1

### Removed

- `/Source/Map/VSCode/Notation.json` (obsolete CSS mapping)
- `/Source/pages/Wind.astro` (superseded by WorkBench.ts)
- Application.astro.mjs, Wind.astro.mjs

## [v1.0] — Q1 2025: Integration Phase

### Changed

- Astro 5.2.0 → 5.5.6
- Vite 6.0.x → 6.2.4
- Firebase 11.5.0 → 11.6.0
- Stable architecture; minimal source changes

## [v0.2] — Q4 2024: Architecture Solidification

**Astro 5 migration complete.**

### Added

- .astro/ generated types and content collections
- `/chunks/astro/server_*.mjs` SSR module format

### Changed

- Moved from `/Editor/index.html` + `/VSCode/index.html` to streaming Astro
  server format
- Removed vite manifest.json static linking; adopted Astro 5 prerendering
- 1,900+ insertions in Target/ (new Astro SSR-compatible structure)
- Astro 5.0.0 → 5.1.1
- Vite 6.x integration
- solid-devtools, @astrojs/solid-js 5.0.0+

### Removed

- Legacy `/_noop-*` middleware

## [v0.1] — Q3 2024: Rapid Development

### Added

- `Source/pages/VSCode.astro` — VS Code rendering profile
- `Source/pages/Editor.astro` — editor profile
- Firebase integration for authentication

### Changed

- astro.config.ts extended for dual-profile builds
- Large bundle reorganization: removed Monaco/highlight.js bundles (250+
  manifest changes)

## [v0.0] — Q2 2024: Project Inception

### Added

- Astro 4.x framework setup
- SWUP page transitions (`Source/Script/SWUP.ts`)
- Tailwind CSS foundation
- Global.css and Base.css stylesheet system
- `Source/pages/index.astro`
