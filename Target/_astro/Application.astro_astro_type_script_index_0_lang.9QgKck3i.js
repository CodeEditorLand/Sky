const INCREMENT$2 = "DEVELOPMENT-01JYEAQ95ZX7QDPAYPE09SVJ5Q";
const Log$2 = (..._Message) => {
  console.log(`[Load CSS ${INCREMENT$2}]`, ..._Message);
} ;
const ErrorLog$2 = (..._Message) => {
  console.error(`[Load CSS ${INCREMENT$2}]`, ..._Message);
} ;
window._LOAD_CSS_WORKER = (_CSS) => {
  Log$2(`Received request to load: ${_CSS}`);
  const CSS = _CSS + (_CSS.includes("?") ? "&" : "?") + "Skip=Intercept";
  try {
    if (document.querySelector(`link[href="${CSS}"]`)) {
      Log$2(`Stylesheet already loaded: ${CSS}`);
      return;
    }
    const Link = document.createElement("link");
    Link.rel = "stylesheet";
    Link.type = "text/css";
    Link.href = CSS;
    Link.onerror = (Event) => {
      ErrorLog$2(`Failed to load stylesheet: ${CSS}`, Event);
      Link.remove();
    };
    Link.onload = () => {
      Log$2(`Successfully loaded stylesheet: ${CSS}`);
    };
    document.head.appendChild(Link);
  } catch (_Error) {
    ErrorLog$2(`Error loading ${CSS}:`, _Error);
  }
};
Log$2("Initialized and _LOAD_CSS_WORKER attached to window.");

var __defProp$1 = Object.defineProperty;
var __name$1 = (target, value) => __defProp$1(target, "name", { value, configurable: true });
const INCREMENT$1 = "DEVELOPMENT-01JYEAQ95ZX7QDPAYPE09SVJ5Q";
const Log$1 = (..._Message) => {
  console.log(`[Policy ${INCREMENT$1}]`, ..._Message);
} ;
const ErrorLog$1 = (..._Message) => {
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
          createScriptURL: /* @__PURE__ */ __name$1((Input) => {
            if (Input && /^\/[^/\\:]+\.js(\?.*)?$/.test(Input)) {
              Log$1(
                `Policy 'WorkerApplication' validating URL: ${Input}`
              );
              return Input;
            }
            ErrorLog$1(
              `Policy 'WorkerApplication' rejected URL: ${Input}`
            );
            throw new TypeError(
              `Invalid URL format for service worker script: ${Input}`
            );
          }, "createScriptURL")
        }
      );
      Log$1(
        "Policy 'WorkerApplication' created and stored successfully."
      );
    } catch (_Error) {
      if (_Error instanceof TypeError && _Error.message.includes("already exists")) {
        WarnLog$1(
          "Policy 'WorkerApplication' already existed. Ensure Policy.js runs only once and before other scripts using it."
        );
      } else {
        ErrorLog$1(
          "Failed to create policy 'WorkerApplication':",
          _Error
        );
      }
    }
  } else {
    Log$1("Policy 'WorkerApplication' was already initialized.");
  }
})();

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const INCREMENT = "DEVELOPMENT-01JYEAQ95ZX7QDPAYPE09SVJ5Q";
const Path = typeof window._WORKER === "string" ? window._WORKER : "/Worker.js";
const Scope = "/Application";
const Reload = "WorkerReload";
const Log = (..._Message) => {
  console.log(`[Register ${INCREMENT}]`, ..._Message);
} ;
const ErrorLog = (..._Message) => {
  console.error(`[Register ${INCREMENT}]`, ..._Message);
} ;
const WarnLog = (..._Message) => {
  console.warn(`[Register ${INCREMENT}]`, ..._Message);
} ;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    Log("Controller changed event fired!");
    if (sessionStorage.getItem(Reload) === "true") {
      Log("Reload flag is set, reloading page now...");
      sessionStorage.removeItem(Reload);
      window.location.reload();
    } else {
      Log("Controller changed, but no reload needed.");
    }
  });
  navigator.serviceWorker.addEventListener("message", (Event) => {
    Log("[Client] Received message from SW:", Event.data);
    if (Event.data?.Version === "New") {
      WarnLog("New version available! Reloading page...");
      window.location.reload();
    }
  });
  const Control = /* @__PURE__ */ __name(async () => {
    const InitiallyControlled = !!navigator.serviceWorker.controller;
    Log(`Page controlled on script start: ${InitiallyControlled}`);
    try {
      Log(
        `Attempting to register Service Worker: ${Path} with scope: ${Scope}`
      );
      let URL;
      if (window.trustedTypes) {
        Log("TrustedTypes available. Attempting to use policy...");
        try {
          const Policy = window._POLICY_WORKER?.WorkerApplication;
          Log("Retrieved Policy:", Policy);
          if (!Policy) {
            ErrorLog(
              "Policy 'WorkerApplication' object NOT found in global namespace!"
            );
            throw new Error(
              "Required Trusted Types policy 'WorkerApplication' not found. Ensure Policy.js executes first and succeeds."
            );
          }
          URL = Policy.createScriptURL(Path);
          Log(
            `Used existing policy 'WorkerApplication' to create TrustedScriptURL for: ${Path}`
          );
        } catch (_Error) {
          ErrorLog(
            "Error using pre-existing 'WorkerApplication' policy or creating TrustedScriptURL:",
            _Error
          );
          throw _Error;
        }
      } else {
        WarnLog(
          "Trusted Types not available/enforced. Using plain string for SW path (potentially unsafe)."
        );
        URL = Path;
      }
      const Registration = await navigator.serviceWorker.register(
        URL,
        {
          scope: Scope,
          type: "module"
        }
      );
      Log("Service Worker registration call finished successfully.");
      Log("Registered Scope:", Registration.scope);
      if (Registration.installing)
        Log("Service Worker installing.");
      else if (Registration.waiting)
        Log("Service Worker waiting.");
      else if (Registration.active)
        Log("Service Worker active.");
      else
        Log("Service Worker state unknown after registration.");
      Log("Waiting for navigator.serviceWorker.ready...");
      await navigator.serviceWorker.ready;
      Log("navigator.serviceWorker.ready resolved.");
      const Controlled = !!navigator.serviceWorker.controller;
      Log(
        `Page controlled after registration + ready: ${Controlled}`
      );
      if (!InitiallyControlled && !Controlled) {
        if (!sessionStorage.getItem(Reload)) {
          Log("Page needs control. Setting flag and RELOADING.");
          sessionStorage.setItem(Reload, "true");
          window.location.reload();
          return;
        } else {
          WarnLog(
            "Reload flag set, but still not controlled. Removing flag."
          );
          sessionStorage.removeItem(Reload);
        }
      } else {
        if (sessionStorage.getItem(Reload)) {
          Log(`Page controlled. Clearing reload flag.`);
          sessionStorage.removeItem(Reload);
        }
        if (Controlled)
          Log("Service Worker actively controlling.");
        else if (InitiallyControlled)
          Log("Service Worker was already controlling.");
      }
    } catch (_Error) {
      ErrorLog(
        "Service Worker registration or ready failed:",
        _Error
      );
      if (_Error instanceof TypeError && (_Error.message.includes("TrustedScriptURL") || _Error.message.includes("Trusted Type"))) {
        ErrorLog(
          "This failure might be due to a Trusted Types policy violation. Check policy definitions and CSP."
        );
      }
      sessionStorage.removeItem(Reload);
    }
  }, "Control");
  if (document.readyState === "loading") {
    Log("DOM not ready, deferring SW registration.");
    document.addEventListener("DOMContentLoaded", Control);
  } else {
    Log("DOM ready, running SW registration now.");
    Control();
  }
} else {
  WarnLog("Service Worker API not supported.");
}
//# sourceMappingURL=Application.astro_astro_type_script_index_0_lang.9QgKck3i.js.map
