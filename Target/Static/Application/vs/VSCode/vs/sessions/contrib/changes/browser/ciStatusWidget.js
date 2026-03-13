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
import "./media/ciStatusWidget.css";
import * as dom from "../../../../base/browser/dom.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchList } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { spinningLoading } from "../../../../platform/theme/common/iconRegistry.js";
import { ChatViewPaneTarget, IChatWidgetService } from "../../../../workbench/contrib/chat/browser/chat.js";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "../../../../workbench/browser/labels.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
const $ = dom.$;
var CICheckGroup;
(function(CICheckGroup2) {
  CICheckGroup2[CICheckGroup2["Running"] = 0] = "Running";
  CICheckGroup2[CICheckGroup2["Pending"] = 1] = "Pending";
  CICheckGroup2[CICheckGroup2["Failed"] = 2] = "Failed";
  CICheckGroup2[CICheckGroup2["Successful"] = 3] = "Successful";
})(CICheckGroup || (CICheckGroup = {}));
class CICheckListDelegate {
  static {
    __name(this, "CICheckListDelegate");
  }
  static {
    this.ITEM_HEIGHT = 24;
  }
  getHeight(_element) {
    return CICheckListDelegate.ITEM_HEIGHT;
  }
  getTemplateId(_element) {
    return CICheckListRenderer.TEMPLATE_ID;
  }
}
class CICheckListRenderer {
  static {
    __name(this, "CICheckListRenderer");
  }
  static {
    this.TEMPLATE_ID = "ciCheck";
  }
  constructor(_labels, _openerService) {
    this._labels = _labels;
    this._openerService = _openerService;
    this.templateId = CICheckListRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    const row = dom.append(container, $(".ci-status-widget-check"));
    const labelContainer = dom.append(row, $(".ci-status-widget-check-label"));
    const label = templateDisposables.add(this._labels.create(labelContainer, { supportIcons: true }));
    const actionBarContainer = dom.append(row, $(".ci-status-widget-check-actions"));
    const actionBar = templateDisposables.add(new ActionBar(actionBarContainer));
    return {
      row,
      label,
      actionBar,
      templateDisposables,
      elementDisposables: templateDisposables.add(new DisposableStore())
    };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.actionBar.clear();
    templateData.row.className = `ci-status-widget-check ${getCheckStatusClass(element.check)}`;
    const title = localize("ci.checkTitle", "{0}: {1}", element.check.name, getCheckStateLabel(element.check));
    templateData.label.setResource({
      name: element.check.name,
      resource: URI.from({ scheme: "github-check", path: `/${element.check.id}/${element.check.name}` })
    }, {
      icon: getCheckIcon(element.check),
      title
    });
    const actions = [];
    if (element.check.detailsUrl) {
      actions.push(templateData.elementDisposables.add(new Action("ci.openOnGitHub", localize("ci.openOnGitHub", "Open on GitHub"), ThemeIcon.asClassName(Codicon.linkExternal), true, async () => {
        await this._openerService.open(URI.parse(element.check.detailsUrl));
      })));
    }
    templateData.actionBar.push(actions, { icon: true, label: false });
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.actionBar.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
}
let CIStatusWidget = class CIStatusWidget2 extends Disposable {
  static {
    __name(this, "CIStatusWidget");
  }
  get element() {
    return this._domNode;
  }
  constructor(container, _openerService, _chatWidgetService, _instantiationService) {
    super();
    this._openerService = _openerService;
    this._chatWidgetService = _chatWidgetService;
    this._instantiationService = _instantiationService;
    this._headerActionDisposables = this._register(new DisposableStore());
    this._collapsed = true;
    this._labels = this._register(this._instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
    this._domNode = dom.append(container, $(".ci-status-widget"));
    this._domNode.style.display = "none";
    this._headerNode = dom.append(this._domNode, $(".ci-status-widget-header"));
    this._titleNode = dom.append(this._headerNode, $(".ci-status-widget-title"));
    this._titleLabel = this._register(this._labels.create(this._titleNode, { supportIcons: true }));
    this._headerActionBarContainer = dom.append(this._headerNode, $(".ci-status-widget-header-actions"));
    this._headerActionBar = this._register(new ActionBar(this._headerActionBarContainer));
    this._headerActionBarContainer.style.display = "none";
    this._register(dom.addDisposableListener(this._headerActionBarContainer, dom.EventType.CLICK, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }));
    this._twistieNode = dom.append(this._headerNode, $(".ci-status-widget-twistie"));
    this._updateTwistie();
    this._register(dom.addDisposableListener(this._headerNode, "click", () => this._toggle()));
    this._bodyNode = dom.append(this._domNode, $(".ci-status-widget-body"));
    this._bodyNode.style.display = "none";
    const listContainer = $(".ci-status-widget-list");
    this._list = this._register(this._instantiationService.createInstance(WorkbenchList, "CIStatusWidget", listContainer, new CICheckListDelegate(), [new CICheckListRenderer(this._labels, this._openerService)], {
      multipleSelectionSupport: false,
      openOnSingleClick: false,
      accessibilityProvider: {
        getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("ci.checksListAriaLabel", "Checks"), "getWidgetAriaLabel"),
        getAriaLabel: /* @__PURE__ */ __name((item) => localize("ci.checkAriaLabel", "{0}, {1}", item.check.name, getCheckStateLabel(item.check)), "getAriaLabel")
      },
      keyboardNavigationLabelProvider: {
        getKeyboardNavigationLabel: /* @__PURE__ */ __name((item) => item.check.name, "getKeyboardNavigationLabel")
      }
    }));
    this._bodyNode.appendChild(this._list.getHTMLElement());
  }
  /**
   * Bind to a CI model. When `ciModel` is undefined, the widget hides.
   * Returns a disposable that stops observation.
   */
  bind(ciModel, sessionResource) {
    return autorun((reader) => {
      const model = ciModel.read(reader);
      this._sessionResource = sessionResource.read(reader);
      this._model = model;
      if (!model) {
        this._renderBody([]);
        this._renderHeaderActions([]);
        this._domNode.style.display = "none";
        return;
      }
      const checks = model.checks.read(reader);
      const overallStatus = model.overallStatus.read(reader);
      if (checks.length === 0) {
        this._renderBody([]);
        this._renderHeaderActions([]);
        this._domNode.style.display = "none";
        return;
      }
      this._domNode.style.display = "";
      this._renderHeader(checks, overallStatus);
      this._renderHeaderActions(getFailedChecks(checks));
      this._renderBody(sortChecks(checks));
    });
  }
  _toggle() {
    this._collapsed = !this._collapsed;
    this._bodyNode.style.display = this._collapsed ? "none" : "";
    this._updateTwistie();
  }
  _updateTwistie() {
    dom.clearNode(this._twistieNode);
    this._twistieNode.appendChild(renderIcon(this._collapsed ? Codicon.chevronRight : Codicon.chevronDown));
  }
  _renderHeader(checks, overallStatus) {
    const { icon, className } = getHeaderIconAndClass(checks, overallStatus);
    this._titleNode.className = `ci-status-widget-title ${className}`;
    const summary = getChecksSummary(checks);
    const title = localize("ci.headerTitle", "Checks: {0}", summary);
    this._titleLabel.setResource({
      name: title,
      resource: URI.from({ scheme: "github-checks", path: "/summary" })
    }, {
      icon,
      title
    });
  }
  _renderHeaderActions(failedChecks) {
    this._headerActionDisposables.clear();
    this._headerActionBar.clear();
    if (failedChecks.length === 0) {
      this._headerActionBarContainer.style.display = "none";
      return;
    }
    const fixChecksAction = this._headerActionDisposables.add(new Action("ci.fixChecks", localize("ci.fixChecks", "Fix Checks"), ThemeIcon.asClassName(Codicon.sparkle), true, async () => {
      await this._sendFixChecksPrompt(failedChecks);
    }));
    this._headerActionBar.push([fixChecksAction], { icon: true, label: false });
    this._headerActionBarContainer.style.display = "flex";
  }
  _renderBody(checks) {
    const height = checks.length * CICheckListDelegate.ITEM_HEIGHT;
    this._list.getHTMLElement().style.height = `${height}px`;
    this._list.layout(height);
    this._list.splice(0, this._list.length, checks);
  }
  async _sendFixChecksPrompt(failedChecks) {
    const model = this._model;
    const sessionResource = this._sessionResource;
    if (!model || !sessionResource || failedChecks.length === 0) {
      return;
    }
    const failedCheckDetails = await Promise.all(failedChecks.map(async (check) => {
      const annotations = await model.getCheckRunAnnotations(check.id);
      return {
        check,
        annotations
      };
    }));
    const prompt = buildFixChecksPrompt(failedCheckDetails);
    const chatWidget = this._chatWidgetService.getWidgetBySessionResource(sessionResource) ?? await this._chatWidgetService.openSession(sessionResource, ChatViewPaneTarget);
    if (!chatWidget) {
      return;
    }
    await chatWidget.acceptInput(prompt, { noCommandDetection: true });
  }
};
CIStatusWidget = __decorate([
  __param(1, IOpenerService),
  __param(2, IChatWidgetService),
  __param(3, IInstantiationService)
], CIStatusWidget);
function sortChecks(checks) {
  return [...checks].sort(compareChecks).map((check) => ({ check, group: getCheckGroup(check) }));
}
__name(sortChecks, "sortChecks");
function compareChecks(a, b) {
  const groupDiff = getCheckGroup(a) - getCheckGroup(b);
  if (groupDiff !== 0) {
    return groupDiff;
  }
  return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
}
__name(compareChecks, "compareChecks");
function getCheckGroup(check) {
  switch (check.status) {
    case "in_progress":
      return 0;
    case "queued":
      return 1;
    case "completed":
      return isFailedConclusion(check.conclusion) ? 2 : 3;
  }
}
__name(getCheckGroup, "getCheckGroup");
function getCheckCounts(checks) {
  let running = 0;
  let pending = 0;
  let failed = 0;
  let successful = 0;
  for (const check of checks) {
    switch (getCheckGroup(check)) {
      case 0:
        running++;
        break;
      case 1:
        pending++;
        break;
      case 2:
        failed++;
        break;
      case 3:
        successful++;
        break;
    }
  }
  return { running, pending, failed, successful };
}
__name(getCheckCounts, "getCheckCounts");
function getFailedChecks(checks) {
  return checks.filter(
    (check) => getCheckGroup(check) === 2
    /* CICheckGroup.Failed */
  );
}
__name(getFailedChecks, "getFailedChecks");
function getChecksSummary(checks) {
  const counts = getCheckCounts(checks);
  const parts = [];
  if (counts.running > 0) {
    parts.push(counts.running === 1 ? localize("ci.oneRunning", "1 running") : localize("ci.manyRunning", "{0} running", counts.running));
  }
  if (counts.pending > 0) {
    parts.push(counts.pending === 1 ? localize("ci.onePending", "1 pending") : localize("ci.manyPending", "{0} pending", counts.pending));
  }
  if (counts.failed > 0) {
    parts.push(counts.failed === 1 ? localize("ci.oneFailed", "1 failed") : localize("ci.manyFailed", "{0} failed", counts.failed));
  }
  if (counts.successful > 0) {
    parts.push(counts.successful === 1 ? localize("ci.oneSuccessful", "1 successful") : localize("ci.manySuccessful", "{0} successful", counts.successful));
  }
  return parts.join(", ");
}
__name(getChecksSummary, "getChecksSummary");
function buildFixChecksPrompt(failedChecks) {
  const sections = failedChecks.map(({ check, annotations }) => {
    const parts = [
      `Check: ${check.name}`,
      `Status: ${getCheckStateLabel(check)}`,
      `Conclusion: ${check.conclusion ?? "unknown"}`
    ];
    if (check.detailsUrl) {
      parts.push(`Details: ${check.detailsUrl}`);
    }
    parts.push("", "Annotations and output:", annotations || "No output available for this check run.");
    return parts.join("\n");
  });
  return [
    "Please fix the failed CI checks for this session immediately.",
    "Use the failed check information below, including annotations and check output, to identify the root causes and make the necessary code changes.",
    "Focus on resolving these CI failures. Avoid unrelated changes unless they are required to fix the checks.",
    "",
    "Failed CI checks:",
    "",
    sections.join("\n\n---\n\n")
  ].join("\n");
}
__name(buildFixChecksPrompt, "buildFixChecksPrompt");
function getHeaderIconAndClass(checks, overallStatus) {
  const counts = getCheckCounts(checks);
  if (counts.running > 0) {
    return { icon: spinningLoading, className: "ci-status-running" };
  }
  switch (overallStatus) {
    case "success":
      return { icon: Codicon.passFilled, className: "ci-status-success" };
    case "failure":
      return { icon: Codicon.error, className: "ci-status-failure" };
    case "pending":
      return { icon: Codicon.circle, className: "ci-status-pending" };
    default:
      return { icon: Codicon.circleFilled, className: "ci-status-neutral" };
  }
}
__name(getHeaderIconAndClass, "getHeaderIconAndClass");
function getCheckIcon(check) {
  switch (check.status) {
    case "in_progress":
      return spinningLoading;
    case "queued":
      return Codicon.circle;
    case "completed":
      switch (check.conclusion) {
        case "success":
          return Codicon.passFilled;
        case "failure":
        case "timed_out":
        case "action_required":
          return Codicon.error;
        case "cancelled":
          return Codicon.circleSlash;
        case "skipped":
          return Codicon.debugStepOver;
        default:
          return Codicon.circleFilled;
      }
  }
}
__name(getCheckIcon, "getCheckIcon");
function getCheckStatusClass(check) {
  switch (getCheckGroup(check)) {
    case 0:
      return "ci-status-running";
    case 1:
      return "ci-status-pending";
    case 2:
      return "ci-status-failure";
    case 3:
      return "ci-status-success";
  }
}
__name(getCheckStatusClass, "getCheckStatusClass");
function getCheckStateLabel(check) {
  switch (getCheckGroup(check)) {
    case 0:
      return localize("ci.runningState", "running");
    case 1:
      return localize("ci.pendingState", "pending");
    case 2:
      return localize("ci.failedState", "failed");
    case 3:
      return localize("ci.successfulState", "successful");
  }
}
__name(getCheckStateLabel, "getCheckStateLabel");
function isFailedConclusion(conclusion) {
  return conclusion === "failure" || conclusion === "timed_out" || conclusion === "action_required";
}
__name(isFailedConclusion, "isFailedConclusion");
export {
  CIStatusWidget
};
//# sourceMappingURL=ciStatusWidget.js.map
