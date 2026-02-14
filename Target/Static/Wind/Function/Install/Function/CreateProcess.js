var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function CreateProcess(Configuration) {
  return {
    platform: "web",
    arch: "web",
    type: "renderer",
    execPath: "/",
    env: Configuration.userEnv ?? {},
    cwd: /* @__PURE__ */ __name(() => "/", "cwd"),
    versions: {
      node: "20.0.0",
      chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "0",
      electron: "0.0.0"
    },
    on: /* @__PURE__ */ __name((_Type, _Callback) => {
    }, "on"),
    getProcessMemoryInfo: /* @__PURE__ */ __name(async () => ({
      private: 0,
      residentSet: 0,
      shared: 0
    }), "getProcessMemoryInfo"),
    shellEnv: /* @__PURE__ */ __name(async () => ({}), "shellEnv")
  };
}
__name(CreateProcess, "CreateProcess");
export {
  CreateProcess
};
//# sourceMappingURL=CreateProcess.js.map
