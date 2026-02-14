import { Effect, Layer } from "effect";
import { Sandbox } from "../Tag/SandboxTag.js";
import { SandboxNotReadyError, ConfigurationNotReadyError } from "../../../Types/Sandbox.js";
const SandboxMockLive = Layer.succeed(Sandbox, {
  globals: Effect.die(new SandboxNotReadyError()),
  isReady: Effect.succeed(false),
  awaitReady: Effect.die(new SandboxNotReadyError()),
  ipc: Effect.die(new SandboxNotReadyError()),
  configuration: Effect.die(new SandboxNotReadyError()),
  resolveConfiguration: Effect.fail(new ConfigurationNotReadyError())
});
var SandboxMock_default = SandboxMockLive;
export {
  SandboxMock_default as default
};
//# sourceMappingURL=SandboxMock.js.map
