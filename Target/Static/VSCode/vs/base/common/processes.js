var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IProcessEnvironment, isLinux } from "./platform.js";
var Source = /* @__PURE__ */ ((Source2) => {
  Source2[Source2["stdout"] = 0] = "stdout";
  Source2[Source2["stderr"] = 1] = "stderr";
  return Source2;
})(Source || {});
var TerminateResponseCode = /* @__PURE__ */ ((TerminateResponseCode2) => {
  TerminateResponseCode2[TerminateResponseCode2["Success"] = 0] = "Success";
  TerminateResponseCode2[TerminateResponseCode2["Unknown"] = 1] = "Unknown";
  TerminateResponseCode2[TerminateResponseCode2["AccessDenied"] = 2] = "AccessDenied";
  TerminateResponseCode2[TerminateResponseCode2["ProcessNotFound"] = 3] = "ProcessNotFound";
  return TerminateResponseCode2;
})(TerminateResponseCode || {});
function sanitizeProcessEnvironment(env, ...preserve) {
  const set = preserve.reduce((set2, key) => {
    set2[key] = true;
    return set2;
  }, {});
  const keysToRemove = [
    /^ELECTRON_.+$/,
    /^VSCODE_(?!(PORTABLE|SHELL_LOGIN|ENV_REPLACE|ENV_APPEND|ENV_PREPEND)).+$/,
    /^SNAP(|_.*)$/,
    /^GDK_PIXBUF_.+$/
  ];
  const envKeys = Object.keys(env);
  envKeys.filter((key) => !set[key]).forEach((envKey) => {
    for (let i = 0; i < keysToRemove.length; i++) {
      if (envKey.search(keysToRemove[i]) !== -1) {
        delete env[envKey];
        break;
      }
    }
  });
}
__name(sanitizeProcessEnvironment, "sanitizeProcessEnvironment");
function removeDangerousEnvVariables(env) {
  if (!env) {
    return;
  }
  delete env["DEBUG"];
  if (isLinux) {
    delete env["LD_PRELOAD"];
  }
}
__name(removeDangerousEnvVariables, "removeDangerousEnvVariables");
export {
  Source,
  TerminateResponseCode,
  removeDangerousEnvVariables,
  sanitizeProcessEnvironment
};
//# sourceMappingURL=processes.js.map
