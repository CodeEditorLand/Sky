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
var CurrentlyFilteredToRenderer_1, FileCoverageRenderer_1, DeclarationCoverageRenderer_1;
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { findLast } from "../../../../base/common/arraysFind.js";
import { assertNever } from "../../../../base/common/assert.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { memoize } from "../../../../base/common/decorators.js";
import { createMatches } from "../../../../base/common/filters.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../base/common/observable.js";
import { basenameOrAuthority } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { getActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, IMenuService, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { EditorOpenSource } from "../../../../platform/editor/common/editor.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchCompressibleObjectTree } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ResourceLabels } from "../../../browser/labels.js";
import { ViewAction, ViewPane } from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { onObservableChange } from "../common/observableUtils.js";
import { BypassedFileCoverage, FileCoverage, getTotalCoveragePercent } from "../common/testCoverage.js";
import { ITestCoverageService } from "../common/testCoverageService.js";
import { TestId } from "../common/testId.js";
import { TestingContextKeys } from "../common/testingContextKeys.js";
import * as coverUtils from "./codeCoverageDisplayUtils.js";
import { testingStatesToIcons, testingWasCovered } from "./icons.js";
import { ManagedTestCoverageBars } from "./testCoverageBars.js";
var CoverageSortOrder;
(function(CoverageSortOrder2) {
  CoverageSortOrder2[CoverageSortOrder2["Coverage"] = 0] = "Coverage";
  CoverageSortOrder2[CoverageSortOrder2["Location"] = 1] = "Location";
  CoverageSortOrder2[CoverageSortOrder2["Name"] = 2] = "Name";
})(CoverageSortOrder || (CoverageSortOrder = {}));
let TestCoverageView = class TestCoverageView2 extends ViewPane {
  static {
    __name(this, "TestCoverageView");
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, coverageService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.coverageService = coverageService;
    this.tree = new MutableDisposable();
    this.sortOrder = observableValue(
      "sortOrder",
      1
      /* CoverageSortOrder.Location */
    );
  }
  renderBody(container) {
    super.renderBody(container);
    const labels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
    this._register(autorun((reader) => {
      const coverage = this.coverageService.selected.read(reader);
      if (coverage) {
        const t = this.tree.value ??= this.instantiationService.createInstance(TestCoverageTree, container, labels, this.sortOrder);
        t.setInput(coverage, this.coverageService.filterToTest.read(reader));
      } else {
        this.tree.clear();
      }
    }));
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.tree.value?.layout(height, width);
  }
  collapseAll() {
    this.tree.value?.collapseAll();
  }
};
TestCoverageView = __decorate([
  __param(1, IKeybindingService),
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService),
  __param(5, IViewDescriptorService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, IThemeService),
  __param(9, IHoverService),
  __param(10, ITestCoverageService)
], TestCoverageView);
let fnNodeId = 0;
class DeclarationCoverageNode {
  static {
    __name(this, "DeclarationCoverageNode");
  }
  get hits() {
    return this.data.count;
  }
  get label() {
    return this.data.name;
  }
  get location() {
    return this.data.location;
  }
  get tpc() {
    const attr = this.attributableCoverage();
    return attr && getTotalCoveragePercent(attr.statement, attr.branch, void 0);
  }
  constructor(uri, data, details) {
    this.uri = uri;
    this.data = data;
    this.id = String(fnNodeId++);
    this.containedDetails = /* @__PURE__ */ new Set();
    this.children = [];
    if (data.location instanceof Range) {
      for (const detail of details) {
        if (this.contains(detail.location)) {
          this.containedDetails.add(detail);
        }
      }
    }
  }
  /** Gets whether this function has a defined range and contains the given range. */
  contains(location) {
    const own = this.data.location;
    return own instanceof Range && (location instanceof Range ? own.containsRange(location) : own.containsPosition(location));
  }
  /**
   * If the function defines a range, we can look at statements within the
   * function to get total coverage for the function, rather than a boolean
   * yes/no.
   */
  attributableCoverage() {
    const { location, count } = this.data;
    if (!(location instanceof Range) || !count) {
      return;
    }
    const statement = { covered: 0, total: 0 };
    const branch = { covered: 0, total: 0 };
    for (const detail of this.containedDetails) {
      if (detail.type !== 1) {
        continue;
      }
      statement.covered += detail.count ? 1 : 0;
      statement.total++;
      if (detail.branches) {
        for (const { count: count2 } of detail.branches) {
          branch.covered += count2 ? 1 : 0;
          branch.total++;
        }
      }
    }
    return { statement, branch };
  }
}
__decorate([
  memoize
], DeclarationCoverageNode.prototype, "attributableCoverage", null);
class RevealUncoveredDeclarations {
  static {
    __name(this, "RevealUncoveredDeclarations");
  }
  get label() {
    return localize("functionsWithoutCoverage", "{0} declarations without coverage...", this.n);
  }
  constructor(n) {
    this.n = n;
    this.id = String(fnNodeId++);
  }
}
class CurrentlyFilteredTo {
  static {
    __name(this, "CurrentlyFilteredTo");
  }
  get label() {
    return localize("filteredToTest", 'Showing coverage for "{0}"', this.testItem.label);
  }
  constructor(testItem) {
    this.testItem = testItem;
    this.id = String(fnNodeId++);
  }
}
class LoadingDetails {
  static {
    __name(this, "LoadingDetails");
  }
  constructor() {
    this.id = String(fnNodeId++);
    this.label = localize("loadingCoverageDetails", "Loading Coverage Details...");
  }
}
const isFileCoverage = /* @__PURE__ */ __name((c) => typeof c === "object" && "value" in c, "isFileCoverage");
const isDeclarationCoverage = /* @__PURE__ */ __name((c) => c instanceof DeclarationCoverageNode, "isDeclarationCoverage");
const shouldShowDeclDetailsOnExpand = /* @__PURE__ */ __name((c) => isFileCoverage(c) && c.value instanceof FileCoverage && !!c.value.declaration?.total, "shouldShowDeclDetailsOnExpand");
let TestCoverageTree = class TestCoverageTree2 extends Disposable {
  static {
    __name(this, "TestCoverageTree");
  }
  constructor(container, labels, sortOrder, instantiationService, editorService, commandService) {
    super();
    this.inputDisposables = this._register(new DisposableStore());
    container.classList.add("testing-stdtree");
    this.tree = instantiationService.createInstance(WorkbenchCompressibleObjectTree, "TestCoverageView", container, new TestCoverageTreeListDelegate(), [
      instantiationService.createInstance(FileCoverageRenderer, labels),
      instantiationService.createInstance(DeclarationCoverageRenderer),
      instantiationService.createInstance(BasicRenderer),
      instantiationService.createInstance(CurrentlyFilteredToRenderer)
    ], {
      expandOnlyOnTwistieClick: true,
      sorter: new Sorter(sortOrder),
      keyboardNavigationLabelProvider: {
        getCompressedNodeKeyboardNavigationLabel(elements) {
          return elements.map((e) => this.getKeyboardNavigationLabel(e)).join("/");
        },
        getKeyboardNavigationLabel(e) {
          return isFileCoverage(e) ? basenameOrAuthority(e.value.uri) : e.label;
        }
      },
      accessibilityProvider: {
        getAriaLabel(element) {
          if (isFileCoverage(element)) {
            const name = basenameOrAuthority(element.value.uri);
            return localize("testCoverageItemLabel", "{0} coverage: {0}%", name, (element.value.tpc * 100).toFixed(2));
          } else {
            return element.label;
          }
        },
        getWidgetAriaLabel() {
          return localize("testCoverageTreeLabel", "Test Coverage Explorer");
        }
      },
      identityProvider: new TestCoverageIdentityProvider()
    });
    this._register(autorun((reader) => {
      sortOrder.read(reader);
      this.tree.resort(null, true);
    }));
    this._register(this.tree);
    this._register(this.tree.onDidChangeCollapseState((e) => {
      const el = e.node.element;
      if (!e.node.collapsed && !e.node.children.length && el && shouldShowDeclDetailsOnExpand(el)) {
        if (el.value.hasSynchronousDetails) {
          this.tree.setChildren(el, [{ element: new LoadingDetails(), incompressible: true }]);
        }
        el.value.details().then((details) => this.updateWithDetails(el, details));
      }
    }));
    this._register(this.tree.onDidOpen((e) => {
      let resource;
      let selection;
      if (e.element) {
        if (isFileCoverage(e.element) && !e.element.children?.size) {
          resource = e.element.value.uri;
        } else if (isDeclarationCoverage(e.element)) {
          resource = e.element.uri;
          selection = e.element.location;
        } else if (e.element instanceof CurrentlyFilteredTo) {
          commandService.executeCommand(
            "testing.coverageFilterToTest"
            /* TestCommandId.CoverageFilterToTest */
          );
          return;
        }
      }
      if (!resource) {
        return;
      }
      editorService.openEditor({
        resource,
        options: {
          selection: selection instanceof Position ? Range.fromPositions(selection, selection) : selection,
          revealIfOpened: true,
          selectionRevealType: 3,
          preserveFocus: e.editorOptions.preserveFocus,
          pinned: e.editorOptions.pinned,
          source: EditorOpenSource.USER
        }
      }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
    }));
  }
  setInput(coverage, showOnlyTest) {
    this.inputDisposables.clear();
    let tree = coverage.tree;
    if (showOnlyTest) {
      tree = coverage.filterTreeForTest(showOnlyTest);
    }
    const files = [];
    for (let node of tree.nodes) {
      while (!(node.value instanceof FileCoverage) && node.children?.size === 1) {
        node = Iterable.first(node.children.values());
      }
      files.push(node);
    }
    const toChild = /* @__PURE__ */ __name((value) => {
      const isFile = !value.children?.size;
      return {
        element: value,
        incompressible: isFile,
        collapsed: isFile,
        // directories can be expanded, and items with function info can be expanded
        collapsible: !isFile || !!value.value?.declaration?.total,
        children: value.children && Iterable.map(value.children?.values(), toChild)
      };
    }, "toChild");
    this.inputDisposables.add(onObservableChange(coverage.didAddCoverage, (nodes) => {
      const toRender = findLast(nodes, (n) => this.tree.hasElement(n));
      if (toRender) {
        this.tree.setChildren(toRender, Iterable.map(toRender.children?.values() || [], toChild), { diffIdentityProvider: { getId: /* @__PURE__ */ __name((el) => el.value.id, "getId") } });
      }
    }));
    let children = Iterable.map(files, toChild);
    const filteredTo = showOnlyTest && coverage.result.getTestById(showOnlyTest.toString());
    if (filteredTo) {
      children = Iterable.concat(Iterable.single({
        element: new CurrentlyFilteredTo(filteredTo),
        incompressible: true
      }), children);
    }
    this.tree.setChildren(null, children);
  }
  layout(height, width) {
    this.tree.layout(height, width);
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  updateWithDetails(el, details) {
    if (!this.tree.hasElement(el)) {
      return;
    }
    const decl = [];
    for (const fn of details) {
      if (fn.type !== 0) {
        continue;
      }
      let arr = decl;
      while (true) {
        const parent = arr.find((p) => p.containedDetails.has(fn));
        if (parent) {
          arr = parent.children;
        } else {
          break;
        }
      }
      arr.push(new DeclarationCoverageNode(el.value.uri, fn, details));
    }
    const makeChild = /* @__PURE__ */ __name((fn) => ({
      element: fn,
      incompressible: true,
      collapsed: true,
      collapsible: fn.children.length > 0,
      children: fn.children.map(makeChild)
    }), "makeChild");
    this.tree.setChildren(el, decl.map(makeChild));
  }
};
TestCoverageTree = __decorate([
  __param(3, IInstantiationService),
  __param(4, IEditorService),
  __param(5, ICommandService)
], TestCoverageTree);
class TestCoverageTreeListDelegate {
  static {
    __name(this, "TestCoverageTreeListDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    if (isFileCoverage(element)) {
      return FileCoverageRenderer.ID;
    }
    if (isDeclarationCoverage(element)) {
      return DeclarationCoverageRenderer.ID;
    }
    if (element instanceof LoadingDetails || element instanceof RevealUncoveredDeclarations) {
      return BasicRenderer.ID;
    }
    if (element instanceof CurrentlyFilteredTo) {
      return CurrentlyFilteredToRenderer.ID;
    }
    assertNever(element);
  }
}
class Sorter {
  static {
    __name(this, "Sorter");
  }
  constructor(order) {
    this.order = order;
  }
  compare(a, b) {
    const order = this.order.get();
    if (isFileCoverage(a) && isFileCoverage(b)) {
      switch (order) {
        case 1:
        case 2:
          return a.value.uri.toString().localeCompare(b.value.uri.toString());
        case 0:
          return b.value.tpc - a.value.tpc;
      }
    } else if (isDeclarationCoverage(a) && isDeclarationCoverage(b)) {
      switch (order) {
        case 1:
          return Position.compare(a.location instanceof Range ? a.location.getStartPosition() : a.location, b.location instanceof Range ? b.location.getStartPosition() : b.location);
        case 2:
          return a.label.localeCompare(b.label);
        case 0: {
          const attrA = a.tpc;
          const attrB = b.tpc;
          return attrA !== void 0 && attrB !== void 0 && attrB - attrA || +b.hits - +a.hits || a.label.localeCompare(b.label);
        }
      }
    } else {
      return 0;
    }
  }
}
let CurrentlyFilteredToRenderer = class CurrentlyFilteredToRenderer2 {
  static {
    __name(this, "CurrentlyFilteredToRenderer");
  }
  static {
    CurrentlyFilteredToRenderer_1 = this;
  }
  static {
    this.ID = "C";
  }
  constructor(menuService, contextKeyService) {
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.templateId = CurrentlyFilteredToRenderer_1.ID;
  }
  renderCompressedElements(node, index, templateData) {
    this.renderInner(node.element.elements[node.element.elements.length - 1], templateData);
  }
  renderTemplate(container) {
    container.classList.add("testing-stdtree-container");
    const label = dom.append(container, dom.$(".label"));
    const menu = this.menuService.getMenuActions(MenuId.TestCoverageFilterItem, this.contextKeyService, {
      shouldForwardArgs: true
    });
    const actions = new ActionBar(container);
    actions.push(getActionBarActions(menu, "inline").primary, { icon: true, label: false });
    actions.domNode.style.display = "block";
    return { label, actions };
  }
  renderElement(element, index, templateData) {
    this.renderInner(element.element, templateData);
  }
  disposeTemplate(templateData) {
    templateData.actions.dispose();
  }
  renderInner(element, container) {
    container.label.innerText = element.label;
  }
};
CurrentlyFilteredToRenderer = CurrentlyFilteredToRenderer_1 = __decorate([
  __param(0, IMenuService),
  __param(1, IContextKeyService)
], CurrentlyFilteredToRenderer);
let FileCoverageRenderer = class FileCoverageRenderer2 {
  static {
    __name(this, "FileCoverageRenderer");
  }
  static {
    FileCoverageRenderer_1 = this;
  }
  static {
    this.ID = "F";
  }
  constructor(labels, labelService, instantiationService) {
    this.labels = labels;
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.templateId = FileCoverageRenderer_1.ID;
  }
  /** @inheritdoc */
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    container.classList.add("testing-stdtree-container", "test-coverage-list-item");
    return {
      container,
      bars: templateDisposables.add(this.instantiationService.createInstance(ManagedTestCoverageBars, { compact: false, container })),
      label: templateDisposables.add(this.labels.create(container, {
        supportHighlights: true
      })),
      elementsDisposables: templateDisposables.add(new DisposableStore()),
      templateDisposables
    };
  }
  /** @inheritdoc */
  renderElement(node, _index, templateData) {
    this.doRender(node.element, templateData, node.filterData);
  }
  /** @inheritdoc */
  renderCompressedElements(node, _index, templateData) {
    this.doRender(node.element.elements, templateData, node.filterData);
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  /** @inheritdoc */
  doRender(element, templateData, filterData) {
    templateData.elementsDisposables.clear();
    const stat = element instanceof Array ? element[element.length - 1] : element;
    const file = stat.value;
    const name = element instanceof Array ? element.map((e) => basenameOrAuthority(e.value.uri)) : basenameOrAuthority(file.uri);
    if (file instanceof BypassedFileCoverage) {
      templateData.bars.setCoverageInfo(void 0);
    } else {
      templateData.elementsDisposables.add(autorun((reader) => {
        stat.value?.didChange.read(reader);
        templateData.bars.setCoverageInfo(file);
      }));
      templateData.bars.setCoverageInfo(file);
    }
    templateData.label.setResource({ resource: file.uri, name }, {
      fileKind: stat.children?.size ? FileKind.FOLDER : FileKind.FILE,
      matches: createMatches(filterData),
      separator: this.labelService.getSeparator(file.uri.scheme, file.uri.authority),
      extraClasses: ["label"]
    });
  }
};
FileCoverageRenderer = FileCoverageRenderer_1 = __decorate([
  __param(1, ILabelService),
  __param(2, IInstantiationService)
], FileCoverageRenderer);
let DeclarationCoverageRenderer = class DeclarationCoverageRenderer2 {
  static {
    __name(this, "DeclarationCoverageRenderer");
  }
  static {
    DeclarationCoverageRenderer_1 = this;
  }
  static {
    this.ID = "N";
  }
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.templateId = DeclarationCoverageRenderer_1.ID;
  }
  /** @inheritdoc */
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    container.classList.add("test-coverage-list-item", "testing-stdtree-container");
    const icon = dom.append(container, dom.$(".state"));
    const label = dom.append(container, dom.$(".label"));
    return {
      container,
      bars: templateDisposables.add(this.instantiationService.createInstance(ManagedTestCoverageBars, { compact: false, container })),
      templateDisposables,
      icon,
      label
    };
  }
  /** @inheritdoc */
  renderElement(node, _index, templateData) {
    this.doRender(node.element, templateData, node.filterData);
  }
  /** @inheritdoc */
  renderCompressedElements(node, _index, templateData) {
    this.doRender(node.element.elements[node.element.elements.length - 1], templateData, node.filterData);
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  /** @inheritdoc */
  doRender(element, templateData, _filterData) {
    const covered = !!element.hits;
    const icon = covered ? testingWasCovered : testingStatesToIcons.get(
      0
      /* TestResultState.Unset */
    );
    templateData.container.classList.toggle("not-covered", !covered);
    templateData.icon.className = `computed-state ${ThemeIcon.asClassName(icon)}`;
    templateData.label.innerText = element.label;
    templateData.bars.setCoverageInfo(element.attributableCoverage());
  }
};
DeclarationCoverageRenderer = DeclarationCoverageRenderer_1 = __decorate([
  __param(0, IInstantiationService)
], DeclarationCoverageRenderer);
class BasicRenderer {
  static {
    __name(this, "BasicRenderer");
  }
  constructor() {
    this.templateId = BasicRenderer.ID;
  }
  static {
    this.ID = "B";
  }
  renderCompressedElements(node, _index, container) {
    this.renderInner(node.element.elements[node.element.elements.length - 1], container);
  }
  renderTemplate(container) {
    return container;
  }
  renderElement(node, index, container) {
    this.renderInner(node.element, container);
  }
  disposeTemplate() {
  }
  renderInner(element, container) {
    container.innerText = element.label;
  }
}
class TestCoverageIdentityProvider {
  static {
    __name(this, "TestCoverageIdentityProvider");
  }
  getId(element) {
    return isFileCoverage(element) ? element.value.uri.toString() : element.id;
  }
}
registerAction2(class TestCoverageChangePerTestFilterAction extends Action2 {
  static {
    __name(this, "TestCoverageChangePerTestFilterAction");
  }
  constructor() {
    super({
      id: "testing.coverageFilterToTest",
      category: Categories.Test,
      title: localize2("testing.changeCoverageFilter", "Filter Coverage by Test"),
      icon: Codicon.filter,
      toggled: {
        icon: Codicon.filterFilled,
        condition: TestingContextKeys.isCoverageFilteredToTest
      },
      menu: [
        { id: MenuId.CommandPalette, when: TestingContextKeys.hasPerTestCoverage },
        { id: MenuId.TestCoverageFilterItem, group: "inline" },
        {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.and(TestingContextKeys.hasPerTestCoverage, ContextKeyExpr.equals(
            "view",
            "workbench.view.testCoverage"
            /* Testing.CoverageViewId */
          )),
          group: "navigation"
        }
      ]
    });
  }
  run(accessor) {
    const coverageService = accessor.get(ITestCoverageService);
    const quickInputService = accessor.get(IQuickInputService);
    const coverage = coverageService.selected.get();
    if (!coverage) {
      return;
    }
    const tests = [...coverage.allPerTestIDs()].map(TestId.fromString);
    const commonPrefix = TestId.getLengthOfCommonPrefix(tests.length, (i) => tests[i]);
    const result = coverage.result;
    const previousSelection = coverageService.filterToTest.get();
    const previousSelectionStr = previousSelection?.toString();
    const items = [
      { label: coverUtils.labels.allTests, id: void 0 },
      { type: "separator" },
      ...tests.map((testId) => ({ label: coverUtils.getLabelForItem(result, testId, commonPrefix), testId }))
    ];
    quickInputService.pick(items, {
      activeItem: items.find((item) => "testId" in item && item.testId?.toString() === previousSelectionStr),
      placeHolder: coverUtils.labels.pickShowCoverage,
      onDidFocus: /* @__PURE__ */ __name((entry) => {
        coverageService.filterToTest.set(entry.testId, void 0);
      }, "onDidFocus")
    }).then((selected) => {
      coverageService.filterToTest.set(selected ? selected.testId : previousSelection, void 0);
    });
  }
});
registerAction2(class TestCoverageChangeSortingAction extends ViewAction {
  static {
    __name(this, "TestCoverageChangeSortingAction");
  }
  constructor() {
    super({
      id: "testing.coverageViewChangeSorting",
      viewId: "workbench.view.testCoverage",
      title: localize2("testing.changeCoverageSort", "Change Sort Order"),
      icon: Codicon.sortPrecedence,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals(
          "view",
          "workbench.view.testCoverage"
          /* Testing.CoverageViewId */
        ),
        group: "navigation",
        order: 1
      }
    });
  }
  runInView(accessor, view) {
    const disposables = new DisposableStore();
    const quickInput = disposables.add(accessor.get(IQuickInputService).createQuickPick());
    const items = [
      { label: localize("testing.coverageSortByLocation", "Sort by Location"), value: 1, description: localize("testing.coverageSortByLocationDescription", "Files are sorted alphabetically, declarations are sorted by position") },
      { label: localize("testing.coverageSortByCoverage", "Sort by Coverage"), value: 0, description: localize("testing.coverageSortByCoverageDescription", "Files and declarations are sorted by total coverage") },
      { label: localize("testing.coverageSortByName", "Sort by Name"), value: 2, description: localize("testing.coverageSortByNameDescription", "Files and declarations are sorted alphabetically") }
    ];
    quickInput.placeholder = localize("testing.coverageSortPlaceholder", "Sort the Test Coverage view...");
    quickInput.items = items;
    quickInput.show();
    disposables.add(quickInput.onDidHide(() => disposables.dispose()));
    disposables.add(quickInput.onDidAccept(() => {
      const picked = quickInput.selectedItems[0]?.value;
      if (picked !== void 0) {
        view.sortOrder.set(picked, void 0);
        quickInput.dispose();
      }
    }));
  }
});
registerAction2(class TestCoverageCollapseAllAction extends ViewAction {
  static {
    __name(this, "TestCoverageCollapseAllAction");
  }
  constructor() {
    super({
      id: "testing.coverageViewCollapseAll",
      viewId: "workbench.view.testCoverage",
      title: localize2("testing.coverageCollapseAll", "Collapse All Coverage"),
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals(
          "view",
          "workbench.view.testCoverage"
          /* Testing.CoverageViewId */
        ),
        group: "navigation",
        order: 2
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});
export {
  TestCoverageView
};
//# sourceMappingURL=testCoverageView.js.map
