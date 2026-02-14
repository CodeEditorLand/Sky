var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function invokeTauri(command, args = {}) {
  try {
    const tauri = window.__TAURI__ ?? window.TAURI;
    if (typeof tauri?.invoke === "function") {
      return await tauri.invoke(command, args);
    }
    throw new Error(`Tauri invoke not available for command: ${command}`);
  } catch (error) {
    console.error(`[NativeModulePolyfill] Tauri invoke failed for ${command}:`, error);
    throw error;
  }
}
__name(invokeTauri, "invokeTauri");
const MODULE_CACHE = /* @__PURE__ */ new Map();
function getCachedModule(key, factory) {
  if (MODULE_CACHE.has(key)) {
    return MODULE_CACHE.get(key);
  }
  const module = factory();
  MODULE_CACHE.set(key, module);
  return module;
}
__name(getCachedModule, "getCachedModule");
function createWebFrame() {
  return {
    setZoomLevel(level) {
      console.log(`[NativeModulePolyfill] WebFrame.setZoomLevel(${level})`);
    },
    setZoomFactor(factor) {
      console.log(`[NativeModulePolyfill] WebFrame.setZoomFactor(${factor})`);
    },
    getZoomFactor() {
      return 1;
    },
    getZoomLevel() {
      return 0;
    },
    insertCSS(css) {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    },
    insertText(text) {
      document.execCommand("insertText", false, text);
    }
  };
}
__name(createWebFrame, "createWebFrame");
function createApp() {
  return {
    getName() {
      return "CodeEditorLand";
    },
    getVersion() {
      return "0.0.1";
    },
    getLocale() {
      return navigator.language;
    },
    isReady() {
      return true;
    },
    whenReady() {
      return Promise.resolve();
    }
  };
}
__name(createApp, "createApp");
function createScreen() {
  return {
    getDisplayNearestPoint(point) {
      return {
        id: 1,
        bounds: {
          x: 0,
          y: 0,
          width: window.screen.width,
          height: window.screen.height
        }
      };
    },
    getPrimaryDisplay() {
      return {
        id: 1,
        bounds: {
          x: window.screen.availLeft,
          y: window.screen.availTop,
          width: window.screen.width,
          height: window.screen.height
        }
      };
    },
    getAllDisplays() {
      return [
        {
          id: 1,
          bounds: {
            x: window.screen.availLeft,
            y: window.screen.availTop,
            width: window.screen.width,
            height: window.screen.height
          }
        }
      ];
    }
  };
}
__name(createScreen, "createScreen");
function createShell() {
  return {
    async openExternal(url) {
      try {
        const shell = window.__TAURI__?.shell ?? window.TAURI?.shell;
        if (typeof shell?.open === "function") {
          await shell.open(url);
        } else {
          window.open(url, "_blank");
        }
      } catch (error) {
        console.error("[NativeModulePolyfill] Shell.openExternal error:", error);
        throw error;
      }
    },
    async openPath(path) {
      throw new Error("Shell.openPath is not supported in browser environment");
    },
    async showItemInFolder(path) {
      throw new Error("Shell.showItemInFolder is not supported in browser environment");
    },
    async trashItem(path) {
      await invokeTauri("file:delete", { path });
    },
    beep() {
      if (typeof AudioContext !== "undefined") {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    }
  };
}
__name(createShell, "createShell");
function createDialog() {
  return {
    async showOpenDialog(options) {
      try {
        const dialog = window.__TAURI__?.dialog ?? window.TAURI?.dialog;
        if (typeof dialog?.open === "function") {
          const selected = await dialog.open(options);
          return {
            filePaths: Array.isArray(selected) ? selected : selected ? [selected] : [],
            canceled: !selected
          };
        }
      } catch (error) {
        console.error("[NativeModulePolyfill] Dialog.showOpenDialog error:", error);
      }
      return { filePaths: [], canceled: true };
    },
    async showSaveDialog(options) {
      try {
        const dialog = window.__TAURI__?.dialog ?? window.TAURI?.dialog;
        if (typeof dialog?.save === "function") {
          const filePath = await dialog.save(options);
          return {
            filePath: filePath ?? void 0,
            canceled: !filePath
          };
        }
      } catch (error) {
        console.error("[NativeModulePolyfill] Dialog.showSaveDialog error:", error);
      }
      return { filePath: void 0, canceled: true };
    },
    showMessage(message) {
      console.log(`[NativeModulePolyfill] Dialog.showMessage: ${message}`);
      if (window.__TAURI__?.dialog?.message) {
        window.__TAURI__.dialog.message(message);
      } else {
        console.info(message);
      }
    },
    showError(message) {
      console.error(`[NativeModulePolyfill] Dialog.showError: ${message}`);
      if (window.__TAURI__?.dialog?.message) {
        window.__TAURI__.dialog.message("Error: " + message);
      } else {
        console.error(message);
      }
    }
  };
}
__name(createDialog, "createDialog");
function createClipboard() {
  return {
    async writeText(text) {
      try {
        const clipboard = window.__TAURI__?.clipboard ?? window.TAURI?.clipboard;
        if (typeof clipboard?.writeText === "function") {
          await clipboard.writeText(text);
        } else {
          await navigator.clipboard.writeText(text);
        }
      } catch (error) {
        console.error("[NativeModulePolyfill] Clipboard.writeText error:", error);
        throw error;
      }
    },
    async readText() {
      try {
        const clipboard = window.__TAURI__?.clipboard ?? window.TAURI?.clipboard;
        if (typeof clipboard?.readText === "function") {
          return await clipboard.readText();
        }
      } catch (error) {
        console.warn("[NativeModulePolyfill] Tauri clipboard not available, using browser clipboard");
      }
      return await navigator.clipboard.readText();
    },
    async writeBuffer(format, buffer) {
      console.warn("[NativeModulePolyfill] Clipboard.writeBuffer not fully supported");
      throw new Error("Clipboard.writeBuffer is not fully supported");
    },
    async readBuffer(format) {
      console.warn("[NativeModulePolyfill] Clipboard.readBuffer not fully supported");
      return void 0;
    },
    clear() {
      console.warn("[NativeModulePolyfill] Clipboard.clear not fully supported");
    }
  };
}
__name(createClipboard, "createClipboard");
function createNativeTheme() {
  return {
    get shouldUseDarkColors() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    },
    get shouldUseInvertedColorScheme() {
      return false;
    },
    get theme() {
      const tauri = window.__TAURI__ ?? window.TAURI;
      if (tauri?.window?.appWindow?.theme) {
        return tauri.window.appWindow.theme;
      }
      return "system";
    }
  };
}
__name(createNativeTheme, "createNativeTheme");
function createBrowserWindow() {
  return {
    id: 1,
    isFocused() {
      return document.hasFocus();
    },
    focus() {
      window.focus();
    },
    show() {
    },
    hide() {
    },
    close() {
      window.close();
    },
    isMaximizable() {
      return true;
    },
    isMinimizable() {
      return true;
    },
    getBounds() {
      return {
        x: window.screenX,
        y: window.screenY,
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  };
}
__name(createBrowserWindow, "createBrowserWindow");
function createElectronModule() {
  return {
    ipcRenderer: getCachedModule("ipcRenderer", () => {
      const shim = window.__IPC_RENDERER__;
      if (shim) {
        return shim;
      }
      return {
        send: /* @__PURE__ */ __name(() => {
        }, "send"),
        invoke: /* @__PURE__ */ __name(async () => ({}), "invoke"),
        on: /* @__PURE__ */ __name(() => ({}), "on"),
        once: /* @__PURE__ */ __name(() => ({}), "once"),
        removeListener: /* @__PURE__ */ __name(() => ({}), "removeListener"),
        removeAllListeners: /* @__PURE__ */ __name(() => ({}), "removeAllListeners")
      };
    }),
    webFrame: getCachedModule("webFrame", createWebFrame),
    app: getCachedModule("app", createApp),
    screen: getCachedModule("screen", createScreen),
    shell: getCachedModule("shell", createShell),
    dialog: getCachedModule("dialog", createDialog),
    clipboard: getCachedModule("clipboard", createClipboard),
    nativeTheme: getCachedModule("nativeTheme", createNativeTheme),
    BrowserWindow: createBrowserWindow()
  };
}
__name(createElectronModule, "createElectronModule");
function installRequireShim() {
  if (typeof window === "undefined" || typeof require !== "function") {
    return;
  }
  const originalRequire = window.require;
  window.require = function(id) {
    console.log(`[NativeModulePolyfill] require('${id}') called`);
    if (id === "electron") {
      return createElectronModule();
    }
    if (id.startsWith("electron/")) {
      const moduleName = id.replace("electron/", "");
      const electronModule = createElectronModule();
      switch (moduleName) {
        case "ipcRenderer":
          return electronModule.ipcRenderer;
        case "webFrame":
          return electronModule.webFrame;
        case "app":
          return electronModule.app;
        case "screen":
          return electronModule.screen;
        case "shell":
          return electronModule.shell;
        case "dialog":
          return electronModule.dialog;
        case "clipboard":
          return electronModule.clipboard;
        case "nativeTheme":
          return electronModule.nativeTheme;
        case "browserWindow":
        case "BrowserWindow":
          return electronModule.BrowserWindow;
        case "remote":
          throw new Error("electron.remote is not supported in Tauri environment");
        default:
          console.warn(`[NativeModulePolyfill] Unknown electron module: ${moduleName}`);
          return {};
      }
    }
    return originalRequire(id);
  };
  Object.keys(originalRequire).forEach((key) => {
    Object.defineProperty(window.require, key, {
      ...Object.getOwnPropertyDescriptor(originalRequire, key)
    });
  });
  console.log("[NativeModulePolyfill] \u2713 Require shim installed");
}
__name(installRequireShim, "installRequireShim");
window.__electron_require__ = (id) => {
  if (id === "electron") {
    return createElectronModule();
  }
  if (id.startsWith("electron/")) {
    const moduleName = id.replace("electron/", "");
    const electronModule = createElectronModule();
    switch (moduleName) {
      case "ipcRenderer":
        return electronModule.ipcRenderer;
      case "webFrame":
        return electronModule.webFrame;
      case "app":
        return electronModule.app;
      case "screen":
        return electronModule.screen;
      case "shell":
        return electronModule.shell;
      case "dialog":
        return electronModule.dialog;
      case "clipboard":
        return electronModule.clipboard;
      case "nativeTheme":
        return electronModule.nativeTheme;
      case "BrowserWindow":
        return electronModule.BrowserWindow;
      default:
        return {};
    }
  }
  return void 0;
};
function installNativeModulePolyfill() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__NATIVE_MODULE_POLYFILL_INSTALLED__) {
    console.log("[NativeModulePolyfill] Already installed, skipping");
    return;
  }
  window.__NATIVE_MODULE_POLYFILL_INSTALLED__ = true;
  console.log("[NativeModulePolyfill] Installing Electron native module polyfill...");
  installRequireShim();
  const electronModule = createElectronModule();
  window.electron = electronModule;
  if (typeof window.vscode !== "undefined") {
    window.vscode.electron = electronModule;
  }
  console.log("[NativeModulePolyfill] \u2713 Electron native module polyfill installed");
}
__name(installNativeModulePolyfill, "installNativeModulePolyfill");
var NativeModulePolyfill_default = {
  install: installNativeModulePolyfill,
  // Individual modules
  createElectronModule,
  createWebFrame,
  createApp,
  createScreen,
  createShell,
  createDialog,
  createClipboard,
  createNativeTheme,
  createBrowserWindow
};
if (typeof window !== "undefined") {
  installNativeModulePolyfill();
}
export {
  NativeModulePolyfill_default as default,
  installNativeModulePolyfill
};
//# sourceMappingURL=NativeModulePolyfill.js.map
