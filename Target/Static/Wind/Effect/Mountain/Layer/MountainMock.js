var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream } from "effect";
import { MountainTag } from "../Tag/MountainTag.js";
const MountainMockLive = Layer.succeed(MountainTag, {
  connectionState: Effect.succeed({
    _tag: "Connected",
    version: "mock"
  }),
  connectionChanges: Stream.empty,
  connect: Effect.void,
  disconnect: Effect.void,
  rpc: /* @__PURE__ */ __name(() => () => Effect.succeed({}), "rpc"),
  sync: /* @__PURE__ */ __name(() => Effect.succeed({
    success: true,
    resourcesSynced: 0,
    errors: [],
    duration: 0
  }), "sync"),
  syncEvents: Stream.empty,
  version: Effect.succeed("mock"),
  healthCheck: Effect.succeed(true)
});
var MountainMock_default = MountainMockLive;
export {
  MountainMockLive,
  MountainMock_default as default
};
//# sourceMappingURL=MountainMock.js.map
