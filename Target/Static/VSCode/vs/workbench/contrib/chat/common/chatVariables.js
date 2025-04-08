var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { Location } from "../../../../editor/common/languages.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry, IDiagnosticVariableEntryFilterData } from "./chatModel.js";
import { IParsedChatRequest } from "./chatParserTypes.js";
import { IChatContentReference, IChatProgressMessage } from "./chatService.js";
import { ChatAgentLocation } from "./constants.js";
const isIChatRequestProblemsVariable = /* @__PURE__ */ __name((obj) => typeof obj === "object" && obj !== null && "id" in obj && obj.id === "vscode.problems", "isIChatRequestProblemsVariable");
const IChatVariablesService = createDecorator("IChatVariablesService");
export {
  IChatVariablesService,
  isIChatRequestProblemsVariable
};
//# sourceMappingURL=chatVariables.js.map
