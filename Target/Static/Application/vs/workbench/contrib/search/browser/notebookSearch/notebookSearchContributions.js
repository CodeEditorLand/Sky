var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { INotebookSearchService } from "../../common/notebookSearch.js";
import { NotebookSearchService } from "./notebookSearchService.js";
function registerContributions() {
  registerSingleton(
    INotebookSearchService,
    NotebookSearchService,
    1
    /* InstantiationType.Delayed */
  );
}
__name(registerContributions, "registerContributions");
export {
  registerContributions
};
//# sourceMappingURL=notebookSearchContributions.js.map
