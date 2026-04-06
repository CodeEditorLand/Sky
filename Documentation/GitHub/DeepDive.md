# Sky — Deep Dive

This document provides the technical foundation for the Sky UI component layer
within the Land ecosystem. **Sky** renders the complete editor interface inside
the Tauri webview using Astro, consuming state and services from the Wind
service layer.

---

## Architecture

Sky is organized into three tiers: page routes that define Tauri webview entry
points, workbench components that compose the VSCode-compatible editor layout,
and utility functions that support the build and runtime process.

```mermaid
graph TB
    subgraph "Sky — UI Component Layer"
        Pages["Pages\nindex / Browser / Electron / Mountain / Isolation"]
        Workbenches["Workbench Components\nBrowser / Mountain / Default / NLS"]
        WorkbenchImpl["Workbench Implementations\nBrowserProxy/ · Electron/"]
        Functions["Function/\nDebug · Shared · Meta · Markup/Base"]
    end

    subgraph "Wind — Service Layer"
        Preload["Preload.js — Environment Shim"]
        WindServices["Effect-TS Services"]
        TauriIntegrations["Tauri IPC Integrations"]
    end

    subgraph "Mountain — Rust Backend"
        TauriEvents["Tauri Event System"]
        MountainCore["Mountain Core"]
    end

    Pages --> Workbenches
    Pages --> WorkbenchImpl
    Workbenches --> Preload
    WorkbenchImpl --> Preload
    Workbenches --> WindServices
    WorkbenchImpl --> WindServices
    WindServices --> TauriIntegrations
    TauriIntegrations --> TauriEvents
    TauriEvents --> MountainCore
```

---

## Key Modules

| Path                                             | Description                                                                  |
| :----------------------------------------------- | :--------------------------------------------------------------------------- |
| `Source/pages/index.astro`                       | Default entry point; reads environment variables to select workbench variant |
| `Source/pages/Mountain.astro`                    | A2 workbench page — recommended production entry point                       |
| `Source/pages/Browser.astro`                     | A1 browser-only workbench page                                               |
| `Source/pages/BrowserProxy.astro`                | A1 browser workbench with services proxy                                     |
| `Source/pages/Electron.astro`                    | A3 workbench page with Electron polyfills                                    |
| `Source/pages/Isolation.astro`                   | Isolated mode page for extension sandboxing                                  |
| `Source/Workbench/Mountain.astro`                | A2 workbench component — loads VSCode UI with Mountain providers             |
| `Source/Workbench/Browser.astro`                 | A1 workbench component — pure browser workbench                              |
| `Source/Workbench/BrowserProxy/Layout.astro`     | A1 layout with service proxy bootstrapping                                   |
| `Source/Workbench/BrowserProxy/Bootstrap.ts`     | Initializes Effect-TS runtime and services for BrowserProxy                  |
| `Source/Workbench/BrowserProxy/ServicesProxy.ts` | Service proxy implementation                                                 |
| `Source/Workbench/Electron/Layout.astro`         | A3 layout with Electron polyfill injection                                   |
| `Source/Workbench/Electron/Polyfills.ts`         | Electron compatibility shims                                                 |
| `Source/Workbench/NLS.astro`                     | Natural language support component                                           |
| `Source/Function/Debug.ts`                       | Build-time debug utilities                                                   |
| `Source/Function/Shared.ts`                      | Shared runtime utilities                                                     |
| `Source/Function/Meta.astro`                     | HTML meta tag component                                                      |
| `Source/Function/Markup/Base.astro`              | Base HTML layout skeleton                                                    |
| `astro.config.ts`                                | Astro build configuration, alias resolution, Vite settings                   |

---

## Data Flow

The following sequence shows how a user action travels from the Sky UI through
Wind services to the Mountain backend and back.

```mermaid
sequenceDiagram
    participant User as User Interaction
    participant Sky as Sky Component
    participant Wind as Wind Service
    participant Tauri as Tauri IPC
    participant Mountain as Mountain Backend

    User->>Sky: Click / Keystroke
    Sky->>Wind: Call service method (e.g. DialogService)
    Wind->>Tauri: tauri invoke command
    Tauri->>Mountain: Rust command handler
    Mountain->>Tauri: Return result
    Tauri->>Wind: Resolve Effect
    Wind->>Sky: Updated state
    Sky->>User: Re-render component
```

**Startup sequence:**

1. Tauri loads the webview pointing at Sky's built output.
2. The page route reads environment variables and selects a workbench variant.
3. Wind's `Preload.ts` shims `window.vscode` globals before VSCode code runs.
4. Wind bootstraps the Effect-TS service layer and establishes Tauri IPC.
5. Sky components subscribe to Wind services for live state updates.
6. Sky listens for Tauri events from Mountain (`sky://terminal/data`,
   `sky://scm/update-group`, `sky://configuration/changed`) to update UI.

---

## Integration Points

| Connecting Element | Direction     | Mechanism          | Description                                                                  |
| :----------------- | :------------ | :----------------- | :--------------------------------------------------------------------------- |
| **Wind**           | Inbound       | Direct import      | Sky consumes Wind Effect-TS services for all business logic                  |
| **Mountain**       | Bidirectional | Tauri IPC + Events | Commands sent via Tauri invoke; updates received as Tauri events             |
| **Output**         | Inbound       | Static bundle      | VSCode core UI components loaded from `@codeeditorland/output`               |
| **Worker**         | Inbound       | Web Worker API     | Web workers for background processing imported from `@codeeditorland/worker` |

---

## Configuration

| Variable       | Default      | Description                                                   |
| :------------- | :----------- | :------------------------------------------------------------ |
| `Mountain`     | unset        | Set to `true` to load the A2 Mountain workbench (recommended) |
| `Electron`     | unset        | Set to `true` to load the A3 Electron workbench               |
| `BrowserProxy` | unset        | Set to `true` to load the A1 BrowserProxy workbench           |
| `Browser`      | unset        | Set to `true` to load the A1 Browser workbench                |
| `NODE_ENV`     | `production` | Controls source map generation and debug output               |

When no variant flag is set, `index.astro` loads `Workbench/Default.astro`. The
recommended deployment always sets `Mountain=true`.

**Astro configuration** (`astro.config.ts`) resolves Wind and other
`@codeeditorland/*` packages through Vite aliases, sets `Source/` as the content
root, and directs build output to `Target/`.
