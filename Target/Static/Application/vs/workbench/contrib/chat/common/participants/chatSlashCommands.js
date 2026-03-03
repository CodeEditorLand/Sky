var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
const IChatSlashCommandService = createDecorator("chatSlashCommandService");
let ChatSlashCommandService = class ChatSlashCommandService2 extends Disposable {
  static {
    __name(this, "ChatSlashCommandService");
  }
  constructor(_extensionService) {
    super();
    this._extensionService = _extensionService;
    this._commands = /* @__PURE__ */ new Map();
    this._onDidChangeCommands = this._register(new Emitter());
    this.onDidChangeCommands = this._onDidChangeCommands.event;
  }
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
  async executeCommand(id, prompt, progress, history, location, sessionResource, token) {
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
    return await data.command(prompt, progress, history, location, sessionResource, token);
  }
};
ChatSlashCommandService = __decorate([
  __param(0, IExtensionService)
], ChatSlashCommandService);
export {
  ChatSlashCommandService,
  IChatSlashCommandService
};
//# sourceMappingURL=chatSlashCommands.js.map
