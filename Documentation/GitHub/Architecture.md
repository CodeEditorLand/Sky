# Sky: UI Component Layer

`Sky` is the UI component layer of `Land`.

- `Sky` is built with the `Astro` framework.
- It renders the editor interface inside the `Tauri` WebView. The interface
  comprises: editor, side bar, activity bar, status bar, and panels.
- It loads the `VS Code` workbench from `@codeeditorland/output`.
- It communicates via `SkyBridge` for event routing.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Page Structure](#page-structure)
4. [Workbench Variants](#workbench-variants)
5. [SkyBridge](#skybridge)
6. [Build-time Variant Selection](#build-time-variant-selection)
7. [Static Asset Layout](#static-asset-layout)
8. [Related Documentation](#related-documentation)

---

```mermaid
graph TB
    subgraph Sky["Sky UI Component Layer"]
        PAGES["pages/<br/>index.astro<br/>Mountain.astro<br/>Browser.astro<br/>Electron.astro"]
        WB["Workbench Variants<br/>Mountain / Browser<br/>Electron / Default"]
        BRIDGE["SkyBridge<br/>event routing<br/>Tauri to Workbench"]
        BUILD["Build-time Selection<br/>TierWorkbench env var"]
        PAGES --> BUILD
        BUILD --> WB
        WB --> BRIDGE
    end
    OUTPUT["@codeeditorland/output"] --> WB
    MOUNTAIN["Mountain<br/>Tauri events"] -->|"IPC events"| BRIDGE
    BRIDGE -->|"channel dispatch"| WORKBENCH["VS Code Workbench"]
```

---

## Overview 📋

`Sky` is the rendering layer that presents the `Land` editor to the user.

- It uses `Astro` for page composition.
- It loads the `VS Code` workbench from `@codeeditorland/output`.
- It bridges `Tauri` events to the workbench through `SkyBridge`.

| Attribute | Value |
| -------- | -------- |
| Language | `TypeScript` (`Astro` v6, `Vite` v8) |
| Framework | `Astro` + `Vite` |
| IPC | `Tauri` events (via `SkyBridge`) |
| Dependencies | `@codeeditorland/wind`, `@codeeditorland/output`, `@codeeditorland/cocoon`, `@codeeditorland/worker`, `@xterm/xterm`, `astro`, `vite`, `zod` |
| Consumes | `Wind` (services), `Output` (bundles), `Worker` (service worker) |

```mermaid
graph LR
    SKY["Sky<br/>rendering layer"] --> ASTRO["Astro<br/>page composition"]
    SKY --> OUTPUT["Output<br/>workbench bundle"]
    SKY --> BRIDGE["SkyBridge<br/>Tauri event bridge"]
```

---

## Architecture 🏗️

```text
+------------------------------------------------------------------+
|                          Sky                                      |
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  | pages/           |  | Workbench/       |  | Function/        | |
|  | - index.astro    |  | - Mountain.astro |  | - SkyBridge.ts   | |
|  | - entry points   |  | - Browser.astro  |  | - Debug.ts       | |
|  |                  |  | - Electron.astro |  | - Shared.ts      | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  +------------------+  +------------------+                       |
|  | Bundled/         |  | astro.config.ts  |                       |
|  | Pre-compiled     |  | Vite/Rollup      |                       |
|  | workbench chunks |  | compilation cfg  |                       |
|  +------------------+  +------------------+                       |
+------------------------------------------------------------------+
```

### Module Map 🗺️

| Path | Purpose |
| -------- | -------- |
| `Source/pages/index.astro` | Main entry page |
| `Source/pages/Mountain.astro` | Mountain workbench variant |
| `Source/pages/Browser.astro` | Browser workbench variant |
| `Source/pages/Electron.astro` | Electron workbench variant |
| `Source/pages/Isolation.astro` | Isolation mode variant |
| `Source/Workbench/Mountain.astro` | Mountain workbench component |
| `Source/Workbench/Browser.astro` | Browser workbench component |
| `Source/Workbench/Electron/` | Electron workbench component |
| `Source/Workbench/Bundled/` | Pre-compiled workbench chunks |
| `Source/Function/SkyBridge.ts` | Tauri event routing bridge |
| `Source/Function/Debug.ts` | Debug utilities |
| `Source/Function/Shared.ts` | Shared UI utilities |
| `Source/Function/Build/` | Build-time compilation helpers |

```mermaid
graph TB
    PAGES["pages/<br/>index / Mountain / Browser<br/>Electron / Isolation"] --> WB["Workbench/<br/>Mountain / Browser<br/>Electron / Bundled"]
    WB --> FUNC["Function/<br/>SkyBridge / Debug<br/>Shared / Build"]
```

---

## Page Structure 🗺️

`Sky` provides multiple page entry points, each selecting a different workbench
variant.

### index.astro ⚙️

The default entry point. It selects the active workbench at build time based on
environment variables:

```astro
---
// Pseudo-code from Sky's build-time conditional import
const WorkbenchComponent =
	TierWorkbench === "Mountain"
		? MountainWorkbench
		: TierWorkbench === "Electron"
			? ElectronWorkbench
			: TierWorkbench === "Browser"
				? BrowserWorkbench
				: DefaultWorkbench;
---

<WorkbenchComponent />
```

### Pages Overview 🗺️

| Page | Workbench | Purpose |
| -------- | -------- | -------- |
| `index.astro` | Dynamic | Default entry point, delegates to workbench selector |
| `Mountain.astro` | Mountain | Production workbench for `Tauri` runtime |
| `Browser.astro` | Browser | Development workbench with limited native features |
| `Electron.astro` | Electron | Maximum `VS Code` compatibility variant |
| `BrowserProxy.astro` | Browser | Proxy-mode workbench |
| `Isolation.astro` | Isolation | Minimal workbench for testing |

```mermaid
graph LR
    ENV["TierWorkbench env var"] --> IDX["index.astro<br/>workbench selector"]
    IDX --> M["Mountain.astro<br/>production"]
    IDX --> B["Browser.astro<br/>development"]
    IDX --> E["Electron.astro<br/>max compatibility"]
    IDX --> BP["BrowserProxy.astro<br/>proxy mode"]
    IDX --> I["Isolation.astro<br/>testing"]
```

---

## Workbench Variants 🧩

`Sky` supports multiple workbench variants compiled through `Vite`/`Rollup`:

| Variant | Astro Page | Feature Coverage | Build Profile |
| -------- | -------- | -------- | -------- |
| **Mountain** | `Mountain.astro` | 80-90% | `debug-mountain` |
| **Browser** | `Browser.astro` | 70-80% | `debug` |
| **Electron** | `Electron.astro` | 95%+ | `debug-electron` |
| **Default** | `Default.astro` | Base workbench | `debug-workbench-bundled` |
| **BrowserProxy** | `BrowserProxy.astro` | 70-80% | `debug-browser` |
| **NLS** | `NLS.astro` | Natural language search | (experimental) |

### Variant Selection ⚙️

The active variant is selected at build time and compiled by `Vite`. Unused
variants are tree-shaken and do not enter the production module graph:

```typescript
// astro.config.ts maps TierWorkbench to import path
const workbenchPath =
	{
		mountain: "./Workbench/Mountain.astro",
		browser: "./Workbench/Browser.astro",
		electron: "./Workbench/Electron.astro",
	}[TierWorkbench] || "./Workbench/Default.astro";
```

```mermaid
graph LR
    TIER["TierWorkbench"] --> MAP["astro.config.ts<br/>import path map"]
    MAP --> MW["Mountain.astro"]
    MAP --> BW["Browser.astro"]
    MAP --> EW["Electron.astro"]
    MAP --> DW["Default.astro<br/>fallback"]
```

---

## SkyBridge 🌐

`SkyBridge` (`Source/Function/SkyBridge.ts`, ~2900 lines) is the runtime event
routing bridge between `Tauri`'s IPC system and the `VS Code` workbench's internal
message channel system.

### Event Translation Table 🌐

| Tauri Event | VS Code Workbench Channel | Direction |
| -------- | -------- | -------- |
| `mountain:configurationChanged` | `onDidChangeConfiguration` | Mountain -> Workbench |
| `mountain:extensionsChanged` | `onDidChangeExtensions` | Mountain -> Workbench |
| `mountain:themeChanged` | `onDidChangeColorTheme` | Mountain -> Workbench |
| `mountain:fileChanged` | FileSystem watcher events | Mountain -> Workbench |
| `cocoon:commandExecuted` | Extension command result | Cocoon -> Workbench |

### Bridge Architecture 🌐

```text
Mountain emits Tauri event
    |
    v
Tauri WebView event listener
    |
    v
SkyBridge intercepts event
    |
    +---> Translates to VS Code internal channel format
    +---> Dispatches to registered workbench handlers
    +---> Handles async responses if required
    |
    v
VS Code workbench service receives notification
```

### Webview Panel Management 🗺️

`SkyBridge` manages webview content injection through `first-set-html` logging:

```text
Extension calls vscode.window.createWebviewPanel()
    |
    v
Cocoon sends gRPC createWebviewPanel request
    |
    v
Mountain creates Wry webview
    |
    v
SkyBridge sets HTML content:
    applied=method  -> Content reached real WebviewInput
    applied=setter  -> Content stored, view not yet parked
    applied=skipped -> No parked view available (silent drop)
```

```mermaid
flowchart TD
    MTN["Mountain emits Tauri event"] --> LST["Tauri WebView listener"]
    LST --> BR["SkyBridge intercepts"]
    BR --> TR["Translate to VS Code channel"]
    BR --> DP["Dispatch to handler"]
    BR --> AR["Handle async response"]
    TR --> WORKBENCH["Workbench service notified"]
    EXT["Extension createWebviewPanel"] --> COCOON["Cocoon gRPC request"]
    COCOON --> WRY["Mountain Wry webview"]
    WRY --> HTML["SkyBridge sets HTML content"]
    HTML -->|"applied=method"| R1["Content reached WebviewInput"]
    HTML -->|"applied=setter"| R2["Content stored, not parked"]
    HTML -->|"applied=skipped"| R3["No parked view, silent drop"]
```

---

## Build-time Variant Selection ⚙️

`Sky` uses `Vite`'s conditional dynamic imports to select the active workbench
at build time:

```typescript
// vite.config.ts / astro.config.ts
// The TierWorkbench env var determines which variant is compiled
const activeWorkbench = process.env.TierWorkbench || "Mountain";
```

### Bundle Output 📦

Each variant produces its own bundle:

```text
Sky/Target/Static/
+-- Bundled/
    +-- Mountain/          # When TierWorkbench=Mountain
    |   +-- workbench.js
    |   +-- workbench.css
    +-- Electron/          # When TierWorkbench=Electron
    |   +-- workbench.js
    |   +-- workbench.css
    +-- Browser/           # When TierWorkbench=Browser
        +-- workbench.js
        +-- workbench.css
+-- Application/          # Static assets (non-bundled mode)
```

```mermaid
graph LR
    TIER["TierWorkbench env var"] --> OUT["Sky/Target/Static/"]
    OUT --> M["Bundled/Mountain/<br/>workbench.js + workbench.css"]
    OUT --> E["Bundled/Electron/<br/>workbench.js + workbench.css"]
    OUT --> B["Bundled/Browser/<br/>workbench.js + workbench.css"]
    OUT --> A["Application/<br/>static assets"]
```

---

## Static Asset Layout 📦

After a successful build, `Sky`'s output is organized as:

```text
Sky/Target/
+-- Static/
    +-- Bundled/
    |   +-- {Variant}/
    |       +-- workbench.js          # Compiled workbench bundle
    |       +-- workbench.css         # Compiled workbench styles
    |       +-- chunks/               # Lazy-loaded code chunks
    +-- Application/                  # Dev mode static assets
        +-- index.html                # Compiled entry page
        +-- assets/                   # CSS, JS, fonts
        +-- worker.js                 # Service worker script
```

```mermaid
graph TB
    TARGET["Sky/Target/"] --> STATIC["Static/"]
    STATIC --> BUNDLED["Bundled/{Variant}/<br/>workbench.js<br/>workbench.css<br/>chunks/"]
    STATIC --> APP["Application/<br/>index.html<br/>assets/<br/>worker.js"]
```

---

## Shim Compatibility ⚙️

| Low-Level Shim | Coverage Shim |
| -------- | -------- |
| Tier: `TierShim=Own\|Preempt` | Tier: `TierShim=Proxy\|Replace` |
| Engine prototype hooks | Service routing + audit |

> This Element supports the `Land` deep-shim interception system. Gated behind
> `TierShim` env var (default: `None` - zero overhead).
>
> **`Sky` shim architecture:** No shim-specific modules - receives events from
> `Wind` via bridge.

```mermaid
graph LR
    TIER["TierShim env var<br/>default None"] --> OWN["Own|Preempt<br/>engine prototype hooks"]
    TIER --> PROXY["Proxy|Replace<br/>service routing + audit"]
    PROXY --> SKY["Sky<br/>no shim-specific modules"]
    SKY --> WIND["Wind<br/>events via bridge"]
```

---

## Related Documentation 📖

- [Wind](https://github.com/CodeEditorLand/Wind/tree/Current/Documentation/GitHub/Architecture.md) -
  Service layer (`Sky` consumes)
- [Cocoon](https://github.com/CodeEditorLand/Cocoon/tree/Current/Documentation/GitHub/Architecture.md) -
  Extension host (`SkyBridge` target)
- [Worker](https://github.com/CodeEditorLand/Worker/tree/Current/Documentation/GitHub/Architecture.md) -
  Service worker (`Sky` integrates)
- [Output](https://github.com/CodeEditorLand/Output/tree/Current/Documentation/GitHub/Architecture.md) -
  Compiled workbench source
- [Mountain](https://github.com/CodeEditorLand/Mountain/tree/Current/Documentation/GitHub/Architecture.md) -
  Backend (IPC source)
- [Polyfills](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Polyfills.md) -
  `SkyBridge` and preload shim details
- [BuildPipeline](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/BuildPipeline.md) -
  Build pipeline for workbench variants

---

**Project Maintainers:** Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Sky) |
[Report an Issue](https://github.com/CodeEditorLand/Sky/issues)
