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
var ViewQuickAccessProvider_1;
import { localize, localize2 } from "../../../../nls.js";
import { IQuickInputService, ItemActivation } from "../../../../platform/quickinput/common/quickInput.js";
import { PickerQuickAccessProvider } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IOutputService } from "../../../services/output/common/output.js";
import { ITerminalGroupService, ITerminalService } from "../../terminal/browser/terminal.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { matchesFuzzy } from "../../../../base/common/filters.js";
import { fuzzyContains } from "../../../../base/common/strings.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IDebugService, REPL_VIEW_ID } from "../../debug/common/debug.js";
let ViewQuickAccessProvider = class ViewQuickAccessProvider2 extends PickerQuickAccessProvider {
  static {
    __name(this, "ViewQuickAccessProvider");
  }
  static {
    ViewQuickAccessProvider_1 = this;
  }
  static {
    this.PREFIX = "view ";
  }
  constructor(viewDescriptorService, viewsService, outputService, terminalService, terminalGroupService, debugService, paneCompositeService, contextKeyService) {
    super(ViewQuickAccessProvider_1.PREFIX, {
      noResultsPick: {
        label: localize("noViewResults", "No matching views"),
        containerLabel: ""
      }
    });
    this.viewDescriptorService = viewDescriptorService;
    this.viewsService = viewsService;
    this.outputService = outputService;
    this.terminalService = terminalService;
    this.terminalGroupService = terminalGroupService;
    this.debugService = debugService;
    this.paneCompositeService = paneCompositeService;
    this.contextKeyService = contextKeyService;
  }
  _getPicks(filter) {
    const filteredViewEntries = this.doGetViewPickItems().filter((entry) => {
      if (!filter) {
        return true;
      }
      entry.highlights = { label: matchesFuzzy(filter, entry.label, true) ?? void 0 };
      return entry.highlights.label || fuzzyContains(entry.containerLabel, filter);
    });
    const mapEntryToContainer = /* @__PURE__ */ new Map();
    for (const entry of filteredViewEntries) {
      if (!mapEntryToContainer.has(entry.label)) {
        mapEntryToContainer.set(entry.label, entry.containerLabel);
      }
    }
    const filteredViewEntriesWithSeparators = [];
    let lastContainer = void 0;
    for (const entry of filteredViewEntries) {
      if (lastContainer !== entry.containerLabel) {
        lastContainer = entry.containerLabel;
        let separatorLabel;
        if (mapEntryToContainer.has(lastContainer)) {
          separatorLabel = `${mapEntryToContainer.get(lastContainer)} / ${lastContainer}`;
        } else {
          separatorLabel = lastContainer;
        }
        filteredViewEntriesWithSeparators.push({ type: "separator", label: separatorLabel });
      }
      filteredViewEntriesWithSeparators.push(entry);
    }
    return filteredViewEntriesWithSeparators;
  }
  doGetViewPickItems() {
    const viewEntries = [];
    const getViewEntriesForPaneComposite = /* @__PURE__ */ __name((paneComposite, viewContainer) => {
      const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
      const result = [];
      for (const view of viewContainerModel.allViewDescriptors) {
        if (this.contextKeyService.contextMatchesRules(view.when)) {
          result.push({
            label: view.name.value,
            containerLabel: viewContainerModel.title,
            accept: /* @__PURE__ */ __name(() => this.viewsService.openView(view.id, true), "accept")
          });
        }
      }
      return result;
    }, "getViewEntriesForPaneComposite");
    const addPaneComposites = /* @__PURE__ */ __name((location, containerLabel) => {
      const paneComposites = this.paneCompositeService.getPaneComposites(location);
      const visiblePaneCompositeIds = this.paneCompositeService.getVisiblePaneCompositeIds(location);
      paneComposites.sort((a, b) => {
        let aIndex = visiblePaneCompositeIds.findIndex((id) => a.id === id);
        let bIndex = visiblePaneCompositeIds.findIndex((id) => b.id === id);
        if (aIndex < 0) {
          aIndex = paneComposites.indexOf(a) + visiblePaneCompositeIds.length;
        }
        if (bIndex < 0) {
          bIndex = paneComposites.indexOf(b) + visiblePaneCompositeIds.length;
        }
        return aIndex - bIndex;
      });
      for (const paneComposite of paneComposites) {
        if (this.includeViewContainer(paneComposite)) {
          const viewContainer = this.viewDescriptorService.getViewContainerById(paneComposite.id);
          if (viewContainer) {
            viewEntries.push({
              label: this.viewDescriptorService.getViewContainerModel(viewContainer).title,
              containerLabel,
              accept: /* @__PURE__ */ __name(() => this.paneCompositeService.openPaneComposite(paneComposite.id, location, true), "accept")
            });
          }
        }
      }
    }, "addPaneComposites");
    addPaneComposites(0, localize("views", "Side Bar"));
    addPaneComposites(1, localize("panels", "Panel"));
    addPaneComposites(2, localize("secondary side bar", "Secondary Side Bar"));
    const addPaneCompositeViews = /* @__PURE__ */ __name((location) => {
      const paneComposites = this.paneCompositeService.getPaneComposites(location);
      for (const paneComposite of paneComposites) {
        const viewContainer = this.viewDescriptorService.getViewContainerById(paneComposite.id);
        if (viewContainer) {
          viewEntries.push(...getViewEntriesForPaneComposite(paneComposite, viewContainer));
        }
      }
    }, "addPaneCompositeViews");
    addPaneCompositeViews(
      0
      /* ViewContainerLocation.Sidebar */
    );
    addPaneCompositeViews(
      1
      /* ViewContainerLocation.Panel */
    );
    addPaneCompositeViews(
      2
      /* ViewContainerLocation.AuxiliaryBar */
    );
    this.terminalGroupService.groups.forEach((group, groupIndex) => {
      group.terminalInstances.forEach((terminal, terminalIndex) => {
        const label = localize("terminalTitle", "{0}: {1}", `${groupIndex + 1}.${terminalIndex + 1}`, terminal.title);
        viewEntries.push({
          label,
          containerLabel: localize("terminals", "Terminal"),
          accept: /* @__PURE__ */ __name(async () => {
            await this.terminalGroupService.showPanel(true);
            this.terminalService.setActiveInstance(terminal);
          }, "accept")
        });
      });
    });
    this.debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl()).forEach((session, _) => {
      const label = session.name;
      viewEntries.push({
        label,
        containerLabel: localize("debugConsoles", "Debug Console"),
        accept: /* @__PURE__ */ __name(async () => {
          await this.debugService.focusStackFrame(void 0, void 0, session, { explicit: true });
          if (!this.viewsService.isViewVisible(REPL_VIEW_ID)) {
            await this.viewsService.openView(REPL_VIEW_ID, true);
          }
        }, "accept")
      });
    });
    const channels = this.outputService.getChannelDescriptors();
    for (const channel of channels) {
      viewEntries.push({
        label: channel.label,
        containerLabel: localize("channels", "Output"),
        accept: /* @__PURE__ */ __name(() => this.outputService.showChannel(channel.id), "accept")
      });
    }
    return viewEntries;
  }
  includeViewContainer(container) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(container.id);
    if (viewContainer?.hideIfEmpty) {
      return this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0;
    }
    return true;
  }
};
ViewQuickAccessProvider = ViewQuickAccessProvider_1 = __decorate([
  __param(0, IViewDescriptorService),
  __param(1, IViewsService),
  __param(2, IOutputService),
  __param(3, ITerminalService),
  __param(4, ITerminalGroupService),
  __param(5, IDebugService),
  __param(6, IPaneCompositePartService),
  __param(7, IContextKeyService)
], ViewQuickAccessProvider);
class OpenViewPickerAction extends Action2 {
  static {
    __name(this, "OpenViewPickerAction");
  }
  static {
    this.ID = "workbench.action.openView";
  }
  constructor() {
    super({
      id: OpenViewPickerAction.ID,
      title: localize2("openView", "Open View"),
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(ViewQuickAccessProvider.PREFIX);
  }
}
class QuickAccessViewPickerAction extends Action2 {
  static {
    __name(this, "QuickAccessViewPickerAction");
  }
  static {
    this.ID = "workbench.action.quickOpenView";
  }
  static {
    this.KEYBINDING = {
      primary: 2048 | 47,
      mac: {
        primary: 256 | 47
        /* KeyCode.KeyQ */
      },
      linux: { primary: 0 }
    };
  }
  constructor() {
    super({
      id: QuickAccessViewPickerAction.ID,
      title: localize2("quickOpenView", "Quick Open View"),
      category: Categories.View,
      f1: false,
      // hide quick pickers from command palette to not confuse with the other entry that shows a input field
      keybinding: {
        weight: 200,
        when: void 0,
        ...QuickAccessViewPickerAction.KEYBINDING
      }
    });
  }
  async run(accessor) {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const keys = keybindingService.lookupKeybindings(QuickAccessViewPickerAction.ID);
    quickInputService.quickAccess.show(ViewQuickAccessProvider.PREFIX, { quickNavigateConfiguration: { keybindings: keys }, itemActivation: ItemActivation.FIRST });
  }
}
export {
  OpenViewPickerAction,
  QuickAccessViewPickerAction,
  ViewQuickAccessProvider
};
//# sourceMappingURL=viewQuickAccess.js.map
