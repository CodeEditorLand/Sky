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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IProgress } from "../../../../platform/progress/common/progress.js";
import { IChatMessage } from "./languageModels.js";
import { IChatFollowup, IChatProgress, IChatResponseProgressFileTreeData } from "./chatService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ChatAgentLocation, ChatMode } from "./constants.js";
const IChatSlashCommandService = createDecorator("chatSlashCommandService");
let ChatSlashCommandService = class extends Disposable {
  constructor(_extensionService) {
    super();
    this._extensionService = _extensionService;
  }
  static {
    __name(this, "ChatSlashCommandService");
  }
  _commands = /* @__PURE__ */ new Map();
  _onDidChangeCommands = this._register(new Emitter());
  onDidChangeCommands = this._onDidChangeCommands.event;
  dispose() {
    super.dispose();
    this._commands.clear();
  }
  registerSlashCommand(data, command) {
    if (this._commands.has(data.command)) {
      throw new Error(`Already registered a command with id ${data.command}}`);
    }
    this._commands.set(data.command, { data, command });
    this._onDidChangeCommands.fire();
    return toDisposable(() => {
      if (this._commands.delete(data.command)) {
        this._onDidChangeCommands.fire();
      }
    });
  }
  getCommands(location, mode) {
    return Array.from(this._commands.values(), (v) => v.data).filter((c) => c.locations.includes(location) && (!c.modes || c.modes.includes(mode)));
  }
  hasCommand(id) {
    return this._commands.has(id);
  }
  async executeCommand(id, prompt, progress, history, location, token) {
    const data = this._commands.get(id);
    if (!data) {
      throw new Error("No command with id ${id} NOT registered");
    }
    if (!data.command) {
      await this._extensionService.activateByEvent(`onSlash:${id}`);
    }
    if (!data.command) {
      throw new Error(`No command with id ${id} NOT resolved`);
    }
    return await data.command(prompt, progress, history, location, token);
  }
};
ChatSlashCommandService = __decorateClass([
  __decorateParam(0, IExtensionService)
], ChatSlashCommandService);
export {
  ChatSlashCommandService,
  IChatSlashCommandService
};
//# sourceMappingURL=chatSlashCommands.js.map
