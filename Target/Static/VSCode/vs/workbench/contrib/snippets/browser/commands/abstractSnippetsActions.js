var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorAction2 } from "../../../../../editor/browser/editorExtensions.js";
import { localize2 } from "../../../../../nls.js";
import { Action2, IAction2Options } from "../../../../../platform/actions/common/actions.js";
const defaultOptions = {
  category: localize2("snippets", "Snippets")
};
class SnippetsAction extends Action2 {
  static {
    __name(this, "SnippetsAction");
  }
  constructor(desc) {
    super({ ...defaultOptions, ...desc });
  }
}
class SnippetEditorAction extends EditorAction2 {
  static {
    __name(this, "SnippetEditorAction");
  }
  constructor(desc) {
    super({ ...defaultOptions, ...desc });
  }
}
export {
  SnippetEditorAction,
  SnippetsAction
};
//# sourceMappingURL=abstractSnippetsActions.js.map
