var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { DisposableMap, IDisposable } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { CommandsRegistry, ICommandMetadata, ICommandService } from "../../../platform/commands/common/commands.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { Dto, SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { ExtHostCommandsShape, ExtHostContext, MainContext, MainThreadCommandsShape } from "../common/extHost.protocol.js";
import { isString } from "../../../base/common/types.js";
let MainThreadCommands = class {
  constructor(extHostContext, _commandService, _extensionService) {
    this._commandService = _commandService;
    this._extensionService = _extensionService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostCommands);
    this._generateCommandsDocumentationRegistration = CommandsRegistry.registerCommand("_generateCommandsDocumentation", () => this._generateCommandsDocumentation());
  }
  _commandRegistrations = new DisposableMap();
  _generateCommandsDocumentationRegistration;
  _proxy;
  dispose() {
    this._commandRegistrations.dispose();
    this._generateCommandsDocumentationRegistration.dispose();
  }
  async _generateCommandsDocumentation() {
    const result = await this._proxy.$getContributedCommandMetadata();
    const commands = CommandsRegistry.getCommands();
    for (const [id, command] of commands) {
      if (command.metadata) {
        result[id] = command.metadata;
      }
    }
    const all = [];
    for (const id in result) {
      all.push("`" + id + "` - " + _generateMarkdown(result[id]));
    }
    console.log(all.join("\n"));
  }
  $registerCommand(id) {
    this._commandRegistrations.set(
      id,
      CommandsRegistry.registerCommand(id, (accessor, ...args) => {
        return this._proxy.$executeContributedCommand(id, ...args).then((result) => {
          return revive(result);
        });
      })
    );
  }
  $unregisterCommand(id) {
    this._commandRegistrations.deleteAndDispose(id);
  }
  $fireCommandActivationEvent(id) {
    const activationEvent = `onCommand:${id}`;
    if (!this._extensionService.activationEventIsDone(activationEvent)) {
      this._extensionService.activateByEvent(activationEvent);
    }
  }
  async $executeCommand(id, args, retry) {
    if (args instanceof SerializableObjectWithBuffers) {
      args = args.value;
    }
    for (let i = 0; i < args.length; i++) {
      args[i] = revive(args[i]);
    }
    if (retry && args.length > 0 && !CommandsRegistry.getCommand(id)) {
      await this._extensionService.activateByEvent(`onCommand:${id}`);
      throw new Error("$executeCommand:retry");
    }
    return this._commandService.executeCommand(id, ...args);
  }
  $getCommands() {
    return Promise.resolve([...CommandsRegistry.getCommands().keys()]);
  }
};
__name(MainThreadCommands, "MainThreadCommands");
MainThreadCommands = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadCommands),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IExtensionService)
], MainThreadCommands);
function _generateMarkdown(description) {
  if (typeof description === "string") {
    return description;
  } else {
    const descriptionString = isString(description.description) ? description.description : description.description.original;
    const parts = [descriptionString];
    parts.push("\n\n");
    if (description.args) {
      for (const arg of description.args) {
        parts.push(`* _${arg.name}_ - ${arg.description || ""}
`);
      }
    }
    if (description.returns) {
      parts.push(`* _(returns)_ - ${description.returns}`);
    }
    parts.push("\n\n");
    return parts.join("");
  }
}
__name(_generateMarkdown, "_generateMarkdown");
export {
  MainThreadCommands
};
//# sourceMappingURL=mainThreadCommands.js.map
