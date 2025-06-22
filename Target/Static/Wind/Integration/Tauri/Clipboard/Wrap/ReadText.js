var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { readText as ReadTextFromTauri } from "@tauri-apps/api/clipboard";
import { FromAsync } from "../../../../Effect/Produce.js";
const CreateProblem = /* @__PURE__ */ __name((cause) => new IntegrationClipboardProblem({ cause, operation: "ReadText" }), "CreateProblem");
const ReadText = FromAsync(ReadTextFromTauri, CreateProblem, {
  operation: "ReadText"
});
export {
  ReadText
};
//# sourceMappingURL=ReadText.js.map
