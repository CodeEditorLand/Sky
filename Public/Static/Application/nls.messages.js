/**
 * NLS messages stub.
 *
 * VS Code's `vs/nls.js` runtime looks up localized strings by integer
 * index into `globalThis._VSCODE_NLS_MESSAGES`. Stock VS Code generates
 * a per-locale `nls.messages.js` that populates this array; Land's Sky
 * pipeline does not (it has no localisation step yet), so the file
 * never lands at `Sky/Target/Static/Application/nls.messages.js`. The
 * workbench bootstrap requests it anyway via a hard-coded path, the
 * server falls through to the SPA HTML, and the browser parses the
 * HTML response as JS - producing `SyntaxError: Unexpected token '<'`
 * at `nls.messages.js:1` on every cold load.
 *
 * This stub seeds an empty array so `vs/nls.js`'s `localize(key, fallback, …args)`
 * always falls through to the literal `fallback` string (the second
 * argument every workbench callsite already passes). The runtime
 * `_VSCODE_NLS_LANGUAGE` is left unset → matches stock VS Code's
 * default English path.
 *
 * Replace with a generated message table when Land grows a proper
 * localisation pipeline.
 */
globalThis._VSCODE_NLS_MESSAGES = globalThis._VSCODE_NLS_MESSAGES ?? [];
export {};
