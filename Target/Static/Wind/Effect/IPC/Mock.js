var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Stream, Layer } from "effect";
import { IPCTag } from "./Tag/IPCTag.js";
const MockIPCLive = Layer.succeed(IPCTag, {
  send: /* @__PURE__ */ __name((_channel) => (_args) => Effect.void, "send"),
  invoke: /* @__PURE__ */ __name((_channel) => (_args) => Effect.succeed({}), "invoke"),
  events: /* @__PURE__ */ __name((_channel) => Stream.empty, "events"),
  once: /* @__PURE__ */ __name((_channel) => Effect.succeed({ channel: _channel, args: [] }), "once"),
  removeAllListeners: /* @__PURE__ */ __name((_channel) => Effect.void, "removeAllListeners")
});
var Mock_default = MockIPCLive;
export {
  MockIPCLive,
  Mock_default as default
};
//# sourceMappingURL=Mock.js.map
