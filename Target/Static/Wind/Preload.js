var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  emit as TauriEmit,
  listen as TauriListen,
  once as TauriOnce
} from "@tauri-apps/api/event";
import { invoke as TauriInvoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { URI } from "vs/base/common/uri.js";
const IpcRendererShim = {
  send: /* @__PURE__ */ __name((Channel, ...Args) => {
    if (Channel.startsWith("vscode:")) {
      TauriEmit(Channel, Args.length === 1 ? Args[0] : Args).catch(
        console.error
      );
    }
  }, "send"),
  invoke: /* @__PURE__ */ __name(async (Channel, ...Args) => {
    if (Channel.startsWith("vscode:")) {
      const Command = `vscode_ipc:${Channel.substring(7)}`;
      try {
        return await TauriInvoke(Command, { Args });
      } catch (error) {
        console.error(
          `[Preload] Error invoking command '${Command}':`,
          error
        );
        throw error;
      }
    }
    throw new Error(`[Preload] Unsupported IPC invoke channel: ${Channel}`);
  }, "invoke"),
  on: /* @__PURE__ */ __name((Channel, Listener) => {
    if (Channel.startsWith("vscode:")) {
      TauriListen(
        Channel,
        (Event) => Listener({}, Event.payload)
      ).catch(console.error);
    }
    return IpcRendererShim;
  }, "on"),
  once: /* @__PURE__ */ __name((Channel, Listener) => {
    if (Channel.startsWith("vscode:")) {
      TauriOnce(
        Channel,
        (Event) => Listener({}, Event.payload)
      ).catch(console.error);
    }
    return IpcRendererShim;
  }, "once"),
  removeListener: /* @__PURE__ */ __name((_Channel, _Listener) => {
    console.warn(
      `[Preload] ipcRenderer.removeListener for '${_Channel}' is a no-op in the Tauri shim.`
    );
    return IpcRendererShim;
  }, "removeListener")
};
(async () => {
  try {
    const ProcessShim = {
      platform: await TauriInvoke("process_get_platform"),
      arch: await TauriInvoke("process_get_arch"),
      type: "renderer",
      versions: {
        node: "18.18.2",
        // A representative Node.js version
        chrome: navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] ?? "unknown",
        electron: "0.0.0-tauri"
        // Explicitly signal we are not in Electron
      },
      env: await TauriInvoke("process_get_env"),
      pid: await TauriInvoke("process_get_pid"),
      cwd: /* @__PURE__ */ __name(() => ProcessShim.env.VSCODE_CWD || "/", "cwd"),
      on: /* @__PURE__ */ __name((_event, _callback) => ProcessShim, "on"),
      // Return self for chaining, as expected by some VS Code code
      getProcessMemoryInfo: /* @__PURE__ */ __name(async () => ({
        private: 0,
        residentSet: 0,
        shared: 0
      }), "getProcessMemoryInfo"),
      shellEnv: /* @__PURE__ */ __name(async () => await TauriInvoke("process_get_shell_env"), "shellEnv"),
      execPath: await TauriInvoke("process_get_exec_path")
    };
    const ResolveConfiguration = /* @__PURE__ */ __name(() => {
      const ConfigElement = document.getElementById(
        "vscode-workbench-web-configuration"
      );
      if (!ConfigElement)
        throw new Error(
          "Could not find workbench configuration element in index.html."
        );
      const ConfigData = JSON.parse(
        ConfigElement.dataset.settings ?? "{}"
      );
      const ReviveUris = /* @__PURE__ */ __name((data) => {
        if (!data || typeof data !== "object") return data;
        if (Array.isArray(data)) return data.map(ReviveUris);
        if (data.scheme && data.path) return URI.revive(data);
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            data[key] = ReviveUris(data[key]);
          }
        }
        return data;
      }, "ReviveUris");
      return ReviveUris(ConfigData);
    }, "ResolveConfiguration");
    const Globals = {
      process: ProcessShim,
      ipcRenderer: IpcRendererShim,
      webFrame: { setZoomLevel: /* @__PURE__ */ __name((level) => appWindow.setZoom(level), "setZoomLevel") },
      context: { resolveConfiguration: ResolveConfiguration },
      webUtils: { getPathForFile: /* @__PURE__ */ __name((file) => file.path, "getPathForFile") },
      // Simplified for web compatibility
      ipcMessagePort: {
        acquire: /* @__PURE__ */ __name(() => console.warn("ipcMessagePort.acquire is not implemented."), "acquire")
      }
    };
    window.vscode = Globals;
    console.log(
      "[Wind Preload] Successfully attached vscode shims to the window object."
    );
  } catch (error) {
    console.error(
      "[Wind Preload] FATAL: Failed to initialize preload script.",
      error
    );
    const ErrorDiv = document.createElement("div");
    ErrorDiv.textContent = `Preload Error: ${error instanceof Error ? error.message : String(error)}. Check developer console for details.`;
    ErrorDiv.setAttribute(
      "style",
      "color:red;padding:20px;font-family:sans-serif;white-space:pre-wrap;z-index:9999;position:fixed;top:0;left:0;width:100%;background:pink;border-bottom:2px solid darkred;"
    );
    document.addEventListener(
      "DOMContentLoaded",
      () => document.body.prepend(ErrorDiv)
    );
  }
})();
//# sourceMappingURL=Preload.js.map
