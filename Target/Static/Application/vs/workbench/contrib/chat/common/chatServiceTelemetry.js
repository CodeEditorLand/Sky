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
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ChatAgentVoteDirection, ChatCopyKind } from "./chatService.js";
let ChatServiceTelemetry = class ChatServiceTelemetry2 {
  static {
    __name(this, "ChatServiceTelemetry");
  }
  constructor(telemetryService) {
    this.telemetryService = telemetryService;
  }
  notifyUserAction(action) {
    if (action.action.kind === "vote") {
      this.telemetryService.publicLog2("interactiveSessionVote", {
        direction: action.action.direction === ChatAgentVoteDirection.Up ? "up" : "down",
        agentId: action.agentId ?? "",
        command: action.command,
        reason: action.action.reason
      });
    } else if (action.action.kind === "copy") {
      this.telemetryService.publicLog2("interactiveSessionCopy", {
        copyKind: action.action.copyKind === ChatCopyKind.Action ? "action" : "toolbar",
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "insert") {
      this.telemetryService.publicLog2("interactiveSessionInsert", {
        newFile: !!action.action.newFile,
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "apply") {
      this.telemetryService.publicLog2("interactiveSessionApply", {
        newFile: !!action.action.newFile,
        codeMapper: action.action.codeMapper,
        agentId: action.agentId ?? "",
        command: action.command,
        editsProposed: !!action.action.editsProposed
      });
    } else if (action.action.kind === "runInTerminal") {
      this.telemetryService.publicLog2("interactiveSessionRunInTerminal", {
        languageId: action.action.languageId ?? "",
        agentId: action.agentId ?? "",
        command: action.command
      });
    } else if (action.action.kind === "followUp") {
      this.telemetryService.publicLog2("chatFollowupClicked", {
        agentId: action.agentId ?? "",
        command: action.command
      });
    }
  }
  retrievedFollowups(agentId, command, numFollowups) {
    this.telemetryService.publicLog2("chatFollowupsRetrieved", {
      agentId,
      command,
      numFollowups
    });
  }
};
ChatServiceTelemetry = __decorate([
  __param(0, ITelemetryService)
], ChatServiceTelemetry);
export {
  ChatServiceTelemetry
};
//# sourceMappingURL=chatServiceTelemetry.js.map
