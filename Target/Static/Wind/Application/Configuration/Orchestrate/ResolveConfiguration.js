var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepmerge } from "deepmerge-ts";
import { Effect, pipe } from "../../../effect";
import { joinPath } from "vs/base/common/resources.js";
const ResolveConfigurationFile = /* @__PURE__ */ __name((ConfigDirectoryEffect, FileName) => pipe(
  ConfigDirectoryEffect,
  Effect.flatMap(
    (ConfigDirectory) => pipe(
      ReadRawFile(joinPath(ConfigDirectory, FileName)),
      Effect.flatMap(ParseJson),
      // If the file doesn't exist or is invalid, treat it as an empty object.
      Effect.catchAll(() => Effect.succeed({}))
    )
  )
), "ResolveConfigurationFile");
const ResolveConfiguration = pipe(
  Effect.all(
    {
      // Concurrently resolve both the user global settings and workspace settings.
      User: ResolveConfigurationFile(
        ResolveFinalDefaultPath(),
        "settings.json"
      ),
      Workspace: ResolveConfigurationFile(
        ResolveWorkspacePath(),
        "settings.json"
      )
    },
    { concurrency: "unbounded" }
  ),
  // Perform a deep merge. The `deepmerge` library correctly handles nested objects.
  Effect.map(({ User, Workspace }) => deepmerge(User, Workspace)),
  // Map any error from the underlying integration effects into our application-level error.
  Effect.mapError(
    (cause) => new ApplicationConfigurationProblem({
      cause,
      context: "FailedToResolveConfiguration"
    })
  )
);
export {
  ResolveConfiguration
};
//# sourceMappingURL=ResolveConfiguration.js.map
