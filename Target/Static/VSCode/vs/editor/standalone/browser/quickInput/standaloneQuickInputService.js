var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./standaloneQuickInput.css";
import { Event } from "../../../../base/common/event.js";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, OverlayWidgetPositionPreference } from "../../../browser/editorBrowser.js";
import { EditorContributionInstantiation, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IQuickInputService, IQuickPickItem, IQuickPick, IInputBox, IQuickNavigateConfiguration, IPickOptions, QuickPickInput, IInputOptions, IQuickWidget } from "../../../../platform/quickinput/common/quickInput.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { EditorScopedLayoutService } from "../standaloneLayoutService.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { QuickInputController, IQuickInputControllerHost } from "../../../../platform/quickinput/browser/quickInputController.js";
import { QuickInputService } from "../../../../platform/quickinput/browser/quickInputService.js";
import { createSingleCallFunction } from "../../../../base/common/functional.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
let EditorScopedQuickInputService = class extends QuickInputService {
  static {
    __name(this, "EditorScopedQuickInputService");
  }
  host = void 0;
  constructor(editor, instantiationService, contextKeyService, themeService, codeEditorService, configurationService) {
    super(
      instantiationService,
      contextKeyService,
      themeService,
      new EditorScopedLayoutService(editor.getContainerDomNode(), codeEditorService),
      configurationService
    );
    const contribution = QuickInputEditorContribution.get(editor);
    if (contribution) {
      const widget = contribution.widget;
      this.host = {
        _serviceBrand: void 0,
        get mainContainer() {
          return widget.getDomNode();
        },
        getContainer() {
          return widget.getDomNode();
        },
        whenContainerStylesLoaded() {
          return void 0;
        },
        get containers() {
          return [widget.getDomNode()];
        },
        get activeContainer() {
          return widget.getDomNode();
        },
        get mainContainerDimension() {
          return editor.getLayoutInfo();
        },
        get activeContainerDimension() {
          return editor.getLayoutInfo();
        },
        get onDidLayoutMainContainer() {
          return editor.onDidLayoutChange;
        },
        get onDidLayoutActiveContainer() {
          return editor.onDidLayoutChange;
        },
        get onDidLayoutContainer() {
          return Event.map(editor.onDidLayoutChange, (dimension) => ({ container: widget.getDomNode(), dimension }));
        },
        get onDidChangeActiveContainer() {
          return Event.None;
        },
        get onDidAddContainer() {
          return Event.None;
        },
        get mainContainerOffset() {
          return { top: 0, quickPickTop: 0 };
        },
        get activeContainerOffset() {
          return { top: 0, quickPickTop: 0 };
        },
        focus: /* @__PURE__ */ __name(() => editor.focus(), "focus")
      };
    } else {
      this.host = void 0;
    }
  }
  createController() {
    return super.createController(this.host);
  }
};
EditorScopedQuickInputService = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, IConfigurationService)
], EditorScopedQuickInputService);
let StandaloneQuickInputService = class {
  constructor(instantiationService, codeEditorService) {
    this.instantiationService = instantiationService;
    this.codeEditorService = codeEditorService;
  }
  static {
    __name(this, "StandaloneQuickInputService");
  }
  mapEditorToService = /* @__PURE__ */ new Map();
  get activeService() {
    const editor = this.codeEditorService.getFocusedCodeEditor();
    if (!editor) {
      throw new Error("Quick input service needs a focused editor to work.");
    }
    let quickInputService = this.mapEditorToService.get(editor);
    if (!quickInputService) {
      const newQuickInputService = quickInputService = this.instantiationService.createInstance(EditorScopedQuickInputService, editor);
      this.mapEditorToService.set(editor, quickInputService);
      createSingleCallFunction(editor.onDidDispose)(() => {
        newQuickInputService.dispose();
        this.mapEditorToService.delete(editor);
      });
    }
    return quickInputService;
  }
  get currentQuickInput() {
    return this.activeService.currentQuickInput;
  }
  get quickAccess() {
    return this.activeService.quickAccess;
  }
  get backButton() {
    return this.activeService.backButton;
  }
  get onShow() {
    return this.activeService.onShow;
  }
  get onHide() {
    return this.activeService.onHide;
  }
  pick(picks, options, token = CancellationToken.None) {
    return this.activeService.pick(picks, options, token);
  }
  input(options, token) {
    return this.activeService.input(options, token);
  }
  createQuickPick(options = { useSeparators: false }) {
    return this.activeService.createQuickPick(options);
  }
  createInputBox() {
    return this.activeService.createInputBox();
  }
  createQuickWidget() {
    return this.activeService.createQuickWidget();
  }
  focus() {
    return this.activeService.focus();
  }
  toggle() {
    return this.activeService.toggle();
  }
  navigate(next, quickNavigate) {
    return this.activeService.navigate(next, quickNavigate);
  }
  accept() {
    return this.activeService.accept();
  }
  back() {
    return this.activeService.back();
  }
  cancel() {
    return this.activeService.cancel();
  }
  setAlignment(alignment) {
    return this.activeService.setAlignment(alignment);
  }
  toggleHover() {
    return this.activeService.toggleHover();
  }
};
StandaloneQuickInputService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ICodeEditorService)
], StandaloneQuickInputService);
class QuickInputEditorContribution {
  constructor(editor) {
    this.editor = editor;
    this.widget = new QuickInputEditorWidget(this.editor);
  }
  static {
    __name(this, "QuickInputEditorContribution");
  }
  static ID = "editor.controller.quickInput";
  static get(editor) {
    return editor.getContribution(QuickInputEditorContribution.ID);
  }
  widget;
  dispose() {
    this.widget.dispose();
  }
}
class QuickInputEditorWidget {
  constructor(codeEditor) {
    this.codeEditor = codeEditor;
    this.domNode = document.createElement("div");
    this.codeEditor.addOverlayWidget(this);
  }
  static {
    __name(this, "QuickInputEditorWidget");
  }
  static ID = "editor.contrib.quickInputWidget";
  domNode;
  getId() {
    return QuickInputEditorWidget.ID;
  }
  getDomNode() {
    return this.domNode;
  }
  getPosition() {
    return { preference: OverlayWidgetPositionPreference.TOP_CENTER };
  }
  dispose() {
    this.codeEditor.removeOverlayWidget(this);
  }
}
registerEditorContribution(QuickInputEditorContribution.ID, QuickInputEditorContribution, EditorContributionInstantiation.Lazy);
export {
  QuickInputEditorContribution,
  QuickInputEditorWidget,
  StandaloneQuickInputService
};
//# sourceMappingURL=standaloneQuickInputService.js.map
