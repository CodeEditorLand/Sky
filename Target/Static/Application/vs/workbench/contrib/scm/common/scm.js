import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const VIEWLET_ID = "workbench.view.scm";
const VIEW_PANE_ID = "workbench.scm";
const REPOSITORIES_VIEW_PANE_ID = "workbench.scm.repositories";
const HISTORY_VIEW_PANE_ID = "workbench.scm.history";
var ViewMode;
(function(ViewMode2) {
  ViewMode2["List"] = "list";
  ViewMode2["Tree"] = "tree";
})(ViewMode || (ViewMode = {}));
const ISCMService = createDecorator("scm");
var InputValidationType;
(function(InputValidationType2) {
  InputValidationType2[InputValidationType2["Error"] = 0] = "Error";
  InputValidationType2[InputValidationType2["Warning"] = 1] = "Warning";
  InputValidationType2[InputValidationType2["Information"] = 2] = "Information";
})(InputValidationType || (InputValidationType = {}));
var SCMInputChangeReason;
(function(SCMInputChangeReason2) {
  SCMInputChangeReason2[SCMInputChangeReason2["HistoryPrevious"] = 0] = "HistoryPrevious";
  SCMInputChangeReason2[SCMInputChangeReason2["HistoryNext"] = 1] = "HistoryNext";
})(SCMInputChangeReason || (SCMInputChangeReason = {}));
var ISCMRepositorySortKey;
(function(ISCMRepositorySortKey2) {
  ISCMRepositorySortKey2["DiscoveryTime"] = "discoveryTime";
  ISCMRepositorySortKey2["Name"] = "name";
  ISCMRepositorySortKey2["Path"] = "path";
})(ISCMRepositorySortKey || (ISCMRepositorySortKey = {}));
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
  VIEW_PANE_ID,
  ViewMode
};
//# sourceMappingURL=scm.js.map
