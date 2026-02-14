var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream } from "effect";
import { ConfigurationTag } from "../Tag/ConfigurationTag.js";
import { MakeValidate } from "../Implementation/ConfigurationHelper.js";
const makeMockConfiguration = /* @__PURE__ */ __name((overrides) => {
  const validate = MakeValidate();
  const mockConfig = {
    zoomLevel: 0,
    userEnv: {},
    workspace: {
      id: "mock-workspace",
      uri: "mock://workspace",
      name: "Mock Workspace"
    },
    ...overrides
  };
  return {
    get: Effect.succeed(mockConfig),
    fetch: Effect.succeed(mockConfig),
    validate,
    apply: /* @__PURE__ */ __name(() => Effect.void, "apply"),
    changes: Stream.empty,
    refresh: Effect.succeed(mockConfig)
  };
}, "makeMockConfiguration");
const ConfigurationMock = Layer.succeed(
  ConfigurationTag,
  makeMockConfiguration()
);
var ConfigurationMock_default = ConfigurationMock;
export {
  ConfigurationMock,
  ConfigurationMock_default as default,
  makeMockConfiguration
};
//# sourceMappingURL=ConfigurationMock.js.map
