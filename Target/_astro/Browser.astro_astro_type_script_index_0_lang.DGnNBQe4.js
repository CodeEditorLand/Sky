const INCREMENT$2 = "DEVELOPMENT-01KJJN7K3V6Z4XH5D124QD5Y2W";
const Log$1 = (..._Message) => {
  console.log(`[Load CSS ${INCREMENT$2}]`, ..._Message);
} ;
const ErrorLog$1 = (..._Message) => {
  console.error(`[Load CSS ${INCREMENT$2}]`, ..._Message);
} ;
window._LOAD_CSS_WORKER = (_CSS) => {
  Log$1(`Received request to load: ${_CSS}`);
  const CSS = _CSS + (_CSS.includes("?") ? "&" : "?") + "Skip=Intercept";
  try {
    if (document.querySelector(`link[href="${CSS}"]`)) {
      Log$1(`Stylesheet already loaded: ${CSS}`);
      return;
    }
    const Link = document.createElement("link");
    Link.rel = "stylesheet";
    Link.type = "text/css";
    Link.href = CSS;
    Link.onerror = (Event) => {
      ErrorLog$1(`Failed to load stylesheet: ${CSS}`, Event);
      Link.remove();
    };
    Link.onload = () => {
      Log$1(`Successfully loaded stylesheet: ${CSS}`);
    };
    document.head.appendChild(Link);
  } catch (_Error) {
    ErrorLog$1(`Error loading ${CSS}:`, _Error);
  }
};
Log$1("Initialized and _LOAD_CSS_WORKER attached to window.");

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const INCREMENT$1 = "DEVELOPMENT-01KJJN7K3V6Z4XH5D124QD5Y2W";
const Log = (..._Message) => {
  console.log(`[Policy ${INCREMENT$1}]`, ..._Message);
} ;
const ErrorLog = (..._Message) => {
  console.error(`[Policy ${INCREMENT$1}]`, ..._Message);
} ;
const WarnLog$1 = (..._Message) => {
  console.warn(`[Policy ${INCREMENT$1}]`, ..._Message);
} ;
(() => {
  window._POLICY_WORKER = window._POLICY_WORKER || {};
  if (!window.trustedTypes || !window.trustedTypes.createPolicy) {
    WarnLog$1(
      "Trusted Types API not supported or policy creation unavailable."
    );
    return;
  }
  if (!window._POLICY_WORKER.WorkerApplication) {
    try {
      window._POLICY_WORKER.WorkerApplication = window.trustedTypes.createPolicy(
        "WorkerApplication",
        {
          createScriptURL: /* @__PURE__ */ __name((Input) => {
            if (Input && /^\/[^\\:]+\.(js|mjs)(\?.*)?$/.test(Input)) {
              Log(
                `Policy 'WorkerApplication' validating URL: ${Input}`
              );
              return Input;
            }
            ErrorLog(
              `Policy 'WorkerApplication' rejected URL: ${Input}`
            );
            throw new TypeError(
              `Invalid URL format for service worker script: ${Input}`
            );
          }, "createScriptURL")
        }
      );
      Log(
        "Policy 'WorkerApplication' created and stored successfully."
      );
    } catch (_Error) {
      if (_Error instanceof TypeError && _Error.message.includes("already exists")) {
        WarnLog$1(
          "Policy 'WorkerApplication' already existed. Ensure Policy.js runs only once and before other scripts using it."
        );
      } else {
        ErrorLog(
          "Failed to create policy 'WorkerApplication':",
          _Error
        );
      }
    }
  } else {
    Log("Policy 'WorkerApplication' was already initialized.");
  }
})();

const INCREMENT = "DEVELOPMENT-01KJJN7K3V6Z4XH5D124QD5Y2W";
const WarnLog = (..._Message) => {
  console.warn(`[Register ${INCREMENT}]`, ..._Message);
} ;
if (!("serviceWorker" in navigator)) {
  WarnLog("Service Worker API not supported.");
}
//# sourceMappingURL=Browser.astro_astro_type_script_index_0_lang.DGnNBQe4.js.map
