var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { ISplashStorageService } from "./splash.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { PartsSplash } from "./partsSplash.js";
registerSingleton(
  ISplashStorageService,
  class SplashStorageService {
    static {
      __name(this, "SplashStorageService");
    }
    async saveWindowSplash(splash) {
      const raw = JSON.stringify(splash);
      localStorage.setItem("monaco-parts-splash", raw);
    }
  },
  1
  /* InstantiationType.Delayed */
);
registerWorkbenchContribution2(
  PartsSplash.ID,
  PartsSplash,
  1
  /* WorkbenchPhase.BlockStartup */
);
//# sourceMappingURL=splash.contribution.js.map
