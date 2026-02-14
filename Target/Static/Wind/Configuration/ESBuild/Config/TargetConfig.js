var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as Environment from "../Constant/EnvironmentConstant.js";
import BaseConfig from "./BaseConfig.js";
import { deepmerge } from "deepmerge-ts";
async function targetConfig(Current) {
  const merged = deepmerge(BaseConfig, {
    outdir: "Target",
    drop: Environment.On ? [] : ["debugger", "console"],
    define: {
      __DEV__: Environment.On ? "true" : "false",
      __INCREMENT__: `"${`${Environment.On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`
    },
    treeShaking: !Environment.On,
    entryPoints: (await import("@playform/build/Target/Function/Entry.js")).default(Current, ["Source/Configuration/*"]),
    platform: "browser",
    outbase: "Source",
    plugins: Environment.Compile ? deepmerge(Current.plugins || [], [
      {
        name: "Compile",
        setup({ onEnd }) {
          onEnd(async ({ metafile }) => {
            const _Output = metafile?.outputs;
            for (const Output in _Output) {
              if (Object.prototype.hasOwnProperty.call(_Output, Output)) {
                if (Output.endsWith(".js")) {
                  (await import("@playform/build/Target/Function/Exec.js")).default(
                    `Build '${Output}' 											--ESBuild Configuration/ESBuild/Target/Compile.js 											--TypeScript Configuration/tsconfig/Target/Compile.json`
                  );
                }
              }
            }
          });
        }
      }
    ]) : []
  });
  return merged;
}
__name(targetConfig, "targetConfig");
export {
  targetConfig as default
};
//# sourceMappingURL=TargetConfig.js.map
