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
var PreferencesEditor_1;
import "./media/preferencesEditor.css";
import * as DOM from "../../../../base/browser/dom.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { Event } from "../../../../base/common/event.js";
import { getInputBoxStyle } from "../../../../platform/theme/browser/defaultStyles.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { CONTEXT_PREFERENCES_SEARCH_FOCUS } from "../common/preferences.js";
import { settingsTextInputBorder } from "../common/settingsEditorColorRegistry.js";
import { SearchWidget } from "./preferencesWidgets.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions } from "./preferencesEditorRegistry.js";
import { Action } from "../../../../base/common/actions.js";
import { MutableDisposable } from "../../../../base/common/lifecycle.js";
class PreferenceTabAction extends Action {
  static {
    __name(this, "PreferenceTabAction");
  }
  constructor(descriptor, actionCallback) {
    super(descriptor.id, descriptor.title, "", true, actionCallback);
    this.descriptor = descriptor;
  }
}
let PreferencesEditor = class PreferencesEditor2 extends EditorPane {
  static {
    __name(this, "PreferencesEditor");
  }
  static {
    PreferencesEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.preferences";
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService, contextKeyService) {
    super(PreferencesEditor_1.ID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.editorPanesRegistry = Registry.as(Extensions.PreferencesEditorPane);
    this.preferencesTabActions = [];
    this.preferencesEditorPane = this._register(new MutableDisposable());
    this.searchFocusContextKey = CONTEXT_PREFERENCES_SEARCH_FOCUS.bindTo(contextKeyService);
    this.element = DOM.$(".preferences-editor");
    const headerContainer = DOM.append(this.element, DOM.$(".preferences-editor-header"));
    const searchContainer = DOM.append(headerContainer, DOM.$(".search-container"));
    this.searchWidget = this._register(this.instantiationService.createInstance(SearchWidget, searchContainer, {
      focusKey: this.searchFocusContextKey,
      inputBoxStyles: getInputBoxStyle({
        inputBorder: settingsTextInputBorder
      })
    }));
    this._register(Event.debounce(this.searchWidget.onDidChange, () => void 0, 300)(() => {
      this.preferencesEditorPane.value?.search(this.searchWidget.getValue());
    }));
    const preferencesTabsContainer = DOM.append(headerContainer, DOM.$(".preferences-tabs-container"));
    this.preferencesTabActionBar = this._register(new ActionBar(preferencesTabsContainer, {
      orientation: 0,
      focusOnlyEnabledItems: true,
      ariaLabel: localize("preferencesTabSwitcherBarAriaLabel", "Preferences Tab Switcher"),
      ariaRole: "tablist"
    }));
    this.onDidChangePreferencesEditorPane(this.editorPanesRegistry.getPreferencesEditorPanes(), []);
    this._register(this.editorPanesRegistry.onDidRegisterPreferencesEditorPanes((descriptors) => this.onDidChangePreferencesEditorPane(descriptors, [])));
    this._register(this.editorPanesRegistry.onDidDeregisterPreferencesEditorPanes((descriptors) => this.onDidChangePreferencesEditorPane([], descriptors)));
    this.bodyElement = DOM.append(this.element, DOM.$(".preferences-editor-body"));
  }
  createEditor(parent) {
    DOM.append(parent, this.element);
  }
  layout(dimension) {
    this.dimension = dimension;
    this.searchWidget.layout(dimension);
    this.searchWidget.inputBox.inputElement.style.paddingRight = `12px`;
    this.preferencesEditorPane.value?.layout(new DOM.Dimension(
      this.bodyElement.clientWidth,
      dimension.height - 87
      /* header height */
    ));
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    if (this.preferencesTabActions.length) {
      this.onDidSelectPreferencesEditorPane(this.preferencesTabActions[0].id);
    }
  }
  onDidChangePreferencesEditorPane(toAdd, toRemove) {
    for (const desc of toRemove) {
      const index = this.preferencesTabActions.findIndex((action) => action.id === desc.id);
      if (index !== -1) {
        this.preferencesTabActionBar.pull(index);
        this.preferencesTabActions[index].dispose();
        this.preferencesTabActions.splice(index, 1);
      }
    }
    if (toAdd.length > 0) {
      const all = this.editorPanesRegistry.getPreferencesEditorPanes();
      for (const desc of toAdd) {
        const index = all.findIndex((action) => action.id === desc.id);
        if (index !== -1) {
          const action = new PreferenceTabAction(desc, () => this.onDidSelectPreferencesEditorPane(desc.id));
          this.preferencesTabActions.splice(index, 0, action);
          this.preferencesTabActionBar.push(action, { index });
        }
      }
    }
  }
  onDidSelectPreferencesEditorPane(id) {
    let selectedAction;
    for (const action of this.preferencesTabActions) {
      if (action.id === id) {
        action.checked = true;
        selectedAction = action;
      } else {
        action.checked = false;
      }
    }
    if (selectedAction) {
      this.searchWidget.inputBox.setPlaceHolder(localize("FullTextSearchPlaceholder", "Search {0}", selectedAction.descriptor.title));
      this.searchWidget.inputBox.setAriaLabel(localize("FullTextSearchPlaceholder", "Search {0}", selectedAction.descriptor.title));
    }
    this.renderBody(selectedAction?.descriptor);
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
  renderBody(descriptor) {
    this.preferencesEditorPane.value = void 0;
    DOM.clearNode(this.bodyElement);
    if (descriptor) {
      const editorPane = this.instantiationService.createInstance(descriptor.ctorDescriptor.ctor);
      this.preferencesEditorPane.value = editorPane;
      this.bodyElement.appendChild(editorPane.getDomNode());
    }
  }
  dispose() {
    super.dispose();
    this.preferencesTabActions.forEach((action) => action.dispose());
  }
};
PreferencesEditor = PreferencesEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService),
  __param(5, IContextKeyService)
], PreferencesEditor);
export {
  PreferencesEditor
};
//# sourceMappingURL=preferencesEditor.js.map
