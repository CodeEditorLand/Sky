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
import "./agentFeedbackEditorInputContribution.js";
import "./agentFeedbackEditorWidgetContribution.js";
import "./agentFeedbackOverviewRulerContribution.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { AgentFeedbackService, IAgentFeedbackService } from "./agentFeedbackService.js";
import { AgentFeedbackAttachmentContribution } from "./agentFeedbackAttachment.js";
import { AgentFeedbackAttachmentWidget } from "./agentFeedbackAttachmentWidget.js";
import { AgentFeedbackEditorOverlay } from "./agentFeedbackEditorOverlay.js";
import { registerAgentFeedbackEditorActions } from "./agentFeedbackEditorActions.js";
import { IChatAttachmentWidgetRegistry } from "../../../../workbench/contrib/chat/browser/attachments/chatAttachmentWidgetRegistry.js";
registerWorkbenchContribution2(
  AgentFeedbackEditorOverlay.ID,
  AgentFeedbackEditorOverlay,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  AgentFeedbackAttachmentContribution.ID,
  AgentFeedbackAttachmentContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerAgentFeedbackEditorActions();
registerSingleton(
  IAgentFeedbackService,
  AgentFeedbackService,
  1
  /* InstantiationType.Delayed */
);
let AgentFeedbackAttachmentWidgetContribution = class AgentFeedbackAttachmentWidgetContribution2 {
  static {
    __name(this, "AgentFeedbackAttachmentWidgetContribution");
  }
  static {
    this.ID = "workbench.contrib.agentFeedbackAttachmentWidgetFactory";
  }
  constructor(registry, instantiationService) {
    registry.registerFactory("agentFeedback", (attachment, options, container) => {
      return instantiationService.createInstance(AgentFeedbackAttachmentWidget, attachment, options, container);
    });
  }
};
AgentFeedbackAttachmentWidgetContribution = __decorate([
  __param(0, IChatAttachmentWidgetRegistry),
  __param(1, IInstantiationService)
], AgentFeedbackAttachmentWidgetContribution);
registerWorkbenchContribution2(
  AgentFeedbackAttachmentWidgetContribution.ID,
  AgentFeedbackAttachmentWidgetContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=agentFeedback.contribution.js.map
