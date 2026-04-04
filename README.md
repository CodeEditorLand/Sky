<table>
<tr>
<td align="left" valign="middle">
<h3 align="left"> Sky</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
  🌌
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left"> + </h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
<a href="https://Editor.Land" target="_blank">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://PlayForm.Cloud/Dark/Image/GitHub/Land.svg">
<source media="(prefers-color-scheme: light)" srcset="https://PlayForm.Cloud/Image/GitHub/Land.svg">
<img width="28" alt="Land Logo" src="https://PlayForm.Cloud/Image/GitHub/Land.svg">
</picture>
</a>
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
<a href="https://Editor.Land" target="_blank">
Land
</a>
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
 🏞️
</h3>
</td>
</tr>
</table>


---

# **Sky**&#x2001;🌌

> **VS Code's UI is tightly coupled to Electron's renderer process. Changing a panel requires understanding the full Chromium lifecycle. Hot-reload means restarting the entire renderer.**

_"Every panel is a component. Instant hot-reload."_

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Land/tree/Current/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@codeeditorland/sky.svg)](https://www.npmjs.com/package/@codeeditorland/sky)
[<img src="https://editor.land/Image/Astro.svg" width="14" alt="Astro" />](https://astro.build/)&#x2001;[![Astro Version](https://img.shields.io/badge/Astro-5.17.3-blue.svg)](https://www.npmjs.com/package/astro)
[<img src="https://editor.land/Image/EffectTS.svg" width="14" alt="Effect-TS" />](https://effect.website/)&#x2001;[![Effect Version](https://img.shields.io/badge/Effect-3.x-blueviolet.svg)](https://www.npmjs.com/package/effect)

Sky provides three workbench layouts (full desktop, embedded, minimal) built from Astro components. Tauri reloads Sky instantly on any component change. High-fidelity VS Code UI compatibility with a significantly smaller footprint. No Electron renderer magic. Web components rendered by the OS's own WebView.

---

## What It Does&#x2001;🔐

- **Three workbench layouts.** Full desktop, embedded, and minimal deployments from the same component set.
- **Instant hot-reload.** Tauri reloads Sky immediately on any component change during development.
- **VS Code UI compatibility.** Panels, sidebars, tab bars, and status bars match the VS Code UX.
- **OS-native rendering.** Components rendered by WKWebView/WebView2/WebKitGTK, not bundled Chromium.

---

## In the Ecosystem&#x2001;🌌 + 🏞️

```mermaid
graph LR
classDef sky fill:#9cf,stroke:#333,stroke-width:2px;
classDef wind fill:#ffc,stroke:#333,stroke-width:2px;
classDef tauri fill:#f9d,stroke:#333,stroke-width:2px;
classDef mountain fill:#f9f,stroke:#333,stroke-width:2px;
classDef external fill:#ddd,stroke:#666,stroke-dasharray: 5 5;

subgraph "Sky 🌌 (UI Component Layer - Tauri Webview)"
Pages["Pages (index, Browser, Electron, Mountain, Isolation)"]:::sky
Workbenches["Workbench Components (Browser, Mountain, Default, NLS)"]:::sky
WorkbenchImpl["Workbench Implementations (BrowserProxy/, Electron/)"]:::sky
end

subgraph "Wind 🍃 (Service Layer - Tauri Webview)"
PreloadJS["Preload.js (Environment Shim)"]:::wind
WindServices[Wind Effect-TS Services]:::wind
TauriIntegrations[Wind/Tauri Integrations]:::wind
end

subgraph "Tauri Shell & Mountain 🌌 (Rust Backend)"
TauriWindow[Tauri Window API]:::tauri
TauriEvents[Tauri Event System]:::tauri
MountainCore[Mountain Rust Core]:::mountain
end

subgraph "External"
VSCodeComponents[VSCode Core UI Components from Output]:::external
end

Pages --> Workbenches
Pages --> WorkbenchImpl
Workbenches --> PreloadJS
WorkbenchImpl --> PreloadJS
Workbenches -- Consumes services from --> WindServices
WorkbenchImpl -- Consumes services from --> WindServices
WindServices -- Uses --> TauriIntegrations
TauriIntegrations -- Calls --> TauriWindow
TauriIntegrations -- Listens to --> TauriEvents
TauriWindow -- IPC --> MountainCore
TauriEvents -- Emits from --> MountainCore
Workbenches -- Loads --> VSCodeComponents
WorkbenchImpl -- Loads --> VSCodeComponents
```

---

## Project Structure&#x2001;🗺️

```
Sky/
├── Source/
│   ├── pages/ # Page routes
│   │   ├── index.astro # Home page (default workbench entry)
│   │   ├── Browser.astro # A1: Browser workbench page
│   │   ├── BrowserProxy.astro # A1: Browser + services proxy page
│   │   ├── Electron.astro # A3: Electron + polyfills page
│   │   ├── Isolation.astro # Isolated mode page
│   │   └── Mountain.astro # A2: Mountain providers page (RECOMMENDED)
│   ├── Workbench/ # Workbench component implementations
│   │   ├── Default.astro # Deprecated entry point
│   │   ├── Browser.astro # Browser workbench component
│   │   ├── BrowserTest.astro # Test workbench component
│   │   ├── Mountain.astro # A2: Mountain workbench component (RECOMMENDED)
│   │   ├── NLS.astro # Natural Language Support component
│   │   ├── BrowserProxy/ # A1: Browser Proxy implementation
│   │   │   ├── Bootstrap.ts
│   │   │   ├── Layout.astro
│   │   │   ├── ServicesProxy.ts
│   │   │   ├── WindPreload.ts
│   │   │   └── Workbench.ts
│   │   └── Electron/ # A3: Electron implementation
│   │       ├── Bootstrap.ts
│   │       ├── Layout.astro
│   │       ├── Polyfills.ts
│   │       ├── WindPreload.ts
│   │       └── Workbench.ts
│   ├── Function/ # Utility functions and base components
│   │   ├── Debug.ts # Build-time debug utilities
│   │   ├── Shared.ts # Shared utilities
│   │   ├── Meta.astro # Meta component
│   │   └── Markup/
│   │       └── Base.astro # Base markup layout
│   └── env.d.ts # TypeScript definitions
├── Public/ # Static assets served directly
│   ├── Manifest.json
│   ├── robots.txt
│   └── Favicon/
├── Target/ # Build output directory
├── .env.example # Environment variables template
├── astro.config.ts # Astro configuration
├── package.json
└── tsconfig.json # TypeScript configuration
```

---

## Development&#x2001;🛠️

Sky is a component of the Land workspace. Follow the
[Land Repository](https://github.com/CodeEditorLand/Land) instructions to
build and run.

---

## License&#x2001;⚖️

CC0 1.0 Universal. Public domain. No restrictions.
[LICENSE](https://github.com/CodeEditorLand/Sky/tree/Current/LICENSE)

---

## See Also

- [Sky Documentation](https://editor.land/Doc/sky)
- [Architecture Overview](https://editor.land/Doc/architecture)
- [Why Tauri](https://editor.land/Doc/why-tauri)
- [Wind](https://github.com/CodeEditorLand/Wind)
- [Mountain](https://github.com/CodeEditorLand/Mountain)


## Funding & Acknowledgements 🙏🏻

**Sky** is a core element of the **Land** ecosystem. This project is funded
through [NGI0 Commons Fund](https://NLnet.NL/commonsfund), a fund established by
[NLnet](https://NLnet.NL) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu) program. Learn more at the
[NLnet project page](https://NLnet.NL/project/Land).

The project is operated by PlayForm, based in Sofia, Bulgaria.

PlayForm acts as the open-source steward for Code Editor Land under the NGI0
Commons Fund grant.

<table>
<thead>
<tr>
<th align="left"><strong>Land</strong></th>
<th align="left"><strong>PlayForm</strong></th>
<th align="left"><strong>NLnet</strong></th>
<th align="left"><strong>NGI0 Commons Fund</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td align="left" valign="middle">
<a href="https://Editor.Land">
<img width="60" src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" alt="Land">
</a>
</td>
<td align="left" valign="middle">
<a href="https://PlayForm.Cloud">
<img width="76" src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" alt="PlayForm">
</a>
</td>
<td align="left" valign="middle">
<a href="https://NLnet.NL">
<img width="240" src="https://NLnet.NL/logo/banner.svg" alt="NLnet">
</a>
</td>
<td align="left" valign="middle">
<a href="https://NLnet.NL/commonsfund">
<img width="240" src="https://NLnet.NL/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund">
</a>
</td>
</tr>
</tbody>
</table>

---

**Project Maintainers**: Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Sky) |
[Report an Issue](https://github.com/CodeEditorLand/Sky/issues) |
[Security Policy](https://github.com/CodeEditorLand/Sky/security/policy)
