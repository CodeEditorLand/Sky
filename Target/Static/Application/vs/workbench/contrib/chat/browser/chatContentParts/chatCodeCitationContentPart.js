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
import * as dom from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { getCodeCitationsMessage } from "../../common/chatModel.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
let ChatCodeCitationContentPart = class ChatCodeCitationContentPart2 extends Disposable {
  static {
    __name(this, "ChatCodeCitationContentPart");
  }
  constructor(citations, context, editorService, telemetryService) {
    super();
    this.editorService = editorService;
    this.telemetryService = telemetryService;
    const label = getCodeCitationsMessage(citations.citations);
    const elements = dom.h(".chat-code-citation-message@root", [
      dom.h("span.chat-code-citation-label@label"),
      dom.h(".chat-code-citation-button-container@button")
    ]);
    elements.label.textContent = label + " - ";
    const button = this._register(new Button(elements.button, {
      buttonBackground: void 0,
      buttonBorder: void 0,
      buttonForeground: void 0,
      buttonHoverBackground: void 0,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0
    }));
    button.label = localize("viewMatches", "View matches");
    this._register(button.onDidClick(() => {
      const citationText = `# Code Citations

` + citations.citations.map((c) => `## License: ${c.license}
${c.value.toString()}

\`\`\`
${c.snippet}
\`\`\`

`).join("\n");
      this.editorService.openEditor({ resource: void 0, contents: citationText, languageId: "markdown" });
      this.telemetryService.publicLog2("openedChatCodeCitations");
    }));
    this.domNode = elements.root;
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "codeCitations";
  }
};
ChatCodeCitationContentPart = __decorate([
  __param(2, IEditorService),
  __param(3, ITelemetryService)
], ChatCodeCitationContentPart);
export {
  ChatCodeCitationContentPart
};
//# sourceMappingURL=chatCodeCitationContentPart.js.map
