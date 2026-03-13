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
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { Disposable, DisposableResourceMap } from "../../../../../base/common/lifecycle.js";
import { autorun, autorunIterableDelta, observableValue } from "../../../../../base/common/observable.js";
import { migrateLegacyTerminalToolSpecificData } from "../../common/chat.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
let AgentSessionApprovalModel = class AgentSessionApprovalModel2 extends Disposable {
  static {
    __name(this, "AgentSessionApprovalModel");
  }
  constructor(_chatService, _languageService) {
    super();
    this._chatService = _chatService;
    this._languageService = _languageService;
    this._approvals = /* @__PURE__ */ new Map();
    this._modelTrackers = this._register(new DisposableResourceMap());
    this._register(autorunIterableDelta((reader) => this._chatService.chatModels.read(reader), ({ addedValues, removedValues }) => {
      for (const model of addedValues) {
        this._modelTrackers.set(model.sessionResource, this._trackModel(model));
      }
      for (const model of removedValues) {
        this._modelTrackers.deleteAndDispose(model.sessionResource);
        this._approvals.get(model.sessionResource.toString())?.set(void 0, void 0);
      }
    }));
  }
  getApproval(sessionResource) {
    return this._getOrCreateApproval(sessionResource.toString());
  }
  _getOrCreateApproval(key) {
    let obs = this._approvals.get(key);
    if (!obs) {
      obs = observableValue(`sessionApproval.${key}`, void 0);
      this._approvals.set(key, obs);
    }
    return obs;
  }
  _trackModel(model) {
    const settable = this._getOrCreateApproval(model.sessionResource.toString());
    const setIfChanged = /* @__PURE__ */ __name((value) => {
      const current = settable.get();
      if (current === value) {
        return;
      }
      if (current !== void 0 && value !== void 0 && current.label === value.label && current.languageId === value.languageId) {
        return;
      }
      settable.set(value, void 0);
    }, "setIfChanged");
    return autorun((reader) => {
      const needsInput = model.requestNeedsInput.read(reader);
      if (!needsInput) {
        setIfChanged(void 0);
        return;
      }
      const lastResponse = model.lastRequest?.response;
      if (!lastResponse?.response?.value) {
        setIfChanged(void 0);
        return;
      }
      for (const part of lastResponse.response.value) {
        if (part.kind !== "toolInvocation") {
          continue;
        }
        const state = part.state.read(reader);
        if (state.type === 1 || state.type === 3) {
          let label;
          let languageId;
          if (part.toolSpecificData?.kind === "terminal") {
            const terminalData = migrateLegacyTerminalToolSpecificData(part.toolSpecificData);
            label = terminalData.presentationOverrides?.commandLine ?? terminalData.commandLine.forDisplay ?? terminalData.commandLine.userEdited ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original;
            languageId = this._languageService.getLanguageIdByLanguageName(terminalData.presentationOverrides?.language ?? terminalData.language) ?? void 0;
          } else if (needsInput.detail) {
            label = needsInput.detail;
          } else {
            const msg = part.invocationMessage;
            label = typeof msg === "string" ? msg : renderAsPlaintext(msg);
          }
          const confirmState = state;
          setIfChanged({
            label,
            languageId,
            confirm: /* @__PURE__ */ __name(() => confirmState.confirm({
              type: 4
              /* ToolConfirmKind.UserAction */
            }), "confirm")
          });
          return;
        }
      }
      setIfChanged(void 0);
    });
  }
};
AgentSessionApprovalModel = __decorate([
  __param(0, IChatService),
  __param(1, ILanguageService)
], AgentSessionApprovalModel);
export {
  AgentSessionApprovalModel
};
//# sourceMappingURL=agentSessionApprovalModel.js.map
