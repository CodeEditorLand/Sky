import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../common/contributions.js";
import { StartupProfiler } from "./startupProfiler.js";
import { NativeStartupTimings } from "./startupTimings.js";
import { RendererProfiling } from "./rendererAutoProfiler.js";
import { Extensions as ConfigExt } from "../../../../platform/configuration/common/configurationRegistry.js";
import { localize } from "../../../../nls.js";
import { applicationConfigurationNodeBase } from "../../../common/configuration.js";
Registry.as(Extensions.Workbench).registerWorkbenchContribution(
  RendererProfiling,
  4
  /* LifecyclePhase.Eventually */
);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(
  StartupProfiler,
  3
  /* LifecyclePhase.Restored */
);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(
  NativeStartupTimings,
  4
  /* LifecyclePhase.Eventually */
);
Registry.as(ConfigExt.Configuration).registerConfiguration({
  ...applicationConfigurationNodeBase,
  "properties": {
    "application.experimental.rendererProfiling": {
      type: "boolean",
      default: false,
      tags: ["experimental", "onExP"],
      markdownDescription: localize("experimental.rendererProfiling", "When enabled, slow renderers are automatically profiled.")
    }
  }
});
//# sourceMappingURL=performance.contribution.js.map
