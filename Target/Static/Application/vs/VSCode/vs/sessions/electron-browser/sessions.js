var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(async function() {
  performance.mark("code/didStartRenderer");
  const preloadGlobals = window.vscode;
  const safeProcess = preloadGlobals.process;
  function showSplash(configuration2) {
    performance.mark("code/willShowPartsSplash");
    const baseTheme = "vs-dark";
    const shellBackground = "#191A1B";
    const shellForeground = "#CCCCCC";
    const style = document.createElement("style");
    style.className = "initialShellColors";
    window.document.head.appendChild(style);
    style.textContent = `body { background-color: ${shellBackground}; color: ${shellForeground}; margin: 0; padding: 0; }`;
    if (typeof configuration2.partsSplash?.zoomLevel === "number" && typeof preloadGlobals?.webFrame?.setZoomLevel === "function") {
      preloadGlobals.webFrame.setZoomLevel(configuration2.partsSplash.zoomLevel);
    }
    const splash = document.createElement("div");
    splash.id = "monaco-parts-splash";
    splash.className = baseTheme;
    window.document.body.appendChild(splash);
    performance.mark("code/didShowPartsSplash");
  }
  __name(showSplash, "showSplash");
  async function load(options) {
    const configuration2 = await resolveWindowConfiguration();
    options?.beforeImport?.(configuration2);
    const { enableDeveloperKeybindings, removeDeveloperKeybindingsAfterLoad, developerDeveloperKeybindingsDisposable, forceDisableShowDevtoolsOnError } = setupDeveloperKeybindings(configuration2, options);
    setupNLS(configuration2);
    const baseUrl = new URL(`${fileUriFromPath(configuration2.appRoot, { isWindows: safeProcess.platform === "win32", scheme: "vscode-file", fallbackAuthority: "vscode-app" })}/out/`);
    globalThis._VSCODE_FILE_ROOT = baseUrl.toString();
    setupCSSImportMaps(configuration2, baseUrl);
    try {
      let workbenchUrl;
      if (!!safeProcess.env["VSCODE_DEV"] && globalThis._VSCODE_USE_RELATIVE_IMPORTS) {
        workbenchUrl = "./sessions.desktop.main.js";
      } else {
        workbenchUrl = new URL(`vs/sessions/sessions.desktop.main.js`, baseUrl).href;
      }
      const result2 = await import(workbenchUrl);
      if (developerDeveloperKeybindingsDisposable && removeDeveloperKeybindingsAfterLoad) {
        developerDeveloperKeybindingsDisposable();
      }
      return { result: result2, configuration: configuration2 };
    } catch (error) {
      onUnexpectedError(error, enableDeveloperKeybindings && !forceDisableShowDevtoolsOnError);
      throw error;
    }
  }
  __name(load, "load");
  async function resolveWindowConfiguration() {
    const timeout = setTimeout(() => {
      console.error(`[resolve window config] Could not resolve window configuration within 10 seconds, but will continue to wait...`);
    }, 1e4);
    performance.mark("code/willWaitForWindowConfig");
    const configuration2 = await preloadGlobals.context.resolveConfiguration();
    performance.mark("code/didWaitForWindowConfig");
    clearTimeout(timeout);
    return configuration2;
  }
  __name(resolveWindowConfiguration, "resolveWindowConfiguration");
  function setupDeveloperKeybindings(configuration2, options) {
    const { forceEnableDeveloperKeybindings, disallowReloadKeybinding, removeDeveloperKeybindingsAfterLoad, forceDisableShowDevtoolsOnError } = typeof options?.configureDeveloperSettings === "function" ? options.configureDeveloperSettings(configuration2) : {
      forceEnableDeveloperKeybindings: false,
      disallowReloadKeybinding: false,
      removeDeveloperKeybindingsAfterLoad: false,
      forceDisableShowDevtoolsOnError: false
    };
    const isDev = !!safeProcess.env["VSCODE_DEV"];
    const enableDeveloperKeybindings = Boolean(isDev || forceEnableDeveloperKeybindings);
    let developerDeveloperKeybindingsDisposable = void 0;
    if (enableDeveloperKeybindings) {
      developerDeveloperKeybindingsDisposable = registerDeveloperKeybindings(disallowReloadKeybinding);
    }
    return {
      enableDeveloperKeybindings,
      removeDeveloperKeybindingsAfterLoad,
      developerDeveloperKeybindingsDisposable,
      forceDisableShowDevtoolsOnError
    };
  }
  __name(setupDeveloperKeybindings, "setupDeveloperKeybindings");
  function registerDeveloperKeybindings(disallowReloadKeybinding) {
    const ipcRenderer = preloadGlobals.ipcRenderer;
    const extractKey = /* @__PURE__ */ __name(function(e) {
      return [
        e.ctrlKey ? "ctrl-" : "",
        e.metaKey ? "meta-" : "",
        e.altKey ? "alt-" : "",
        e.shiftKey ? "shift-" : "",
        e.keyCode
      ].join("");
    }, "extractKey");
    const TOGGLE_DEV_TOOLS_KB = safeProcess.platform === "darwin" ? "meta-alt-73" : "ctrl-shift-73";
    const TOGGLE_DEV_TOOLS_KB_ALT = "123";
    const RELOAD_KB = safeProcess.platform === "darwin" ? "meta-82" : "ctrl-82";
    let listener = /* @__PURE__ */ __name(function(e) {
      const key = extractKey(e);
      if (key === TOGGLE_DEV_TOOLS_KB || key === TOGGLE_DEV_TOOLS_KB_ALT) {
        ipcRenderer.send("vscode:toggleDevTools");
      } else if (key === RELOAD_KB && !disallowReloadKeybinding) {
        ipcRenderer.send("vscode:reloadWindow");
      }
    }, "listener");
    window.addEventListener("keydown", listener);
    return function() {
      if (listener) {
        window.removeEventListener("keydown", listener);
        listener = void 0;
      }
    };
  }
  __name(registerDeveloperKeybindings, "registerDeveloperKeybindings");
  function setupNLS(configuration2) {
    globalThis._VSCODE_NLS_MESSAGES = configuration2.nls.messages;
    globalThis._VSCODE_NLS_LANGUAGE = configuration2.nls.language;
    let language = configuration2.nls.language || "en";
    if (language === "zh-tw") {
      language = "zh-Hant";
    } else if (language === "zh-cn") {
      language = "zh-Hans";
    }
    window.document.documentElement.setAttribute("lang", language);
  }
  __name(setupNLS, "setupNLS");
  function onUnexpectedError(error, showDevtoolsOnError) {
    if (showDevtoolsOnError) {
      const ipcRenderer = preloadGlobals.ipcRenderer;
      ipcRenderer.send("vscode:openDevTools");
    }
    console.error(`[uncaught exception]: ${error}`);
    if (error && typeof error !== "string" && error.stack) {
      console.error(error.stack);
    }
  }
  __name(onUnexpectedError, "onUnexpectedError");
  function fileUriFromPath(path, config) {
    let pathName = path.replace(/\\/g, "/");
    if (pathName.length > 0 && pathName.charAt(0) !== "/") {
      pathName = `/${pathName}`;
    }
    let uri;
    if (config.isWindows && pathName.startsWith("//")) {
      uri = encodeURI(`${config.scheme || "file"}:${pathName}`);
    } else {
      uri = encodeURI(`${config.scheme || "file"}://${config.fallbackAuthority || ""}${pathName}`);
    }
    return uri.replace(/#/g, "%23");
  }
  __name(fileUriFromPath, "fileUriFromPath");
  function setupCSSImportMaps(configuration2, baseUrl) {
    if (globalThis._VSCODE_DISABLE_CSS_IMPORT_MAP) {
      return;
    }
    if (Array.isArray(configuration2.cssModules) && configuration2.cssModules.length > 0) {
      performance.mark("code/willAddCssLoader");
      globalThis._VSCODE_CSS_LOAD = function(url) {
        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);
        window.document.head.appendChild(link);
      };
      const importMap = { imports: {} };
      for (const cssModule of configuration2.cssModules) {
        const cssUrl = new URL(cssModule, baseUrl).href;
        const jsSrc = `globalThis._VSCODE_CSS_LOAD('${cssUrl}');
`;
        const blob = new Blob([jsSrc], { type: "application/javascript" });
        importMap.imports[cssUrl] = URL.createObjectURL(blob);
      }
      const ttp = window.trustedTypes?.createPolicy("vscode-bootstrapImportMap", { createScript(value) {
        return value;
      } });
      const importMapSrc = JSON.stringify(importMap, void 0, 2);
      const importMapScript = document.createElement("script");
      importMapScript.type = "importmap";
      importMapScript.setAttribute("nonce", "0c6a828f1297");
      importMapScript.textContent = ttp?.createScript(importMapSrc) ?? importMapSrc;
      window.document.head.appendChild(importMapScript);
      performance.mark("code/didAddCssLoader");
    }
  }
  __name(setupCSSImportMaps, "setupCSSImportMaps");
  const { result, configuration } = await load({
    configureDeveloperSettings: /* @__PURE__ */ __name(function(windowConfig) {
      return {
        // disable automated devtools opening on error when running extension tests
        // as this can lead to nondeterministic test execution (devtools steals focus)
        forceDisableShowDevtoolsOnError: typeof windowConfig.extensionTestsPath === "string" || windowConfig["enable-smoke-test-driver"] === true,
        // enable devtools keybindings in extension development window
        forceEnableDeveloperKeybindings: Array.isArray(windowConfig.extensionDevelopmentPath) && windowConfig.extensionDevelopmentPath.length > 0,
        removeDeveloperKeybindingsAfterLoad: true
      };
    }, "configureDeveloperSettings"),
    beforeImport: /* @__PURE__ */ __name(function(windowConfig) {
      showSplash(windowConfig);
      Object.defineProperty(window, "vscodeWindowId", {
        get: /* @__PURE__ */ __name(() => windowConfig.windowId, "get")
      });
      window.requestIdleCallback(() => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, canvas.width, canvas.height);
        canvas.remove();
      }, { timeout: 50 });
      performance.mark("code/willLoadWorkbenchMain");
    }, "beforeImport")
  });
  performance.mark("code/didLoadWorkbenchMain");
  result.main(configuration);
})();
//# sourceMappingURL=sessions.js.map
