import { Effect, Layer } from "effect";
import MountainSyncTag from "../Tag/MountainSyncTag.js";
import makeMountainSync from "../Implementation/MountainSyncImplementation.js";
import { MountainTag } from "../../Mountain.js";
import { IPCTag } from "../../IPC.js";
import { TelemetryTag } from "../../Telemetry.js";
const MountainSyncLive = Layer.effect(
  MountainSyncTag,
  Effect.gen(function* () {
    const mountain = yield* MountainTag;
    const ipc = yield* IPCTag;
    const telemetry = yield* TelemetryTag;
    return makeMountainSync(mountain, ipc, telemetry);
  })
);
var MountainSyncLive_default = MountainSyncLive;
export {
  MountainSyncLive_default as default
};
//# sourceMappingURL=MountainSyncLive.js.map
