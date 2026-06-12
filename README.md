# **Sky**&#x2001;☀️

<table>
	<tr>
		<td>
			<a href="https://GitHub.Com/CodeEditorLand/Sky" target="_blank">
				<picture>
					<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/last-commit/CodeEditorLand/Sky?label=Last-commit&color=black&labelColor=black&logoColor=white&logoWidth=0" />
					<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/last-commit/CodeEditorLand/Sky?label=Last-commit&color=white&labelColor=white&logoColor=black&logoWidth=0" />
					<img src="https://img.shields.io/github/last-commit/CodeEditorLand/Sky?label=Last-commit&color=black&labelColor=black&logoColor=white&logoWidth=0" alt="Last-commit" title="Last-commit" />
				</picture>
			</a>
			<br />
			<a href="https://GitHub.Com/CodeEditorLand/Sky" target="_blank">
				<picture>
					<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/issues/CodeEditorLand/Sky?label=Issues&color=black&labelColor=black&logoColor=white&logoWidth=0" />
					<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/issues/CodeEditorLand/Sky?label=Issues&color=white&labelColor=white&logoColor=black&logoWidth=0" />
					<img src="https://img.shields.io/github/issues/CodeEditorLand/Sky?label=Issues&color=black&labelColor=black&logoColor=white&logoWidth=0" alt="Issues" title="Issues" />
				</picture>
			</a>
		</td>
		<td>
			<a href="https://github.com/CodeEditorLand/Sky" target="_blank">
				<picture>
					<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/stars/CodeEditorLand/Sky?style=flat&label=Star&logo=github&color=black&labelColor=black&logoColor=white&logoWidth=0" />
					<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/stars/CodeEditorLand/Sky?style=flat&label=Star&logo=github&color=white&labelColor=white&logoColor=black&logoWidth=0" />
					<img src="https://img.shields.io/github/stars/CodeEditorLand/Sky?style=flat&label=Star&logo=github&color=black&labelColor=black&logoColor=white&logoWidth=0" alt="Star" title="Star" />
				</picture>
			</a>
			<br />
			<a href="https://GitHub.Com/CodeEditorLand/Sky" target="_blank">
				<picture>
					<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/downloads/CodeEditorLand/Sky?label=Downloads&color=black&labelColor=black&logoColor=white&logoWidth=0" />
					<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/downloads/CodeEditorLand/Sky?label=Downloads&color=white&labelColor=white&logoColor=black&logoWidth=0" />
					<img src="https://img.shields.io/github/downloads/CodeEditorLand/Sky?label=Downloads&color=black&labelColor=black&logoColor=white&logoWidth=0" alt="Downloads" title="Downloads" />
				</picture>
			</a>
		</td>
	</tr>
</table>

The `Astro`-based UI Component Layer for Land&#x2001;🏞️

> **`Sky` renders VS Code's core `workbench` inside a Tauri WebView, surrounded
> by `Astro` pages and a bi-directional event bridge to `Mountain`. Every
> variant - Browser, Electron, Mountain - loads the same `workbench.js` from
> `@codeeditorland/output`.**

_"The editor UI consumes `Wind`'s `Effect`-`TS` services. State flows from
`Mountain` through `Wind` into the DOM, not the other way around."_

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Sky/tree/Current/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@codeeditorland/sky.svg)](https://www.npmjs.com/package/@codeeditorland/sky)
[![Astro Version](https://img.shields.io/badge/Astro-5.x-blue.svg)](https://www.npmjs.com/package/astro)
[![Effect Version](https://img.shields.io/badge/Effect-3.x-blueviolet.svg)](https://www.npmjs.com/package/effect)

**[@codeeditorland/sky](https://www.npmjs.com/package/@codeeditorland/sky)**&#x2001;📦

---

## Overview

**Sky** is the declarative **UI component layer** of the **Land** Code Editor.
Built with the **`Astro`** framework, `Sky` renders the editor interface -
editor, side bar, activity bar, status bar, and panels - operating within the
**Tauri** webview alongside `Wind`. It consumes state and services from the
`Wind` service layer to display and manage the editor's visual presentation.

`Sky` loads VS Code's core `workbench` from `@codeeditorland/output` and
surrounds it with `Astro` pages, a Tauri event bridge (`SkyBridge`), and a
`Vite`/`Rollup` compilation pipeline that pre-compiles each variant into a
`bundled-workbench` chunk. The `index.astro` entry point selects the active
workbench at build time via environment variables, with conditional dynamic
imports that prevent unused variants from entering `Vite`'s module graph.

**Sky is engineered to:**

1. **Render the Editor UI** - Display the full VS Code `workbench` with high
   visual fidelity inside a Tauri WebView, supporting themes, icons, and
   extension-provided UI contributions.
2. **Bridge Events Bi-Directionally** - Route ~100 `sky://` event channels
   between `Mountain` (Rust backend) and the `workbench` (JavaScript frontend)
   through `SkyBridge`, enabling real-time command dispatch, status updates, and
   UI state synchronization.
3. **Support Multiple Workbench Variants** - Provide Browser (A1),
   Mountain-backed (A2, recommended), and Electron (A3) variants from a single
   codebase, selected at build time via environment variables with conditional
   dynamic imports.
4. **Optimize Delivery** - Use `Astro`'s static generation and selective
   hydration to minimize JavaScript payload, with `@playform/compress` and
   `@playform/inline` for post-build optimization.

---

## Key Features&#x2001;🚀

**Multi-Variant Workbench System** - Four rendering variants (Browser, Mountain,
Electron, Bundled) selected at build time via environment variables. Conditional
dynamic imports in `index.astro` ensure only the active variant enters `Vite`'s
module graph.

| Variant | Description |
| ------- | ----------- |
| **A1: Browser/BrowserProxy** | Browser workbench with optional service proxy |
| **A2: Mountain (recommended)** | Browser workbench with Mountain-backed providers via full IPC chain |
| **A3: Electron** | Electron workbench with WKWebView polyfills (`requestIdleCallback`, `queryLocalFonts`, `__name`, Blob patch) |
| **Bundled** | Pre-compiled Vite/Rollup chunks under `Target/Static/Bundled/<Variant>/` |

**`SkyBridge` Event Router** - A ~2,900-line event router subscribing to ~100
`sky://` channels from `Mountain`, with submodules for commands, status bar,
output channels, diagnostics, SCM, debug, search, notifications, and more.
Bi-directional communication via Tauri `invoke` + `listen`.

**`Astro` Component Islands** - Pages (`index.astro`, `Mountain.astro`,
`Electron.astro`, `BrowserProxy.astro`, etc.) serve as route entry points, with
workbench implementations as composable `Astro` components that hydrate
selectively.

**Deep `Wind` Integration** - Consumes `Wind`'s `Effect`-`TS` service layer
directly. The `Wind/Preload.ts` shim sets up the `ipcRenderer` bridge and
`window.vscode` namespace before the `workbench` loads.

**WKWebView Polyfills** - The Electron (A3) variant includes polyfills for
`requestIdleCallback`, `queryLocalFonts`, `__name`, and `Blob` to match native
VS Code behavior in Tauri's WKWebView on macOS.

**Build Pipeline Integration** - `@playform/build`, `@playform/compress`, and
`@playform/inline` integrate with the ~1,450-line `astro.config.ts` to produce
optimized, compressed bundles.

---

## Core Architecture Principles&#x2001;🏗️

| Principle | Description | Key Components |
| --------- | ----------- | -------------- |
| **Compatibility** | High-fidelity VS Code UI rendering to maximize compatibility with extensions and workflows | `Workbench/*`, `Workbench/BrowserProxy/*`, `Workbench/Electron/*`, `@codeeditorland/output` |
| **Modularity** | Pages, workbenches, and layouts organized into distinct, cohesive modules with conditional imports | `pages/*`, `Workbench/*`, `Function/*` |
| **Performance** | Astro's static generation and selective hydration minimize JavaScript payload; compressed output | Astro build system, Component Islands, `@playform/compress` |
| **Integration** | Seamless connection with `Wind` services and `Mountain` backend through Tauri events and IPC | `SkyBridge`, `Bootstrap`, Tauri event listeners |
| **Maintainability** | UI state driven by `Wind` services for predictable data flow; clear boundary between rendering and logic | Service consumption pattern, Event-driven updates |

---

## System Architecture

```mermaid
graph LR
    classDef sky      fill:#9cf,stroke:#2471a3,stroke-width:2px,color:#001040;
    classDef wind     fill:#ffe,stroke:#d4ac0d,stroke-width:2px,color:#3d3000;
    classDef tauri    fill:#fde,stroke:#c0392b,stroke-width:2px,color:#4a0010;
    classDef mountain fill:#f0d0ff,stroke:#9b59b6,stroke-width:2px,color:#2c0050;
    classDef external fill:#ebebeb,stroke:#888,stroke-dasharray:5 5,color:#333;
    classDef bridge   fill:#e8ffe8,stroke:#27ae60,stroke-width:1px,color:#0a3a0a;

    subgraph SKY["Sky ☀️ - Astro UI Layer (Tauri WebView)"]
        direction TB
        subgraph PAGES["pages/ - Route Entry Points"]
            IndexPage["index.astro - env-driven variant selector"]:::sky
            MountainPage["Mountain.astro - A2 recommended 🏔️"]:::sky
            ElectronPage["Electron.astro - A3 + WKWebView polyfills"]:::sky
            BrowserPage["BrowserProxy.astro - A1"]:::sky
            BundledPages["Bundled/ - pre-compiled variants"]:::sky
        end
        subgraph WORKBENCH["Workbench/ - Component Implementations"]
            ElectronWB["Electron/ - Layout · Bootstrap · Polyfills · SkyBridge"]:::sky
            BrowserProxyWB["BrowserProxy/ - Layout · Bootstrap · Services/Proxy"]:::sky
            BundledWB["Bundled/ - Browser · Electron · Sessions · Workbench"]:::sky
        end
        SkyBridge["Function/Sky/Bridge.ts - ~100 sky:// event channels 🌉"]:::bridge
    end

    subgraph WIND["Wind 🌬️ - Service Layer (same WebView)"]
        WindPreload["Preload.ts - ipcRenderer shim + window.vscode"]:::wind
        WindServices["Effect/Layers/TauriLiveLayer - 40+ services ⚡"]:::wind
    end

    subgraph BACKEND["Tauri Shell + Mountain ⛰️"]
        TauriAPI["Tauri Window API + Events"]:::tauri
        MountainCore["Mountain - Rust Core"]:::mountain
    end

    subgraph OUTPUT["@codeeditorland/output 📦"]
        VSCodeUI["VS Code workbench.js + web.main.js"]:::external
    end

    IndexPage --> MountainPage
    IndexPage --> ElectronPage
    IndexPage --> BrowserPage
    MountainPage --> ElectronWB
    ElectronPage --> ElectronWB
    BrowserPage --> BrowserProxyWB
    IndexPage --> BundledPages
    BundledPages --> BundledWB
    ElectronWB --> WindPreload
    BrowserProxyWB --> WindPreload
    WindPreload --> WindServices
    ElectronWB -- loads --> VSCodeUI
    BrowserProxyWB -- loads --> VSCodeUI
    ElectronWB --> SkyBridge
    SkyBridge -- tauri listen sky:// --> TauriAPI
    WindServices -- tauri::invoke --> TauriAPI
    TauriAPI -- commands + events --> MountainCore
    MountainCore -- sky:// emit --> TauriAPI
```

**Connection paths:**

| Path | Protocol | Use Case |
| ---- | -------- | -------- |
| Sky → Mountain via `SkyBridge` | Tauri `sky://` events + `invoke` | Command dispatch, UI state sync, notifications |
| Sky → `@codeeditorland/output` | Static import / dynamic `import()` | Load VS Code `workbench.js` bundles |
| Sky → Wind | Direct `Effect`-`TS` service calls | Consume service layer state and effects |
| Wind → Mountain | Tauri `invoke` | IPC command invocation |
| Mountain → Sky | Tauri emit `sky://` | Backend-to-frontend events |
| `workbench` → `SkyBridge` | `window.__celBridge` object | Forward workbench requests to Mountain |

---

## Key Components

| Component | Path | Description |
| --------- | ---- | ----------- |
| index.astro | `Source/pages/index.astro` | Dynamic workbench entry point driven by environment variables |
| Mountain.astro | `Source/pages/Mountain.astro` | A2 (recommended) Mountain-backed provider page |
| Electron.astro | `Source/pages/Electron.astro` | A3 electron variant with polyfills |
| BrowserProxy.astro | `Source/pages/BrowserProxy.astro` | A1 browser workbench with service proxy |
| Bundled Pages | `Source/pages/Bundled/` | Pre-compiled variant entry pages (Browser, Electron, Sessions, Workbench) |
| SkyBridge | `Source/Function/Sky/Bridge.ts` | ~2,900-line event router subscribing to ~100 `sky://` channels from Mountain |
| SkyBridge Submodules | `Source/Function/Sky/Bridge/` | Per-channel routers: Commands, Statusbar, Output, Diagnostics, SCM, Debug, Search, Notifications, etc. |
| Electron Workbench | `Source/Workbench/Electron/` | A3 variant: Bootstrap, WKWebView polyfills, Workbench loader, SkyBridge, OTELBridge, Traceparent bridge |
| BrowserProxy Workbench | `Source/Workbench/BrowserProxy/` | A1 variant: Bootstrap, Services/Proxy, Workbench loader, Wind preload |
| Mountain Workbench | `Source/Workbench/Mountain.astro` | A2 variant: Workbench loader with phase advance |
| Bundled Workbench | `Source/Workbench/Bundled/` | Pre-compiled variants: Browser, Electron, Sessions, Workbench entries |
| astro.config.ts | `Source/astro.config.ts` | ~1,450-line Astro + Vite configuration orchestrating the build pipeline |
| Base Layout | `Source/Function/Markup/Base.astro` | Shared page layout with Content Security Policy |
| Build Utilities | `Source/Function/Build/VS/Code.ts` | Build pipeline utilities |
| Debug | `Source/Function/Debug.ts` | Build context logging |
| env.d.ts | `Source/env.d.ts` | TypeScript environment declarations |

---

## Project Structure&#x2001;🗺️

```
Sky/
├── Source/
│   ├── Function/
│   │   ├── Build/VS/Code.ts           # Build pipeline utilities
│   │   ├── Markup/Base.astro          # Shared page layout with CSP
│   │   ├── Meta.astro                 # Meta tag component
│   │   ├── Shared.ts                  # Bust cache, debug toggle
│   │   ├── Sky/Bridge.ts              # SkyBridge event router (~2,900 lines)
│   │   ├── Sky/Bridge/                # Router submodules (commands,
│   │   │                              #   statusbar, output, diagnostics,
│   │   │                              #   SCM, debug, search, and more)
│   │   ├── Debug.ts                   # Build context logging
│   │   └── SmokeTest/                 # Smoke test utilities
│   ├── pages/
│   │   ├── index.astro                # Dynamic workbench entry (env-driven)
│   │   ├── Browser.astro              # Direct browser workbench page
│   │   ├── BrowserProxy.astro         # A1: Browser + services proxy page
│   │   ├── Electron.astro             # A3: Electron + polyfills page
│   │   ├── Isolation.astro            # Tauri isolation hook
│   │   ├── Mountain.astro             # A2: Mountain providers page
│   │   │                              #   (RECOMMENDED)
│   │   └── Bundled/
│   │       ├── Browser.astro          # Bundled browser variant entry
│   │       ├── Electron.astro         # Bundled electron variant entry
│   │       ├── Sessions.astro         # Bundled sessions variant entry
│   │       └── Workbench.astro        # Bundled workbench variant entry
│   ├── Workbench/
│   │   ├── Browser.astro              # Minimal browser workbench loader
│   │   ├── BrowserTest.astro          # Test entry with smoke test driver
│   │   ├── Default.astro              # DEPRECATED entry point
│   │   ├── Mountain.astro             # A2 workbench with phase advance
│   │   ├── NLS.astro                  # NLS configuration script
│   │   ├── TelemetryBridge.astro      # PostHog telemetry script
│   │   ├── BrowserProxy/
│   │   │   ├── Bootstrap.ts           # Effect-TS bootstrap
│   │   │   ├── Layout.astro           # Sequential load: preload ->
│   │   │   │                          #   bootstrap -> workbench
│   │   │   ├── Workbench.ts           # VS Code browser workbench loader
│   │   │   ├── Services/Proxy.ts      # Mountain service proxy layer
│   │   │   └── Wind/Preload.ts        # Wind environment shim
│   │   ├── Electron/
│   │   │   ├── Bootstrap.ts           # Effect-TS bootstrap
│   │   │   ├── Layout.astro           # Sequential: preload -> polyfills
│   │   │   │                          #   -> bootstrap -> workbench ->
│   │   │   │                          #   SkyBridge
│   │   │   ├── Workbench.ts           # Electron workbench with
│   │   │   │                          #   WKWebView polyfills
│   │   │   ├── Polyfills.ts           # requestIdleCallback,
│   │   │   │                          #   queryLocalFonts, __name, Blob
│   │   │   ├── Wind/Preload.ts        # Wind environment shim
│   │   │   ├── Traceparent/Bridge.ts  # Traceparent propagation
│   │   │   ├── OTELBridge.ts          # OpenTelemetry bridge
│   │   │   ├── Post/Hog/Bridge.ts     # PostHog analytics bridge
│   │   │   ├── WorkerBundleImports.astro
│   │   │   └── Extension/Change/
│   │   │       └── Subscriber.ts
│   │   └── Bundled/
│   │       ├── Browser/               # Bundled browser variant
│   │       ├── Electron/              # Bundled electron variant
│   │       ├── Sessions/              # Bundled sessions variant
│   │       └── Workbench/             # Bundled workbench variant
│   └── env.d.ts                       # TypeScript environment
│                                      #   declarations
├── Public/                # Static assets (favicon, manifest,
│                          #   product.json, robots.txt)
├── Target/                # Build output
├── astro.config.ts        # Astro + Vite configuration (~1,450 lines)
├── package.json
├── tsconfig.json
└── jsconfig.json
```

---

## In the Land Project

`Sky` is the UI layer that renders inside the Tauri WebView, consuming `Wind`'s
`Effect`-`TS` services. It connects the user interface to the `Mountain` backend
through Tauri's IPC and event system.

| Role | Description |
| ---- | ----------- |
| **Depends on** | `Wind` (service layer), `@codeeditorland/output` (VS Code workbench bundles), `Mountain` (backend via Tauri IPC) |
| **Consumed by** | End users (the editor UI) |
| **Protocol** | Tauri IPC (`invoke` + `listen`), `sky://` Tauri events |
| **Correlated Element** | `Cocoon` (extension host, runs in the same Tauri WebView) |

`Sky` communicates with `Mountain` via `SkyBridge`'s `sky://` Tauri event
channels and `Wind`'s `invoke` IPC. It loads VS Code's `workbench.js` from
`@codeeditorland/output` and mounts it in the DOM, with
environment-variable-driven variant selection at build time.

---

## Getting Started&#x2001;🚀

### Prerequisites

- **Node.js** 22 or later
- **pnpm** package manager
- **Tauri** development environment (for full WebView integration)

### Install

```sh
pnpm add @codeeditorland/sky
```

**Key Dependencies:**

| Package | Purpose |
| ------- | ------- |
| `astro` | UI framework (v6.x) |
| `@codeeditorland/wind` | Effect-TS service layer |
| `@codeeditorland/common` | Rust core bindings and IPC type definitions |
| `@codeeditorland/output` | VS Code output bundle and transform plugins |
| `@codeeditorland/worker` | Web worker implementations |
| `@codeeditorland/cocoon` | Cocoon service layer |
| `@playform/build` | Build pipeline integration |
| `@playform/compress` | Post-build HTML/CSS/JS compression |
| `@playform/inline` | Inline critical assets |
| `@xterm/xterm` | Web terminal (v6.1.0-beta) |
| `@xterm/addon-*` | Terminal addons (clipboard, image, search, etc.) |
| `@vscode/vscode-languagedetection` | Language detection for editor |
| `effect` | Functional effect system (via wind) |
| `zod` | Schema validation (v4.x) |
| `deepmerge-ts` | Deep merge utilities |
| `dotenv` | Environment variable loading |
| `vite` | Module bundler (v8.x) |

### Usage

Select the workbench at runtime via environment variables:

```bash
# A2: Mountain workbench (RECOMMENDED)
Mountain=true pnpm run Run

# A3: Electron workbench
Electron=true pnpm run Run

# A1: Browser Proxy workbench
BrowserProxy=true pnpm run Run

# A1: Bare browser workbench
Browser=true pnpm run Run

# Bundled mode (pre-compiled variants)
Bundle=true Pack="electron browser" pnpm run Run
```

Or import workbench components directly:

```astro
---
import MountainWorkbench from "../Workbench/Mountain.astro";
---

<html>
	<body>
		<MountainWorkbench />
	</body>
</html>
```

---

## Security&#x2001;🔒

Sky enforces security at multiple layers:

| Layer | Mechanism |
| ----- | --------- |
| **Content Security Policy** | Strict CSP enforced via `Base.astro` layout, limiting script sources and inline execution |
| **Protocol Boundary** | `sky://` event channels segregate UI and backend communication; no direct DOM access from Rust |
| **WKWebView Sandbox** | macOS WebView process isolation with no filesystem or network access beyond Tauri grants |
| **Dependency Integrity** | All npm packages pinned via `pnpm-lock.yaml`; `pnpm audit` runs in CI |
| **Astro Build** | Static generation eliminates server-side rendering attack surface; no runtime Node.js in production |
| **Tauri CSP** | Tauri's built-in Content Security Policy headers restrict WebView capabilities |

---

## Compatibility

Sky is designed to be compatible with:

| Target | Integration |
| ------ | ----------- |
| **Wind** 🌬️ | Consumes `Effect`-`TS` service layer directly within the same Tauri WebView |
| **Mountain** ⛰️ | Connects via `SkyBridge` `sky://` Tauri events and `invoke` IPC |
| **Cocoon** 🦋 | Shares the Tauri WebView; correlated frontend element for extension hosting |
| **Output** 📦 | Loads VS Code `workbench.js` and `web.main.js` bundles from `@codeeditorland/output` |
| **Worker** ⚙️ | Integrates service worker for caching, offline support, and dynamic CSS loading |
| **VS Code Extensions** | Renders extension-contributed UI (webviews, status bar items, tree views) with native fidelity |
| **Tauri v2** | Built against Tauri v2 API for window management and IPC |

---

## API Reference

- [SkyBridge Event Channels](https://github.com/CodeEditorLand/Sky/tree/Current/Source/Function/Sky/Bridge.ts)
    - Complete event routing for ~100 `sky://` channels
- [Page Routes](https://github.com/CodeEditorLand/Sky/tree/Current/Source/pages/)
    - All entry point pages
- [Workbench Implementations](https://github.com/CodeEditorLand/Sky/tree/Current/Source/Workbench/)
    - Layout, bootstrap, and workbench loader components

---

## Related Documentation

- [Architecture Overview](https://Editor.Land/Doc/architecture) - Internal
  module structure
- [Why Tauri](https://Editor.Land/Doc/why-tauri) - Design rationale for Tauri
- [Land Documentation](../../Documentation/GitHub/README.md) - Complete
  documentation index
- [Wind 🌬️](https://github.com/CodeEditorLand/Wind) - Service layer that `Sky`
  consumes
- [Cocoon 🦋](https://github.com/CodeEditorLand/Cocoon) - Extension host sidecar
  (correlated frontend element)
- [Worker ⚙️](https://github.com/CodeEditorLand/Worker) - Service worker for
  caching and offline support
- [Mountain ⛰️](https://github.com/CodeEditorLand/Mountain) - Native desktop
  shell and backend

---

## License

This project is released into the public domain under the **Creative Commons CC0
Universal** license. You are free to use, modify, distribute, and build upon
this work for any purpose, without any restrictions. For the full legal text,
see the [`LICENSE`](https://github.com/CodeEditorLand/Sky/tree/Current/LICENSE)
file.

---

## Changelog

See
[`CHANGELOG.md`](https://github.com/CodeEditorLand/Sky/tree/Current/CHANGELOG.md)
for a history of changes specific to **Sky** ☀️.

---

## Funding & Acknowledgements&#x2001;🙏🏻

This project is funded through
[NGI0 Commons Fund](https://NLnet.NL/commonsfund), a fund established by
[NLnet](https://NLnet.NL) with financial support from the European Commission's
Next Generation Internet program, under grant agreement No 101135429.

The project is operated by PlayForm, based in Sofia, Bulgaria. PlayForm acts as
the open-source steward for Code Editor Land under the NGI0 Commons Fund grant.

<table>
	<tbody>
		<tr>
			<td align="left" valign="middle">
				<a href="https://Editor.Land">
					<img width="60" src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" alt="Land" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://PlayForm.Cloud">
					<img width="76" src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" alt="PlayForm" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL">
					<img width="240" src="https://NLnet.NL/logo/banner.svg" alt="NLnet" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL/commonsfund">
					<img width="240" src="https://NLnet.NL/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund" />
				</a>
			</td>
		</tr>
	</tbody>
</table>

---

**Project Maintainers**: Source Open
([Source/Open@editor.land](mailto:Source/Open@editor.land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Sky) |
[Report an Issue](https://github.com/CodeEditorLand/Sky/issues) |
[Security Policy](https://github.com/CodeEditorLand/Sky/security/policy)
