import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { Command } from "../../../../editor/common/languages.js";
import { IAction } from "../../../../base/common/actions.js";
import { IMenu } from "../../../../platform/actions/common/actions.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { ResourceTree } from "../../../../base/common/resourceTree.js";
import { ISCMHistoryProvider } from "./history.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IObservable } from "../../../../base/common/observable.js";
const VIEWLET_ID = "workbench.view.scm";
const VIEW_PANE_ID = "workbench.scm";
const REPOSITORIES_VIEW_PANE_ID = "workbench.scm.repositories";
const HISTORY_VIEW_PANE_ID = "workbench.scm.history";
const ISCMService = createDecorator("scm");
var InputValidationType = /* @__PURE__ */ ((InputValidationType2) => {
  InputValidationType2[InputValidationType2["Error"] = 0] = "Error";
  InputValidationType2[InputValidationType2["Warning"] = 1] = "Warning";
  InputValidationType2[InputValidationType2["Information"] = 2] = "Information";
  return InputValidationType2;
})(InputValidationType || {});
var SCMInputChangeReason = /* @__PURE__ */ ((SCMInputChangeReason2) => {
  SCMInputChangeReason2[SCMInputChangeReason2["HistoryPrevious"] = 0] = "HistoryPrevious";
  SCMInputChangeReason2[SCMInputChangeReason2["HistoryNext"] = 1] = "HistoryNext";
  return SCMInputChangeReason2;
})(SCMInputChangeReason || {});
var ISCMRepositorySortKey = /* @__PURE__ */ ((ISCMRepositorySortKey2) => {
  ISCMRepositorySortKey2["DiscoveryTime"] = "discoveryTime";
  ISCMRepositorySortKey2["Name"] = "name";
  ISCMRepositorySortKey2["Path"] = "path";
  return ISCMRepositorySortKey2;
})(ISCMRepositorySortKey || {});
const ISCMViewService = createDecorator("scmView");
const SCM_CHANGES_EDITOR_ID = "workbench.editor.scmChangesEditor";
export {
  HISTORY_VIEW_PANE_ID,
  ISCMRepositorySortKey,
  ISCMService,
  ISCMViewService,
  InputValidationType,
  REPOSITORIES_VIEW_PANE_ID,
  SCMInputChangeReason,
  SCM_CHANGES_EDITOR_ID,
  VIEWLET_ID,
  VIEW_PANE_ID
};
//# sourceMappingURL=scm.js.map
