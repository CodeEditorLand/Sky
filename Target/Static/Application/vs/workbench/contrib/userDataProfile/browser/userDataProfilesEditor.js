var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/userDataProfilesEditor.css";
import { $, addDisposableListener, append, clearNode, Dimension, EventHelper, EventType, trackFocus } from "../../../../base/browser/dom.js";
import { Action, Separator, SubmenuAction, toAction } from "../../../../base/common/actions.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { IContextMenuService, IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { defaultUserDataProfileIcon, IUserDataProfileManagementService, IUserDataProfileService, PROFILE_FILTER } from "../../../services/userDataProfile/common/userDataProfile.js";
import { Sizing, SplitView } from "../../../../base/browser/ui/splitview/splitview.js";
import { Button, ButtonBar, ButtonWithDropdown } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles, defaultSelectBoxStyles, getInputBoxStyle, getListStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { editorBackground, foreground, registerColor } from "../../../../platform/theme/common/colorRegistry.js";
import { PANEL_BORDER } from "../../../common/theme.js";
import { WorkbenchAsyncDataTree, WorkbenchList, WorkbenchTable } from "../../../../platform/list/browser/listService.js";
import { CachedListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { InputBox } from "../../../../base/browser/ui/inputbox/inputBox.js";
import { Checkbox } from "../../../../base/browser/ui/toggle/toggle.js";
import { DEFAULT_ICON, ICONS } from "../../../services/userDataProfile/common/userDataProfileIcons.js";
import { WorkbenchIconSelectBox } from "../../../services/userDataProfile/browser/iconSelectBox.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { IHoverService, WorkbenchHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { SelectBox } from "../../../../base/browser/ui/selectBox/selectBox.js";
import { URI } from "../../../../base/common/uri.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { isString, isUndefined } from "../../../../base/common/types.js";
import { basename } from "../../../../base/common/resources.js";
import { RenderIndentGuides } from "../../../../base/browser/ui/tree/abstractTree.js";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "../../../browser/labels.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { AbstractUserDataProfileElement, isProfileResourceChildElement, isProfileResourceTypeElement, NewProfileElement, UserDataProfileElement, UserDataProfilesEditorModel } from "./userDataProfilesEditorModel.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { createInstantHoverDelegate, getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Radio } from "../../../../base/browser/ui/radio/radio.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { settingsTextInputBorder } from "../../preferences/common/settingsEditorColorRegistry.js";
import { renderMarkdown } from "../../../../base/browser/markdownRenderer.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { Schemas } from "../../../../base/common/network.js";
import { posix, win32 } from "../../../../base/common/path.js";
import { hasDriveLetter } from "../../../../base/common/extpath.js";
import { normalizeDriveLetter } from "../../../../base/common/labels.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { DropdownMenuActionViewItem } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
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
var UserDataProfilesEditor_1;
var ExistingProfileResourceTreeRenderer_1;
var NewProfileResourceTreeRenderer_1;
var ProfileResourceChildTreeItemRenderer_1;
var WorkspaceUriHostColumnRenderer_1;
var WorkspaceUriPathColumnRenderer_1;
var WorkspaceUriActionsColumnRenderer_1;
var UserDataProfilesEditorInput_1;
const editIcon = registerIcon("profiles-editor-edit-folder", Codicon.edit, localize("editIcon", "Icon for the edit folder icon in the profiles editor."));
const removeIcon = registerIcon("profiles-editor-remove-folder", Codicon.close, localize("removeIcon", "Icon for the remove folder icon in the profiles editor."));
const profilesSashBorder = registerColor("profiles.sashBorder", PANEL_BORDER, localize("profilesSashBorder", "The color of the Profiles editor splitview sash border."));
const listStyles = getListStyles({
  listActiveSelectionBackground: editorBackground,
  listActiveSelectionForeground: foreground,
  listFocusAndSelectionBackground: editorBackground,
  listFocusAndSelectionForeground: foreground,
  listFocusBackground: editorBackground,
  listFocusForeground: foreground,
  listHoverForeground: foreground,
  listHoverBackground: editorBackground,
  listHoverOutline: editorBackground,
  listFocusOutline: editorBackground,
  listInactiveSelectionBackground: editorBackground,
  listInactiveSelectionForeground: foreground,
  listInactiveFocusBackground: editorBackground,
  listInactiveFocusOutline: editorBackground,
  treeIndentGuidesStroke: void 0,
  treeInactiveIndentGuidesStroke: void 0,
  tableOddRowsBackgroundColor: editorBackground
});
let UserDataProfilesEditor = class UserDataProfilesEditor2 extends EditorPane {
  static {
    __name(this, "UserDataProfilesEditor");
  }
  static {
    UserDataProfilesEditor_1 = this;
  }
  static {
    this.ID = "workbench.editor.userDataProfiles";
  }
  constructor(group, telemetryService, themeService, storageService, quickInputService, fileDialogService, contextMenuService, instantiationService) {
    super(UserDataProfilesEditor_1.ID, group, telemetryService, themeService, storageService);
    this.quickInputService = quickInputService;
    this.fileDialogService = fileDialogService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.templates = [];
  }
  layout(dimension, position) {
    if (this.container && this.splitView) {
      const height = dimension.height - 20;
      this.splitView.layout(this.container?.clientWidth, height);
      this.splitView.el.style.height = `${height}px`;
    }
  }
  createEditor(parent) {
    this.container = append(parent, $(".profiles-editor"));
    const sidebarView = append(this.container, $(".sidebar-view"));
    const sidebarContainer = append(sidebarView, $(".sidebar-container"));
    const contentsView = append(this.container, $(".contents-view"));
    const contentsContainer = append(contentsView, $(".contents-container"));
    this.profileWidget = this._register(this.instantiationService.createInstance(ProfileWidget, contentsContainer));
    this.splitView = new SplitView(this.container, {
      orientation: 1,
      proportionalLayout: true
    });
    this.renderSidebar(sidebarContainer);
    this.splitView.addView({
      onDidChange: Event.None,
      element: sidebarView,
      minimumSize: 200,
      maximumSize: 350,
      layout: /* @__PURE__ */ __name((width, _, height) => {
        sidebarView.style.width = `${width}px`;
        if (height && this.profilesList) {
          const listHeight = height - 40 - 15;
          this.profilesList.getHTMLElement().style.height = `${listHeight}px`;
          this.profilesList.layout(listHeight, width);
        }
      }, "layout")
    }, 300, void 0, true);
    this.splitView.addView({
      onDidChange: Event.None,
      element: contentsView,
      minimumSize: 550,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: /* @__PURE__ */ __name((width, _, height) => {
        contentsView.style.width = `${width}px`;
        if (height) {
          this.profileWidget?.layout(new Dimension(width, height));
        }
      }, "layout")
    }, Sizing.Distribute, void 0, true);
    this.registerListeners();
    this.updateStyles();
  }
  updateStyles() {
    const borderColor = this.theme.getColor(profilesSashBorder);
    this.splitView?.style({ separatorBorder: borderColor });
  }
  renderSidebar(parent) {
    this.renderNewProfileButton(append(parent, $(".new-profile-button")));
    const renderer = this.instantiationService.createInstance(ProfileElementRenderer);
    const delegate = new ProfileElementDelegate();
    this.profilesList = this._register(this.instantiationService.createInstance(WorkbenchList, "ProfilesList", append(parent, $(".profiles-list")), delegate, [renderer], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(profileElement) {
          return profileElement?.name ?? "";
        },
        getWidgetAriaLabel() {
          return localize("profiles", "Profiles");
        }
      },
      openOnSingleClick: true,
      identityProvider: {
        getId(e) {
          if (e instanceof UserDataProfileElement) {
            return e.profile.id;
          }
          return e.name;
        }
      },
      alwaysConsumeMouseWheel: false
    }));
  }
  renderNewProfileButton(parent) {
    const button = this._register(new ButtonWithDropdown(parent, {
      actions: {
        getActions: /* @__PURE__ */ __name(() => {
          const actions = [];
          if (this.templates.length) {
            actions.push(new SubmenuAction("from.template", localize("from template", "From Template"), this.getCreateFromTemplateActions()));
            actions.push(new Separator());
          }
          actions.push(toAction({
            id: "importProfile",
            label: localize("importProfile", "Import Profile..."),
            run: /* @__PURE__ */ __name(() => this.importProfile(), "run")
          }));
          return actions;
        }, "getActions")
      },
      addPrimaryActionToDropdown: false,
      contextMenuProvider: this.contextMenuService,
      supportIcons: true,
      ...defaultButtonStyles
    }));
    button.label = localize("newProfile", "New Profile");
    this._register(button.onDidClick((e) => this.createNewProfile()));
  }
  getCreateFromTemplateActions() {
    return this.templates.map((template) => toAction({
      id: `template:${template.url}`,
      label: template.name,
      run: /* @__PURE__ */ __name(() => this.createNewProfile(URI.parse(template.url)), "run")
    }));
  }
  registerListeners() {
    if (this.profilesList) {
      this._register(this.profilesList.onDidChangeSelection((e) => {
        const [element] = e.elements;
        if (element instanceof AbstractUserDataProfileElement) {
          this.profileWidget?.render(element);
        }
      }));
      this._register(this.profilesList.onContextMenu((e) => {
        const actions = [];
        if (!e.element) {
          actions.push(...this.getTreeContextMenuActions());
        }
        if (e.element instanceof AbstractUserDataProfileElement) {
          actions.push(...e.element.actions[1]);
        }
        if (actions.length) {
          this.contextMenuService.showContextMenu({
            getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
            getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
            getActionsContext: /* @__PURE__ */ __name(() => e.element, "getActionsContext")
          });
        }
      }));
      this._register(this.profilesList.onMouseDblClick((e) => {
        if (!e.element) {
          this.createNewProfile();
        }
      }));
    }
  }
  getTreeContextMenuActions() {
    const actions = [];
    actions.push(toAction({
      id: "newProfile",
      label: localize("newProfile", "New Profile"),
      run: /* @__PURE__ */ __name(() => this.createNewProfile(), "run")
    }));
    const templateActions = this.getCreateFromTemplateActions();
    if (templateActions.length) {
      actions.push(new SubmenuAction("from.template", localize("new from template", "New Profile From Template"), templateActions));
    }
    actions.push(new Separator());
    actions.push(toAction({
      id: "importProfile",
      label: localize("importProfile", "Import Profile..."),
      run: /* @__PURE__ */ __name(() => this.importProfile(), "run")
    }));
    return actions;
  }
  async importProfile() {
    const disposables = new DisposableStore();
    const quickPick = disposables.add(this.quickInputService.createQuickPick());
    const updateQuickPickItems = /* @__PURE__ */ __name((value) => {
      const quickPickItems = [];
      if (value) {
        quickPickItems.push({ label: quickPick.value, description: localize("import from url", "Import from URL") });
      }
      quickPickItems.push({ label: localize("import from file", "Select File...") });
      quickPick.items = quickPickItems;
    }, "updateQuickPickItems");
    quickPick.title = localize("import profile quick pick title", "Import from Profile Template...");
    quickPick.placeholder = localize("import profile placeholder", "Provide Profile Template URL");
    quickPick.ignoreFocusOut = true;
    disposables.add(quickPick.onDidChangeValue(updateQuickPickItems));
    updateQuickPickItems();
    quickPick.matchOnLabel = false;
    quickPick.matchOnDescription = false;
    disposables.add(quickPick.onDidAccept(async () => {
      quickPick.hide();
      const selectedItem = quickPick.selectedItems[0];
      if (!selectedItem) {
        return;
      }
      const url = selectedItem.label === quickPick.value ? URI.parse(quickPick.value) : await this.getProfileUriFromFileSystem();
      if (url) {
        this.createNewProfile(url);
      }
    }));
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    quickPick.show();
  }
  async createNewProfile(copyFrom) {
    await this.model?.createNewProfile(copyFrom);
  }
  selectProfile(profile) {
    const index = this.model?.profiles.findIndex((p) => p instanceof UserDataProfileElement && p.profile.id === profile.id);
    if (index !== void 0 && index >= 0) {
      this.profilesList?.setSelection([index]);
    }
  }
  async getProfileUriFromFileSystem() {
    const profileLocation = await this.fileDialogService.showOpenDialog({
      canSelectFolders: false,
      canSelectFiles: true,
      canSelectMany: false,
      filters: PROFILE_FILTER,
      title: localize("import profile dialog", "Select Profile Template File")
    });
    if (!profileLocation) {
      return null;
    }
    return profileLocation[0];
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    this.model = await input.resolve();
    this.model.getTemplates().then((templates) => {
      this.templates = templates;
      if (this.profileWidget) {
        this.profileWidget.templates = templates;
      }
    });
    this.updateProfilesList();
    this._register(this.model.onDidChange((element) => this.updateProfilesList(element)));
  }
  focus() {
    super.focus();
    this.profilesList?.domFocus();
  }
  updateProfilesList(elementToSelect) {
    if (!this.model) {
      return;
    }
    const currentSelectionIndex = this.profilesList?.getSelection()?.[0];
    const currentSelection = currentSelectionIndex !== void 0 ? this.profilesList?.element(currentSelectionIndex) : void 0;
    this.profilesList?.splice(0, this.profilesList.length, this.model.profiles);
    if (elementToSelect) {
      this.profilesList?.setSelection([this.model.profiles.indexOf(elementToSelect)]);
    } else if (currentSelection) {
      if (!this.model.profiles.includes(currentSelection)) {
        const elementToSelect2 = this.model.profiles.find((profile) => profile.name === currentSelection.name) ?? this.model.profiles[0];
        if (elementToSelect2) {
          this.profilesList?.setSelection([this.model.profiles.indexOf(elementToSelect2)]);
        }
      }
    } else {
      const elementToSelect2 = this.model.profiles.find((profile) => profile.active) ?? this.model.profiles[0];
      if (elementToSelect2) {
        this.profilesList?.setSelection([this.model.profiles.indexOf(elementToSelect2)]);
      }
    }
  }
};
UserDataProfilesEditor = UserDataProfilesEditor_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IQuickInputService),
  __param(5, IFileDialogService),
  __param(6, IContextMenuService),
  __param(7, IInstantiationService)
], UserDataProfilesEditor);
class ProfileElementDelegate {
  static {
    __name(this, "ProfileElementDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId() {
    return "profileListElement";
  }
}
let ProfileElementRenderer = class ProfileElementRenderer2 {
  static {
    __name(this, "ProfileElementRenderer");
  }
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.templateId = "profileListElement";
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container.classList.add("profile-list-item");
    const icon = append(container, $(".profile-list-item-icon"));
    const label = append(container, $(".profile-list-item-label"));
    const dirty = append(container, $(`span${ThemeIcon.asCSSSelector(Codicon.circleFilled)}`));
    const description = append(container, $(".profile-list-item-description"));
    append(description, $(`span${ThemeIcon.asCSSSelector(Codicon.check)}`), $("span", void 0, localize("activeProfile", "Active")));
    const actionsContainer = append(container, $(".profile-tree-item-actions-container"));
    const actionBar = disposables.add(this.instantiationService.createInstance(WorkbenchToolBar, actionsContainer, {
      hoverDelegate: disposables.add(createInstantHoverDelegate()),
      highlightToggledItems: true
    }));
    return { label, icon, dirty, description, actionBar, disposables, elementDisposables };
  }
  renderElement(element, index, templateData) {
    templateData.elementDisposables.clear();
    templateData.label.textContent = element.name;
    templateData.label.classList.toggle("new-profile", element instanceof NewProfileElement);
    templateData.icon.className = ThemeIcon.asClassName(element.icon ? ThemeIcon.fromId(element.icon) : DEFAULT_ICON);
    templateData.dirty.classList.toggle("hide", !(element instanceof NewProfileElement));
    templateData.description.classList.toggle("hide", !element.active);
    templateData.elementDisposables.add(element.onDidChange((e) => {
      if (e.name) {
        templateData.label.textContent = element.name;
      }
      if (e.icon) {
        if (element.icon) {
          templateData.icon.className = ThemeIcon.asClassName(ThemeIcon.fromId(element.icon));
        } else {
          templateData.icon.className = "hide";
        }
      }
      if (e.active) {
        templateData.description.classList.toggle("hide", !element.active);
      }
    }));
    const setActions = /* @__PURE__ */ __name(() => templateData.actionBar.setActions(element.actions[0].filter((a) => a.enabled), element.actions[1].filter((a) => a.enabled)), "setActions");
    setActions();
    const events = [];
    for (const action of element.actions.flat()) {
      if (action instanceof Action) {
        events.push(action.onDidChange);
      }
    }
    templateData.elementDisposables.add(Event.any(...events)((e) => {
      if (e.enabled !== void 0) {
        setActions();
      }
    }));
  }
  disposeElement(element, index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.elementDisposables.dispose();
  }
};
ProfileElementRenderer = __decorate([
  __param(0, IInstantiationService)
], ProfileElementRenderer);
let ProfileWidget = class ProfileWidget2 extends Disposable {
  static {
    __name(this, "ProfileWidget");
  }
  set templates(templates) {
    this.copyFromProfileRenderer.setTemplates(templates);
    this.profileTree.rerender();
  }
  constructor(parent, editorProgressService, instantiationService) {
    super();
    this.editorProgressService = editorProgressService;
    this.instantiationService = instantiationService;
    this._profileElement = this._register(new MutableDisposable());
    this.layoutParticipants = [];
    const header = append(parent, $(".profile-header"));
    const title = append(header, $(".profile-title-container"));
    this.profileTitle = append(title, $(""));
    const body = append(parent, $(".profile-body"));
    const delegate = new ProfileTreeDelegate();
    const contentsRenderer = this._register(this.instantiationService.createInstance(ContentsProfileRenderer));
    const associationsRenderer = this._register(this.instantiationService.createInstance(ProfileWorkspacesRenderer));
    this.layoutParticipants.push(associationsRenderer);
    this.copyFromProfileRenderer = this._register(this.instantiationService.createInstance(CopyFromProfileRenderer));
    this.profileTreeContainer = append(body, $(".profile-tree"));
    this.profileTree = this._register(this.instantiationService.createInstance(WorkbenchAsyncDataTree, "ProfileEditor-Tree", this.profileTreeContainer, delegate, [
      this._register(this.instantiationService.createInstance(ProfileNameRenderer)),
      this._register(this.instantiationService.createInstance(ProfileIconRenderer)),
      this._register(this.instantiationService.createInstance(UseForCurrentWindowPropertyRenderer)),
      this._register(this.instantiationService.createInstance(UseAsDefaultProfileRenderer)),
      this.copyFromProfileRenderer,
      contentsRenderer,
      associationsRenderer
    ], this.instantiationService.createInstance(ProfileTreeDataSource), {
      multipleSelectionSupport: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(element) {
          return element?.element ?? "";
        },
        getWidgetAriaLabel() {
          return "";
        }
      },
      identityProvider: {
        getId(element) {
          return element.element;
        }
      },
      expandOnlyOnTwistieClick: true,
      renderIndentGuides: RenderIndentGuides.None,
      enableStickyScroll: false,
      openOnSingleClick: false,
      setRowLineHeight: false,
      supportDynamicHeights: true,
      alwaysConsumeMouseWheel: false
    }));
    this.profileTree.style(listStyles);
    this._register(contentsRenderer.onDidChangeContentHeight((e) => this.profileTree.updateElementHeight(e, void 0)));
    this._register(associationsRenderer.onDidChangeContentHeight((e) => this.profileTree.updateElementHeight(e, void 0)));
    this._register(contentsRenderer.onDidChangeSelection((e) => {
      if (e.selected) {
        this.profileTree.setFocus([]);
        this.profileTree.setSelection([]);
      }
    }));
    this._register(this.profileTree.onDidChangeContentHeight((e) => {
      if (this.dimension) {
        this.layout(this.dimension);
      }
    }));
    this._register(this.profileTree.onDidChangeSelection((e) => {
      if (e.elements.length) {
        contentsRenderer.clearSelection();
      }
    }));
    this.buttonContainer = append(body, $(".profile-row-container.profile-button-container"));
  }
  layout(dimension) {
    this.dimension = dimension;
    const treeContentHeight = this.profileTree.contentHeight;
    const height = Math.min(treeContentHeight, dimension.height - (this._profileElement.value?.element instanceof NewProfileElement ? 116 : 54));
    this.profileTreeContainer.style.height = `${height}px`;
    this.profileTree.layout(height, dimension.width);
    for (const participant of this.layoutParticipants) {
      participant.layout();
    }
  }
  render(profileElement) {
    if (this._profileElement.value?.element === profileElement) {
      return;
    }
    if (this._profileElement.value?.element instanceof UserDataProfileElement) {
      this._profileElement.value.element.reset();
    }
    this.profileTree.setInput(profileElement);
    const disposables = new DisposableStore();
    this._profileElement.value = { element: profileElement, dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose") };
    this.profileTitle.textContent = profileElement.name;
    disposables.add(profileElement.onDidChange((e) => {
      if (e.name) {
        this.profileTitle.textContent = profileElement.name;
      }
    }));
    const [primaryTitleButtons, secondatyTitleButtons] = profileElement.titleButtons;
    if (primaryTitleButtons?.length || secondatyTitleButtons?.length) {
      this.buttonContainer.classList.remove("hide");
      if (secondatyTitleButtons?.length) {
        for (const action of secondatyTitleButtons) {
          const button = disposables.add(new Button(this.buttonContainer, {
            ...defaultButtonStyles,
            secondary: true
          }));
          button.label = action.label;
          button.enabled = action.enabled;
          disposables.add(button.onDidClick(() => this.editorProgressService.showWhile(action.run())));
          disposables.add(action.onDidChange((e) => {
            if (!isUndefined(e.enabled)) {
              button.enabled = action.enabled;
            }
            if (!isUndefined(e.label)) {
              button.label = action.label;
            }
          }));
        }
      }
      if (primaryTitleButtons?.length) {
        for (const action of primaryTitleButtons) {
          const button = disposables.add(new Button(this.buttonContainer, {
            ...defaultButtonStyles
          }));
          button.label = action.label;
          button.enabled = action.enabled;
          disposables.add(button.onDidClick(() => this.editorProgressService.showWhile(action.run())));
          disposables.add(action.onDidChange((e) => {
            if (!isUndefined(e.enabled)) {
              button.enabled = action.enabled;
            }
            if (!isUndefined(e.label)) {
              button.label = action.label;
            }
          }));
          disposables.add(profileElement.onDidChange((e) => {
            if (e.message) {
              button.setTitle(profileElement.message ?? action.label);
              button.element.classList.toggle("error", !!profileElement.message);
            }
          }));
        }
      }
    } else {
      this.buttonContainer.classList.add("hide");
    }
    if (profileElement instanceof NewProfileElement) {
      this.profileTree.focusFirst();
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
};
ProfileWidget = __decorate([
  __param(1, IEditorProgressService),
  __param(2, IInstantiationService)
], ProfileWidget);
class ProfileTreeDelegate extends CachedListVirtualDelegate {
  static {
    __name(this, "ProfileTreeDelegate");
  }
  getTemplateId({ element }) {
    return element;
  }
  hasDynamicHeight({ element }) {
    return element === "contents" || element === "workspaces";
  }
  estimateHeight({ element, root }) {
    switch (element) {
      case "name":
        return 72;
      case "icon":
        return 68;
      case "copyFrom":
        return 90;
      case "useForCurrent":
      case "useAsDefault":
        return 68;
      case "contents":
        return 258;
      case "workspaces":
        return (root.workspaces ? root.workspaces.length * 24 + 30 : 0) + 112;
    }
  }
}
class ProfileTreeDataSource {
  static {
    __name(this, "ProfileTreeDataSource");
  }
  hasChildren(element) {
    return element instanceof AbstractUserDataProfileElement;
  }
  async getChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      const children = [];
      if (element instanceof NewProfileElement) {
        children.push({ element: "name", root: element });
        children.push({ element: "icon", root: element });
        children.push({ element: "copyFrom", root: element });
        children.push({ element: "contents", root: element });
      } else if (element instanceof UserDataProfileElement) {
        if (!element.profile.isDefault) {
          children.push({ element: "name", root: element });
          children.push({ element: "icon", root: element });
        }
        children.push({ element: "useAsDefault", root: element });
        children.push({ element: "contents", root: element });
        children.push({ element: "workspaces", root: element });
      }
      return children;
    }
    return [];
  }
}
class ProfileContentTreeElementDelegate {
  static {
    __name(this, "ProfileContentTreeElementDelegate");
  }
  getTemplateId(element) {
    if (!element.element.resourceType) {
      return ProfileResourceChildTreeItemRenderer.TEMPLATE_ID;
    }
    if (element.root instanceof NewProfileElement) {
      return NewProfileResourceTreeRenderer.TEMPLATE_ID;
    }
    return ExistingProfileResourceTreeRenderer.TEMPLATE_ID;
  }
  getHeight(element) {
    return 24;
  }
}
let ProfileResourceTreeDataSource = class ProfileResourceTreeDataSource2 {
  static {
    __name(this, "ProfileResourceTreeDataSource");
  }
  constructor(editorProgressService) {
    this.editorProgressService = editorProgressService;
  }
  hasChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      return true;
    }
    if (element.element.resourceType) {
      if (element.element.resourceType !== "extensions" && element.element.resourceType !== "snippets") {
        return false;
      }
      if (element.root instanceof NewProfileElement) {
        const resourceType = element.element.resourceType;
        if (element.root.getFlag(resourceType)) {
          return true;
        }
        if (!element.root.hasResource(resourceType)) {
          return false;
        }
        if (element.root.copyFrom === void 0) {
          return false;
        }
        if (!element.root.getCopyFlag(resourceType)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  async getChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      const children = await element.getChildren();
      return children.map((e) => ({ element: e, root: element }));
    }
    if (element.element.resourceType) {
      const progressRunner = this.editorProgressService.show(true, 500);
      try {
        const extensions = await element.root.getChildren(element.element.resourceType);
        return extensions.map((e) => ({ element: e, root: element.root }));
      } finally {
        progressRunner.done();
      }
    }
    return [];
  }
};
ProfileResourceTreeDataSource = __decorate([
  __param(0, IEditorProgressService)
], ProfileResourceTreeDataSource);
class AbstractProfileResourceTreeRenderer extends Disposable {
  static {
    __name(this, "AbstractProfileResourceTreeRenderer");
  }
  getResourceTypeTitle(resourceType) {
    switch (resourceType) {
      case "settings":
        return localize("settings", "Settings");
      case "keybindings":
        return localize("keybindings", "Keyboard Shortcuts");
      case "snippets":
        return localize("snippets", "Snippets");
      case "tasks":
        return localize("tasks", "Tasks");
      case "extensions":
        return localize("extensions", "Extensions");
    }
    return "";
  }
  disposeElement(element, index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
}
class ProfilePropertyRenderer extends AbstractProfileResourceTreeRenderer {
  static {
    __name(this, "ProfilePropertyRenderer");
  }
  renderElement({ element }, index, templateData) {
    templateData.elementDisposables.clear();
    templateData.element = element;
  }
}
let ProfileNameRenderer = class ProfileNameRenderer2 extends ProfilePropertyRenderer {
  static {
    __name(this, "ProfileNameRenderer");
  }
  constructor(userDataProfilesService, contextViewService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.contextViewService = contextViewService;
    this.templateId = "name";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const nameContainer = append(parent, $(".profile-row-container"));
    append(nameContainer, $(".profile-label-element", void 0, localize("name", "Name")));
    const nameInput = disposables.add(new InputBox(nameContainer, this.contextViewService, {
      inputBoxStyles: getInputBoxStyle({
        inputBorder: settingsTextInputBorder
      }),
      ariaLabel: localize("profileName", "Profile Name"),
      placeholder: localize("profileName", "Profile Name"),
      validationOptions: {
        validation: /* @__PURE__ */ __name((value) => {
          if (!value) {
            return {
              content: localize("name required", "Profile name is required and must be a non-empty value."),
              type: 2
              /* MessageType.WARNING */
            };
          }
          if (profileElement?.root.disabled) {
            return null;
          }
          if (!profileElement?.root.shouldValidateName()) {
            return null;
          }
          const initialName = profileElement?.root.getInitialName();
          value = value.trim();
          if (initialName !== value && this.userDataProfilesService.profiles.some((p) => !p.isTransient && p.name === value)) {
            return {
              content: localize("profileExists", "Profile with name {0} already exists.", value),
              type: 2
              /* MessageType.WARNING */
            };
          }
          return null;
        }, "validation")
      }
    }));
    disposables.add(nameInput.onDidChange((value) => {
      if (profileElement && value) {
        profileElement.root.name = value;
      }
    }));
    const focusTracker = disposables.add(trackFocus(nameInput.inputElement));
    disposables.add(focusTracker.onDidBlur(() => {
      if (profileElement && !nameInput.value) {
        nameInput.value = profileElement.root.name;
      }
    }));
    const renderName = /* @__PURE__ */ __name((profileElement2) => {
      nameInput.value = profileElement2.root.name;
      nameInput.validate();
      const isDefaultProfile = profileElement2.root instanceof UserDataProfileElement && profileElement2.root.profile.isDefault;
      if (profileElement2.root.disabled || isDefaultProfile) {
        nameInput.disable();
      } else {
        nameInput.enable();
      }
      if (isDefaultProfile) {
        nameInput.setTooltip(localize("defaultProfileName", "Name cannot be changed for the default profile"));
      } else {
        nameInput.setTooltip(localize("profileName", "Profile Name"));
      }
    }, "renderName");
    return {
      set element(element) {
        profileElement = element;
        renderName(profileElement);
        elementDisposables.add(profileElement.root.onDidChange((e) => {
          if (e.name || e.disabled) {
            renderName(element);
          }
          if (e.profile) {
            nameInput.validate();
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
};
ProfileNameRenderer = __decorate([
  __param(0, IUserDataProfilesService),
  __param(1, IContextViewService)
], ProfileNameRenderer);
let ProfileIconRenderer = class ProfileIconRenderer2 extends ProfilePropertyRenderer {
  static {
    __name(this, "ProfileIconRenderer");
  }
  constructor(instantiationService, hoverService) {
    super();
    this.instantiationService = instantiationService;
    this.hoverService = hoverService;
    this.templateId = "icon";
    this.hoverDelegate = getDefaultHoverDelegate("element");
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const iconContainer = append(parent, $(".profile-row-container"));
    append(iconContainer, $(".profile-label-element", void 0, localize("icon-label", "Icon")));
    const iconValueContainer = append(iconContainer, $(".profile-icon-container"));
    const iconElement = append(iconValueContainer, $(`${ThemeIcon.asCSSSelector(DEFAULT_ICON)}`, { "tabindex": "0", "role": "button", "aria-label": localize("icon", "Profile Icon") }));
    const iconHover = disposables.add(this.hoverService.setupManagedHover(this.hoverDelegate, iconElement, ""));
    const iconSelectBox = disposables.add(this.instantiationService.createInstance(WorkbenchIconSelectBox, { icons: ICONS, inputBoxStyles: defaultInputBoxStyles }));
    let hoverWidget;
    const showIconSelectBox = /* @__PURE__ */ __name(() => {
      if (profileElement?.root instanceof UserDataProfileElement && profileElement.root.profile.isDefault) {
        return;
      }
      if (profileElement?.root.disabled) {
        return;
      }
      if (profileElement?.root instanceof UserDataProfileElement && profileElement.root.profile.isDefault) {
        return;
      }
      iconSelectBox.clearInput();
      hoverWidget = this.hoverService.showInstantHover({
        content: iconSelectBox.domNode,
        target: iconElement,
        position: {
          hoverPosition: 2
        },
        persistence: {
          sticky: true
        },
        appearance: {
          showPointer: true
        }
      }, true);
      if (hoverWidget) {
        iconSelectBox.layout(new Dimension(486, 292));
        iconSelectBox.focus();
      }
    }, "showIconSelectBox");
    disposables.add(addDisposableListener(iconElement, EventType.CLICK, (e) => {
      EventHelper.stop(e, true);
      showIconSelectBox();
    }));
    disposables.add(addDisposableListener(iconElement, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(
        3
        /* KeyCode.Enter */
      ) || event.equals(
        10
        /* KeyCode.Space */
      )) {
        EventHelper.stop(event, true);
        showIconSelectBox();
      }
    }));
    disposables.add(addDisposableListener(iconSelectBox.domNode, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(
        9
        /* KeyCode.Escape */
      )) {
        EventHelper.stop(event, true);
        hoverWidget?.dispose();
        iconElement.focus();
      }
    }));
    disposables.add(iconSelectBox.onDidSelect((selectedIcon) => {
      hoverWidget?.dispose();
      iconElement.focus();
      if (profileElement) {
        profileElement.root.icon = selectedIcon.id;
      }
    }));
    append(iconValueContainer, $(".profile-description-element", void 0, localize("icon-description", "Profile icon to be shown in the activity bar")));
    const renderIcon = /* @__PURE__ */ __name((profileElement2) => {
      if (profileElement2?.root instanceof UserDataProfileElement && profileElement2.root.profile.isDefault) {
        iconValueContainer.classList.add("disabled");
        iconHover.update(localize("defaultProfileIcon", "Icon cannot be changed for the default profile"));
      } else {
        iconHover.update(localize("changeIcon", "Click to change icon"));
        iconValueContainer.classList.remove("disabled");
      }
      if (profileElement2.root.icon) {
        iconElement.className = ThemeIcon.asClassName(ThemeIcon.fromId(profileElement2.root.icon));
      } else {
        iconElement.className = ThemeIcon.asClassName(ThemeIcon.fromId(DEFAULT_ICON.id));
      }
    }, "renderIcon");
    return {
      set element(element) {
        profileElement = element;
        renderIcon(profileElement);
        elementDisposables.add(profileElement.root.onDidChange((e) => {
          if (e.icon) {
            renderIcon(element);
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
};
ProfileIconRenderer = __decorate([
  __param(0, IInstantiationService),
  __param(1, IHoverService)
], ProfileIconRenderer);
let UseForCurrentWindowPropertyRenderer = class UseForCurrentWindowPropertyRenderer2 extends ProfilePropertyRenderer {
  static {
    __name(this, "UseForCurrentWindowPropertyRenderer");
  }
  constructor(userDataProfileService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.templateId = "useForCurrent";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const useForCurrentWindowContainer = append(parent, $(".profile-row-container"));
    append(useForCurrentWindowContainer, $(".profile-label-element", void 0, localize("use for curren window", "Use for Current Window")));
    const useForCurrentWindowValueContainer = append(useForCurrentWindowContainer, $(".profile-use-for-current-container"));
    const useForCurrentWindowTitle = localize("enable for current window", "Use this profile for the current window");
    const useForCurrentWindowCheckbox = disposables.add(new Checkbox(useForCurrentWindowTitle, false, defaultCheckboxStyles));
    append(useForCurrentWindowValueContainer, useForCurrentWindowCheckbox.domNode);
    const useForCurrentWindowLabel = append(useForCurrentWindowValueContainer, $(".profile-description-element", void 0, useForCurrentWindowTitle));
    disposables.add(useForCurrentWindowCheckbox.onChange(() => {
      if (profileElement?.root instanceof UserDataProfileElement) {
        profileElement.root.toggleCurrentWindowProfile();
      }
    }));
    disposables.add(addDisposableListener(useForCurrentWindowLabel, EventType.CLICK, () => {
      if (profileElement?.root instanceof UserDataProfileElement) {
        profileElement.root.toggleCurrentWindowProfile();
      }
    }));
    const renderUseCurrentProfile = /* @__PURE__ */ __name((profileElement2) => {
      useForCurrentWindowCheckbox.checked = profileElement2.root instanceof UserDataProfileElement && this.userDataProfileService.currentProfile.id === profileElement2.root.profile.id;
      if (useForCurrentWindowCheckbox.checked && this.userDataProfileService.currentProfile.isDefault) {
        useForCurrentWindowCheckbox.disable();
      } else {
        useForCurrentWindowCheckbox.enable();
      }
    }, "renderUseCurrentProfile");
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        renderUseCurrentProfile(profileElement);
        elementDisposables.add(that.userDataProfileService.onDidChangeCurrentProfile((e) => {
          renderUseCurrentProfile(element);
        }));
      },
      disposables,
      elementDisposables
    };
  }
};
UseForCurrentWindowPropertyRenderer = __decorate([
  __param(0, IUserDataProfileService)
], UseForCurrentWindowPropertyRenderer);
class UseAsDefaultProfileRenderer extends ProfilePropertyRenderer {
  static {
    __name(this, "UseAsDefaultProfileRenderer");
  }
  constructor() {
    super(...arguments);
    this.templateId = "useAsDefault";
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const useAsDefaultProfileContainer = append(parent, $(".profile-row-container"));
    append(useAsDefaultProfileContainer, $(".profile-label-element", void 0, localize("use for new windows", "Use for New Windows")));
    const useAsDefaultProfileValueContainer = append(useAsDefaultProfileContainer, $(".profile-use-as-default-container"));
    const useAsDefaultProfileTitle = localize("enable for new windows", "Use this profile as the default for new windows");
    const useAsDefaultProfileCheckbox = disposables.add(new Checkbox(useAsDefaultProfileTitle, false, defaultCheckboxStyles));
    append(useAsDefaultProfileValueContainer, useAsDefaultProfileCheckbox.domNode);
    const useAsDefaultProfileLabel = append(useAsDefaultProfileValueContainer, $(".profile-description-element", void 0, useAsDefaultProfileTitle));
    disposables.add(useAsDefaultProfileCheckbox.onChange(() => {
      if (profileElement?.root instanceof UserDataProfileElement) {
        profileElement.root.toggleNewWindowProfile();
      }
    }));
    disposables.add(addDisposableListener(useAsDefaultProfileLabel, EventType.CLICK, () => {
      if (profileElement?.root instanceof UserDataProfileElement) {
        profileElement.root.toggleNewWindowProfile();
      }
    }));
    const renderUseAsDefault = /* @__PURE__ */ __name((profileElement2) => {
      useAsDefaultProfileCheckbox.checked = profileElement2.root instanceof UserDataProfileElement && profileElement2.root.isNewWindowProfile;
    }, "renderUseAsDefault");
    return {
      set element(element) {
        profileElement = element;
        renderUseAsDefault(profileElement);
        elementDisposables.add(profileElement.root.onDidChange((e) => {
          if (e.newWindowProfile) {
            renderUseAsDefault(element);
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
}
let CopyFromProfileRenderer = class CopyFromProfileRenderer2 extends ProfilePropertyRenderer {
  static {
    __name(this, "CopyFromProfileRenderer");
  }
  constructor(userDataProfilesService, instantiationService, uriIdentityService, contextViewService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.contextViewService = contextViewService;
    this.templateId = "copyFrom";
    this.templates = [];
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const copyFromContainer = append(parent, $(".profile-row-container.profile-copy-from-container"));
    append(copyFromContainer, $(".profile-label-element", void 0, localize("create from", "Copy from")));
    append(copyFromContainer, $(".profile-description-element", void 0, localize("copy from description", "Select the profile source from which you want to copy contents")));
    const copyFromSelectBox = disposables.add(this.instantiationService.createInstance(SelectBox, [], 0, this.contextViewService, defaultSelectBoxStyles, {
      useCustomDrawn: true,
      ariaLabel: localize("copy profile from", "Copy profile from")
    }));
    copyFromSelectBox.render(append(copyFromContainer, $(".profile-select-container")));
    const render = /* @__PURE__ */ __name((profileElement2, copyFromOptions) => {
      copyFromSelectBox.setOptions(copyFromOptions);
      const id = profileElement2.copyFrom instanceof URI ? profileElement2.copyFrom.toString() : profileElement2.copyFrom?.id;
      const index = id ? copyFromOptions.findIndex((option) => option.id === id) : 0;
      copyFromSelectBox.select(index);
    }, "render");
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        if (profileElement.root instanceof NewProfileElement) {
          const newProfileElement = profileElement.root;
          let copyFromOptions = that.getCopyFromOptions(newProfileElement);
          render(newProfileElement, copyFromOptions);
          copyFromSelectBox.setEnabled(!newProfileElement.previewProfile && !newProfileElement.disabled);
          elementDisposables.add(profileElement.root.onDidChange((e) => {
            if (e.copyFrom || e.copyFromInfo) {
              copyFromOptions = that.getCopyFromOptions(newProfileElement);
              render(newProfileElement, copyFromOptions);
            }
            if (e.preview || e.disabled) {
              copyFromSelectBox.setEnabled(!newProfileElement.previewProfile && !newProfileElement.disabled);
            }
          }));
          elementDisposables.add(copyFromSelectBox.onDidSelect((option) => {
            newProfileElement.copyFrom = copyFromOptions[option.index].source;
          }));
        }
      },
      disposables,
      elementDisposables
    };
  }
  setTemplates(templates) {
    this.templates = templates;
  }
  getCopyFromOptions(profileElement) {
    const separator = { text: "\u2500\u2500\u2500\u2500\u2500\u2500", isDisabled: true };
    const copyFromOptions = [];
    copyFromOptions.push({ text: localize("empty profile", "None") });
    for (const [copyFromTemplate, name] of profileElement.copyFromTemplates) {
      if (!this.templates.some((template) => this.uriIdentityService.extUri.isEqual(URI.parse(template.url), copyFromTemplate))) {
        copyFromOptions.push({ text: `${name} (${basename(copyFromTemplate)})`, id: copyFromTemplate.toString(), source: copyFromTemplate });
      }
    }
    if (this.templates.length) {
      copyFromOptions.push({ ...separator, decoratorRight: localize("from templates", "Profile Templates") });
      for (const template of this.templates) {
        copyFromOptions.push({ text: template.name, id: template.url, source: URI.parse(template.url) });
      }
    }
    copyFromOptions.push({ ...separator, decoratorRight: localize("from existing profiles", "Existing Profiles") });
    for (const profile of this.userDataProfilesService.profiles) {
      if (!profile.isTransient) {
        copyFromOptions.push({ text: profile.name, id: profile.id, source: profile });
      }
    }
    return copyFromOptions;
  }
};
CopyFromProfileRenderer = __decorate([
  __param(0, IUserDataProfilesService),
  __param(1, IInstantiationService),
  __param(2, IUriIdentityService),
  __param(3, IContextViewService)
], CopyFromProfileRenderer);
let ContentsProfileRenderer = class ContentsProfileRenderer2 extends ProfilePropertyRenderer {
  static {
    __name(this, "ContentsProfileRenderer");
  }
  constructor(userDataProfilesService, contextMenuService, instantiationService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.templateId = "contents";
    this._onDidChangeContentHeight = this._register(new Emitter());
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const configureRowContainer = append(parent, $(".profile-row-container"));
    append(configureRowContainer, $(".profile-label-element", void 0, localize("contents", "Contents")));
    const contentsDescriptionElement = append(configureRowContainer, $(".profile-description-element"));
    const contentsTreeHeader = append(configureRowContainer, $(".profile-content-tree-header"));
    const optionsLabel = $(".options-header", void 0, $("span", void 0, localize("options", "Source")));
    append(contentsTreeHeader, $(""), $("", void 0, localize("contents", "Contents")), optionsLabel, $(""));
    const delegate = new ProfileContentTreeElementDelegate();
    const profilesContentTree = this.profilesContentTree = disposables.add(this.instantiationService.createInstance(WorkbenchAsyncDataTree, "ProfileEditor-ContentsTree", append(configureRowContainer, $(".profile-content-tree.file-icon-themable-tree.show-file-icons")), delegate, [
      this.instantiationService.createInstance(ExistingProfileResourceTreeRenderer),
      this.instantiationService.createInstance(NewProfileResourceTreeRenderer),
      this.instantiationService.createInstance(ProfileResourceChildTreeItemRenderer)
    ], this.instantiationService.createInstance(ProfileResourceTreeDataSource), {
      multipleSelectionSupport: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(element) {
          if ((element?.element).resourceType) {
            return (element?.element).resourceType;
          }
          if ((element?.element).label) {
            return (element?.element).label;
          }
          return "";
        },
        getWidgetAriaLabel() {
          return "";
        }
      },
      identityProvider: {
        getId(element) {
          if (element?.element.handle) {
            return element.element.handle;
          }
          return "";
        }
      },
      expandOnlyOnTwistieClick: true,
      renderIndentGuides: RenderIndentGuides.None,
      enableStickyScroll: false,
      openOnSingleClick: false,
      alwaysConsumeMouseWheel: false
    }));
    this.profilesContentTree.style(listStyles);
    disposables.add(toDisposable(() => this.profilesContentTree = void 0));
    disposables.add(this.profilesContentTree.onDidChangeContentHeight((height) => {
      this.profilesContentTree?.layout(height);
      if (profileElement) {
        this._onDidChangeContentHeight.fire(profileElement);
      }
    }));
    disposables.add(this.profilesContentTree.onDidChangeSelection((e) => {
      if (profileElement) {
        this._onDidChangeSelection.fire({ element: profileElement, selected: !!e.elements.length });
      }
    }));
    disposables.add(this.profilesContentTree.onDidOpen(async (e) => {
      if (!e.browserEvent) {
        return;
      }
      if (e.element?.element.openAction) {
        await e.element.element.openAction.run();
      }
    }));
    disposables.add(this.profilesContentTree.onContextMenu(async (e) => {
      if (!e.element?.element.actions?.contextMenu?.length) {
        return;
      }
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => e.element?.element?.actions?.contextMenu ?? [], "getActions"),
        getActionsContext: /* @__PURE__ */ __name(() => e.element, "getActionsContext")
      });
    }));
    const updateDescription = /* @__PURE__ */ __name((element) => {
      clearNode(contentsDescriptionElement);
      const markdown = new MarkdownString();
      if (element.root instanceof UserDataProfileElement && element.root.profile.isDefault) {
        markdown.appendMarkdown(localize("default profile contents description", "Browse contents of this profile\n"));
      } else {
        markdown.appendMarkdown(localize("contents source description", "Configure source of contents for this profile\n"));
        if (element.root instanceof NewProfileElement) {
          const copyFromName = element.root.getCopyFromName();
          const optionName = copyFromName === this.userDataProfilesService.defaultProfile.name ? localize("copy from default", "{0} (Copy)", copyFromName) : copyFromName;
          if (optionName) {
            markdown.appendMarkdown(localize("copy info", "- *{0}:* Copy contents from the {1} profile\n", optionName, copyFromName));
          }
          markdown.appendMarkdown(localize("default info", "- *Default:* Use contents from the Default profile\n")).appendMarkdown(localize("none info", "- *None:* Create empty contents\n"));
        }
      }
      append(contentsDescriptionElement, elementDisposables.add(renderMarkdown(markdown)).element);
    }, "updateDescription");
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        updateDescription(element);
        if (element.root instanceof NewProfileElement) {
          contentsTreeHeader.classList.remove("default-profile");
        } else if (element.root instanceof UserDataProfileElement) {
          contentsTreeHeader.classList.toggle("default-profile", element.root.profile.isDefault);
        }
        profilesContentTree.setInput(profileElement.root);
        elementDisposables.add(profileElement.root.onDidChange((e) => {
          if (e.copyFrom || e.copyFlags || e.flags || e.extensions || e.snippets || e.preview) {
            profilesContentTree.updateChildren(element.root);
          }
          if (e.copyFromInfo) {
            updateDescription(element);
            that._onDidChangeContentHeight.fire(element);
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
  clearSelection() {
    if (this.profilesContentTree) {
      this.profilesContentTree.setSelection([]);
      this.profilesContentTree.setFocus([]);
    }
  }
};
ContentsProfileRenderer = __decorate([
  __param(0, IUserDataProfilesService),
  __param(1, IContextMenuService),
  __param(2, IInstantiationService)
], ContentsProfileRenderer);
let ProfileWorkspacesRenderer = class ProfileWorkspacesRenderer2 extends ProfilePropertyRenderer {
  static {
    __name(this, "ProfileWorkspacesRenderer");
  }
  constructor(labelService, uriIdentityService, fileDialogService, instantiationService) {
    super();
    this.labelService = labelService;
    this.uriIdentityService = uriIdentityService;
    this.fileDialogService = fileDialogService;
    this.instantiationService = instantiationService;
    this.templateId = "workspaces";
    this._onDidChangeContentHeight = this._register(new Emitter());
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const profileWorkspacesRowContainer = append(parent, $(".profile-row-container"));
    append(profileWorkspacesRowContainer, $(".profile-label-element", void 0, localize("folders_workspaces", "Folders & Workspaces")));
    const profileWorkspacesDescriptionElement = append(profileWorkspacesRowContainer, $(".profile-description-element"));
    const workspacesTableContainer = append(profileWorkspacesRowContainer, $(".profile-associations-table"));
    const table = this.workspacesTable = disposables.add(this.instantiationService.createInstance(WorkbenchTable, "ProfileEditor-AssociationsTable", workspacesTableContainer, new class {
      constructor() {
        this.headerRowHeight = 30;
      }
      getHeight() {
        return 24;
      }
    }(), [
      {
        label: "",
        tooltip: "",
        weight: 1,
        minimumWidth: 30,
        maximumWidth: 30,
        templateId: WorkspaceUriEmptyColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      },
      {
        label: localize("hostColumnLabel", "Host"),
        tooltip: "",
        weight: 2,
        templateId: WorkspaceUriHostColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      },
      {
        label: localize("pathColumnLabel", "Path"),
        tooltip: "",
        weight: 7,
        templateId: WorkspaceUriPathColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      },
      {
        label: "",
        tooltip: "",
        weight: 1,
        minimumWidth: 84,
        maximumWidth: 84,
        templateId: WorkspaceUriActionsColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      }
    ], [
      new WorkspaceUriEmptyColumnRenderer(),
      this.instantiationService.createInstance(WorkspaceUriHostColumnRenderer),
      this.instantiationService.createInstance(WorkspaceUriPathColumnRenderer),
      this.instantiationService.createInstance(WorkspaceUriActionsColumnRenderer)
    ], {
      horizontalScrolling: false,
      alwaysConsumeMouseWheel: false,
      openOnSingleClick: false,
      multipleSelectionSupport: false,
      accessibilityProvider: {
        getAriaLabel: /* @__PURE__ */ __name((item) => {
          const hostLabel = getHostLabel(this.labelService, item.workspace);
          if (hostLabel === void 0 || hostLabel.length === 0) {
            return localize("trustedFolderAriaLabel", "{0}, trusted", this.labelService.getUriLabel(item.workspace));
          }
          return localize("trustedFolderWithHostAriaLabel", "{0} on {1}, trusted", this.labelService.getUriLabel(item.workspace), hostLabel);
        }, "getAriaLabel"),
        getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("trustedFoldersAndWorkspaces", "Trusted Folders & Workspaces"), "getWidgetAriaLabel")
      },
      identityProvider: {
        getId(element) {
          return element.workspace.toString();
        }
      }
    }));
    this.workspacesTable.style(listStyles);
    disposables.add(toDisposable(() => this.workspacesTable = void 0));
    disposables.add(this.workspacesTable.onDidChangeSelection((e) => {
      if (profileElement) {
        this._onDidChangeSelection.fire({ element: profileElement, selected: !!e.elements.length });
      }
    }));
    const addButtonBarElement = append(profileWorkspacesRowContainer, $(".profile-workspaces-button-container"));
    const buttonBar = disposables.add(new ButtonBar(addButtonBarElement));
    const addButton = this._register(buttonBar.addButton({ title: localize("addButton", "Add Folder"), ...defaultButtonStyles }));
    addButton.label = localize("addButton", "Add Folder");
    disposables.add(addButton.onDidClick(async () => {
      const uris = await this.fileDialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: true,
        openLabel: localize("addFolder", "Add Folder"),
        title: localize("addFolderTitle", "Select Folders To Add")
      });
      if (uris) {
        if (profileElement?.root instanceof UserDataProfileElement) {
          profileElement.root.updateWorkspaces(uris, []);
        }
      }
    }));
    disposables.add(table.onDidOpen((item) => {
      if (item?.element) {
        item.element.profileElement.openWorkspace(item.element.workspace);
      }
    }));
    const updateTable = /* @__PURE__ */ __name(() => {
      if (profileElement?.root instanceof UserDataProfileElement && profileElement.root.workspaces?.length) {
        profileWorkspacesDescriptionElement.textContent = localize("folders_workspaces_description", "Following folders and workspaces are using this profile");
        workspacesTableContainer.classList.remove("hide");
        table.splice(0, table.length, profileElement.root.workspaces.map((workspace) => ({ workspace, profileElement: profileElement.root })).sort((a, b) => this.uriIdentityService.extUri.compare(a.workspace, b.workspace)));
        this.layout();
      } else {
        profileWorkspacesDescriptionElement.textContent = localize("no_folder_description", "No folders or workspaces are using this profile");
        workspacesTableContainer.classList.add("hide");
      }
    }, "updateTable");
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        if (element.root instanceof UserDataProfileElement) {
          updateTable();
        }
        elementDisposables.add(profileElement.root.onDidChange((e) => {
          if (profileElement && e.workspaces) {
            updateTable();
            that._onDidChangeContentHeight.fire(profileElement);
          }
        }));
      },
      disposables,
      elementDisposables
    };
  }
  layout() {
    if (this.workspacesTable) {
      this.workspacesTable.layout(this.workspacesTable.length * 24 + 30, void 0);
    }
  }
  clearSelection() {
    if (this.workspacesTable) {
      this.workspacesTable.setSelection([]);
      this.workspacesTable.setFocus([]);
    }
  }
};
ProfileWorkspacesRenderer = __decorate([
  __param(0, ILabelService),
  __param(1, IUriIdentityService),
  __param(2, IFileDialogService),
  __param(3, IInstantiationService)
], ProfileWorkspacesRenderer);
let ExistingProfileResourceTreeRenderer = class ExistingProfileResourceTreeRenderer2 extends AbstractProfileResourceTreeRenderer {
  static {
    __name(this, "ExistingProfileResourceTreeRenderer");
  }
  static {
    ExistingProfileResourceTreeRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "ExistingProfileResourceTemplate";
  }
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.templateId = ExistingProfileResourceTreeRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container = append(parent, $(".profile-tree-item-container.existing-profile-resource-type-container"));
    const label = append(container, $(".profile-resource-type-label"));
    const radio = disposables.add(new Radio({ items: [] }));
    append(append(container, $(".profile-resource-options-container")), radio.domNode);
    const actionsContainer = append(container, $(".profile-resource-actions-container"));
    const actionBar = disposables.add(this.instantiationService.createInstance(WorkbenchToolBar, actionsContainer, {
      hoverDelegate: disposables.add(createInstantHoverDelegate()),
      highlightToggledItems: true
    }));
    return { label, radio, actionBar, disposables, elementDisposables: disposables.add(new DisposableStore()) };
  }
  renderElement({ element: profileResourceTreeElement }, index, templateData) {
    templateData.elementDisposables.clear();
    const { element, root } = profileResourceTreeElement;
    if (!(root instanceof UserDataProfileElement)) {
      throw new Error("ExistingProfileResourceTreeRenderer can only render existing profile element");
    }
    if (isString(element) || !isProfileResourceTypeElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    const updateRadioItems = /* @__PURE__ */ __name(() => {
      templateData.radio.setItems([
        {
          text: localize("default", "Default"),
          tooltip: localize("default description", "Use {0} from the Default profile", resourceTypeTitle),
          isActive: root.getFlag(element.resourceType)
        },
        {
          text: root.name,
          tooltip: localize("current description", "Use {0} from the {1} profile", resourceTypeTitle, root.name),
          isActive: !root.getFlag(element.resourceType)
        }
      ]);
    }, "updateRadioItems");
    const resourceTypeTitle = this.getResourceTypeTitle(element.resourceType);
    templateData.label.textContent = resourceTypeTitle;
    if (root instanceof UserDataProfileElement && root.profile.isDefault) {
      templateData.radio.domNode.classList.add("hide");
    } else {
      templateData.radio.domNode.classList.remove("hide");
      updateRadioItems();
      templateData.elementDisposables.add(root.onDidChange((e) => {
        if (e.name) {
          updateRadioItems();
        }
      }));
      templateData.elementDisposables.add(templateData.radio.onDidSelect((index2) => root.setFlag(element.resourceType, index2 === 0)));
    }
    const actions = [];
    if (element.openAction) {
      actions.push(element.openAction);
    }
    if (element.actions?.primary) {
      actions.push(...element.actions.primary);
    }
    templateData.actionBar.setActions(actions);
  }
};
ExistingProfileResourceTreeRenderer = ExistingProfileResourceTreeRenderer_1 = __decorate([
  __param(0, IInstantiationService)
], ExistingProfileResourceTreeRenderer);
let NewProfileResourceTreeRenderer = class NewProfileResourceTreeRenderer2 extends AbstractProfileResourceTreeRenderer {
  static {
    __name(this, "NewProfileResourceTreeRenderer");
  }
  static {
    NewProfileResourceTreeRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "NewProfileResourceTemplate";
  }
  constructor(userDataProfilesService, instantiationService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.instantiationService = instantiationService;
    this.templateId = NewProfileResourceTreeRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container = append(parent, $(".profile-tree-item-container.new-profile-resource-type-container"));
    const labelContainer = append(container, $(".profile-resource-type-label-container"));
    const label = append(labelContainer, $("span.profile-resource-type-label"));
    const radio = disposables.add(new Radio({ items: [] }));
    append(append(container, $(".profile-resource-options-container")), radio.domNode);
    const actionsContainer = append(container, $(".profile-resource-actions-container"));
    const actionBar = disposables.add(this.instantiationService.createInstance(WorkbenchToolBar, actionsContainer, {
      hoverDelegate: disposables.add(createInstantHoverDelegate()),
      highlightToggledItems: true
    }));
    return { label, radio, actionBar, disposables, elementDisposables: disposables.add(new DisposableStore()) };
  }
  renderElement({ element: profileResourceTreeElement }, index, templateData) {
    templateData.elementDisposables.clear();
    const { element, root } = profileResourceTreeElement;
    if (!(root instanceof NewProfileElement)) {
      throw new Error("NewProfileResourceTreeRenderer can only render new profile element");
    }
    if (isString(element) || !isProfileResourceTypeElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    const resourceTypeTitle = this.getResourceTypeTitle(element.resourceType);
    templateData.label.textContent = resourceTypeTitle;
    const renderRadioItems = /* @__PURE__ */ __name(() => {
      const options = [
        {
          text: localize("default", "Default"),
          tooltip: localize("default description", "Use {0} from the Default profile", resourceTypeTitle)
        },
        {
          text: localize("none", "None"),
          tooltip: localize("none description", "Create empty {0}", resourceTypeTitle)
        }
      ];
      const copyFromName = root.getCopyFromName();
      const name = copyFromName === this.userDataProfilesService.defaultProfile.name ? localize("copy from default", "{0} (Copy)", copyFromName) : copyFromName;
      if (root.copyFrom && name) {
        templateData.radio.setItems([
          {
            text: name,
            tooltip: name ? localize("copy from profile description", "Copy {0} from the {1} profile", resourceTypeTitle, name) : localize("copy description", "Copy")
          },
          ...options
        ]);
        templateData.radio.setActiveItem(root.getCopyFlag(element.resourceType) ? 0 : root.getFlag(element.resourceType) ? 1 : 2);
      } else {
        templateData.radio.setItems(options);
        templateData.radio.setActiveItem(root.getFlag(element.resourceType) ? 0 : 1);
      }
    }, "renderRadioItems");
    if (root.copyFrom) {
      templateData.elementDisposables.add(templateData.radio.onDidSelect((index2) => {
        root.setFlag(element.resourceType, index2 === 1);
        root.setCopyFlag(element.resourceType, index2 === 0);
      }));
    } else {
      templateData.elementDisposables.add(templateData.radio.onDidSelect((index2) => {
        root.setFlag(element.resourceType, index2 === 0);
      }));
    }
    renderRadioItems();
    templateData.radio.setEnabled(!root.disabled && !root.previewProfile);
    templateData.elementDisposables.add(root.onDidChange((e) => {
      if (e.disabled || e.preview) {
        templateData.radio.setEnabled(!root.disabled && !root.previewProfile);
      }
      if (e.copyFrom || e.copyFromInfo) {
        renderRadioItems();
      }
    }));
    const actions = [];
    if (element.openAction) {
      actions.push(element.openAction);
    }
    if (element.actions?.primary) {
      actions.push(...element.actions.primary);
    }
    templateData.actionBar.setActions(actions);
  }
};
NewProfileResourceTreeRenderer = NewProfileResourceTreeRenderer_1 = __decorate([
  __param(0, IUserDataProfilesService),
  __param(1, IInstantiationService)
], NewProfileResourceTreeRenderer);
let ProfileResourceChildTreeItemRenderer = class ProfileResourceChildTreeItemRenderer2 extends AbstractProfileResourceTreeRenderer {
  static {
    __name(this, "ProfileResourceChildTreeItemRenderer");
  }
  static {
    ProfileResourceChildTreeItemRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "ProfileResourceChildTreeItemTemplate";
  }
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.templateId = ProfileResourceChildTreeItemRenderer_1.TEMPLATE_ID;
    this.labels = instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER);
    this.hoverDelegate = this._register(instantiationService.createInstance(WorkbenchHoverDelegate, "mouse", void 0, {}));
  }
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container = append(parent, $(".profile-tree-item-container.profile-resource-child-container"));
    const checkbox = disposables.add(new Checkbox("", false, defaultCheckboxStyles));
    append(container, checkbox.domNode);
    const resourceLabel = disposables.add(this.labels.create(container, { hoverDelegate: this.hoverDelegate }));
    const actionsContainer = append(container, $(".profile-resource-actions-container"));
    const actionBar = disposables.add(this.instantiationService.createInstance(WorkbenchToolBar, actionsContainer, {
      hoverDelegate: disposables.add(createInstantHoverDelegate()),
      highlightToggledItems: true
    }));
    return { checkbox, resourceLabel, actionBar, disposables, elementDisposables: disposables.add(new DisposableStore()) };
  }
  renderElement({ element: profileResourceTreeElement }, index, templateData) {
    templateData.elementDisposables.clear();
    const { element } = profileResourceTreeElement;
    if (isString(element) || !isProfileResourceChildElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    if (element.checkbox) {
      templateData.checkbox.domNode.setAttribute("tabindex", "0");
      templateData.checkbox.domNode.classList.remove("hide");
      templateData.checkbox.checked = element.checkbox.isChecked;
      templateData.checkbox.domNode.ariaLabel = element.checkbox.accessibilityInformation?.label ?? "";
      if (element.checkbox.accessibilityInformation?.role) {
        templateData.checkbox.domNode.role = element.checkbox.accessibilityInformation.role;
      }
    } else {
      templateData.checkbox.domNode.removeAttribute("tabindex");
      templateData.checkbox.domNode.classList.add("hide");
    }
    templateData.resourceLabel.setResource({
      name: element.resource ? basename(element.resource) : element.label,
      description: element.description,
      resource: element.resource
    }, {
      forceLabel: true,
      icon: element.icon,
      hideIcon: !element.resource && !element.icon
    });
    const actions = [];
    if (element.openAction) {
      actions.push(element.openAction);
    }
    if (element.actions?.primary) {
      actions.push(...element.actions.primary);
    }
    templateData.actionBar.setActions(actions);
  }
};
ProfileResourceChildTreeItemRenderer = ProfileResourceChildTreeItemRenderer_1 = __decorate([
  __param(0, IInstantiationService)
], ProfileResourceChildTreeItemRenderer);
class WorkspaceUriEmptyColumnRenderer {
  static {
    __name(this, "WorkspaceUriEmptyColumnRenderer");
  }
  constructor() {
    this.templateId = WorkspaceUriEmptyColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "empty";
  }
  renderTemplate(container) {
    return {};
  }
  renderElement(item, index, templateData) {
  }
  disposeTemplate() {
  }
}
let WorkspaceUriHostColumnRenderer = class WorkspaceUriHostColumnRenderer2 {
  static {
    __name(this, "WorkspaceUriHostColumnRenderer");
  }
  static {
    WorkspaceUriHostColumnRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "host";
  }
  constructor(uriIdentityService, labelService) {
    this.uriIdentityService = uriIdentityService;
    this.labelService = labelService;
    this.templateId = WorkspaceUriHostColumnRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const renderDisposables = disposables.add(new DisposableStore());
    const element = container.appendChild($(".host"));
    const hostContainer = element.appendChild($("div.host-label"));
    const buttonBarContainer = element.appendChild($("div.button-bar"));
    return {
      element,
      hostContainer,
      buttonBarContainer,
      disposables,
      renderDisposables
    };
  }
  renderElement(item, index, templateData) {
    templateData.renderDisposables.clear();
    templateData.renderDisposables.add({ dispose: /* @__PURE__ */ __name(() => {
      clearNode(templateData.buttonBarContainer);
    }, "dispose") });
    templateData.hostContainer.innerText = getHostLabel(this.labelService, item.workspace);
    templateData.element.classList.toggle("current-workspace", this.uriIdentityService.extUri.isEqual(item.workspace, item.profileElement.getCurrentWorkspace()));
    templateData.hostContainer.style.display = "";
    templateData.buttonBarContainer.style.display = "none";
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
WorkspaceUriHostColumnRenderer = WorkspaceUriHostColumnRenderer_1 = __decorate([
  __param(0, IUriIdentityService),
  __param(1, ILabelService)
], WorkspaceUriHostColumnRenderer);
let WorkspaceUriPathColumnRenderer = class WorkspaceUriPathColumnRenderer2 {
  static {
    __name(this, "WorkspaceUriPathColumnRenderer");
  }
  static {
    WorkspaceUriPathColumnRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "path";
  }
  constructor(uriIdentityService, hoverService) {
    this.uriIdentityService = uriIdentityService;
    this.hoverService = hoverService;
    this.templateId = WorkspaceUriPathColumnRenderer_1.TEMPLATE_ID;
    this.hoverDelegate = getDefaultHoverDelegate("mouse");
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const element = container.appendChild($(".path"));
    const pathLabel = element.appendChild($("div.path-label"));
    const pathHover = disposables.add(this.hoverService.setupManagedHover(this.hoverDelegate, pathLabel, ""));
    const renderDisposables = disposables.add(new DisposableStore());
    return {
      element,
      pathLabel,
      pathHover,
      disposables,
      renderDisposables
    };
  }
  renderElement(item, index, templateData) {
    templateData.renderDisposables.clear();
    const stringValue = this.formatPath(item.workspace);
    templateData.pathLabel.innerText = stringValue;
    templateData.element.classList.toggle("current-workspace", this.uriIdentityService.extUri.isEqual(item.workspace, item.profileElement.getCurrentWorkspace()));
    templateData.pathHover.update(stringValue);
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.renderDisposables.dispose();
  }
  formatPath(uri) {
    if (uri.scheme === Schemas.file) {
      return normalizeDriveLetter(uri.fsPath);
    }
    if (uri.path.startsWith(posix.sep)) {
      const pathWithoutLeadingSeparator = uri.path.substring(1);
      const isWindowsPath = hasDriveLetter(pathWithoutLeadingSeparator, true);
      if (isWindowsPath) {
        return normalizeDriveLetter(win32.normalize(pathWithoutLeadingSeparator), true);
      }
    }
    return uri.path;
  }
};
WorkspaceUriPathColumnRenderer = WorkspaceUriPathColumnRenderer_1 = __decorate([
  __param(0, IUriIdentityService),
  __param(1, IHoverService)
], WorkspaceUriPathColumnRenderer);
let ChangeProfileAction = class ChangeProfileAction2 {
  static {
    __name(this, "ChangeProfileAction");
  }
  constructor(item, userDataProfilesService) {
    this.item = item;
    this.userDataProfilesService = userDataProfilesService;
    this.id = "changeProfile";
    this.label = "Change Profile";
    this.class = ThemeIcon.asClassName(editIcon);
    this.enabled = true;
    this.tooltip = localize("change profile", "Change Profile");
    this.checked = false;
  }
  run() {
  }
  getSwitchProfileActions() {
    return this.userDataProfilesService.profiles.filter((profile) => !profile.isTransient).sort((a, b) => a.isDefault ? -1 : b.isDefault ? 1 : a.name.localeCompare(b.name)).map((profile) => ({
      id: `switchProfileTo${profile.id}`,
      label: profile.name,
      class: void 0,
      enabled: true,
      checked: profile.id === this.item.profileElement.profile.id,
      tooltip: "",
      run: /* @__PURE__ */ __name(() => {
        if (profile.id === this.item.profileElement.profile.id) {
          return;
        }
        this.userDataProfilesService.updateProfile(profile, { workspaces: [...profile.workspaces ?? [], this.item.workspace] });
      }, "run")
    }));
  }
};
ChangeProfileAction = __decorate([
  __param(1, IUserDataProfilesService)
], ChangeProfileAction);
let WorkspaceUriActionsColumnRenderer = class WorkspaceUriActionsColumnRenderer2 {
  static {
    __name(this, "WorkspaceUriActionsColumnRenderer");
  }
  static {
    WorkspaceUriActionsColumnRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "actions";
  }
  constructor(userDataProfilesService, userDataProfileManagementService, contextMenuService, uriIdentityService) {
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.contextMenuService = contextMenuService;
    this.uriIdentityService = uriIdentityService;
    this.templateId = WorkspaceUriActionsColumnRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const element = container.appendChild($(".profile-workspaces-actions-container"));
    const hoverDelegate = disposables.add(createInstantHoverDelegate());
    const actionBar = disposables.add(new ActionBar(element, {
      hoverDelegate,
      actionViewItemProvider: /* @__PURE__ */ __name((action) => {
        if (action instanceof ChangeProfileAction) {
          return new DropdownMenuActionViewItem(action, { getActions: /* @__PURE__ */ __name(() => action.getSwitchProfileActions(), "getActions") }, this.contextMenuService, {
            classNames: action.class,
            hoverDelegate
          });
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    return { actionBar, disposables };
  }
  renderElement(item, index, templateData) {
    templateData.actionBar.clear();
    const actions = [];
    actions.push(this.createOpenAction(item));
    actions.push(new ChangeProfileAction(item, this.userDataProfilesService));
    actions.push(this.createDeleteAction(item));
    templateData.actionBar.push(actions, { icon: true });
  }
  createOpenAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(Codicon.window),
      enabled: !this.uriIdentityService.extUri.isEqual(item.workspace, item.profileElement.getCurrentWorkspace()),
      id: "openWorkspace",
      tooltip: localize("open", "Open in New Window"),
      run: /* @__PURE__ */ __name(() => item.profileElement.openWorkspace(item.workspace), "run")
    };
  }
  createDeleteAction(item) {
    return {
      label: "",
      class: ThemeIcon.asClassName(removeIcon),
      enabled: this.userDataProfileManagementService.getDefaultProfileToUse().id !== item.profileElement.profile.id,
      id: "deleteTrustedUri",
      tooltip: localize("deleteTrustedUri", "Delete Path"),
      run: /* @__PURE__ */ __name(() => item.profileElement.updateWorkspaces([], [item.workspace]), "run")
    };
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
WorkspaceUriActionsColumnRenderer = WorkspaceUriActionsColumnRenderer_1 = __decorate([
  __param(0, IUserDataProfilesService),
  __param(1, IUserDataProfileManagementService),
  __param(2, IContextMenuService),
  __param(3, IUriIdentityService)
], WorkspaceUriActionsColumnRenderer);
function getHostLabel(labelService, workspaceUri) {
  return workspaceUri.authority ? labelService.getHostLabel(workspaceUri.scheme, workspaceUri.authority) : localize("localAuthority", "Local");
}
__name(getHostLabel, "getHostLabel");
let UserDataProfilesEditorInput = class UserDataProfilesEditorInput2 extends EditorInput {
  static {
    __name(this, "UserDataProfilesEditorInput");
  }
  static {
    UserDataProfilesEditorInput_1 = this;
  }
  static {
    this.ID = "workbench.input.userDataProfiles";
  }
  get dirty() {
    return this._dirty;
  }
  set dirty(dirty) {
    if (this._dirty !== dirty) {
      this._dirty = dirty;
      this._onDidChangeDirty.fire();
    }
  }
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.resource = void 0;
    this._dirty = false;
    this.model = UserDataProfilesEditorModel.getInstance(this.instantiationService);
    this._register(this.model.onDidChange((e) => this.dirty = this.model.profiles.some((profile) => profile instanceof NewProfileElement)));
  }
  get typeId() {
    return UserDataProfilesEditorInput_1.ID;
  }
  getName() {
    return localize("userDataProfiles", "Profiles");
  }
  getIcon() {
    return defaultUserDataProfileIcon;
  }
  async resolve() {
    await this.model.resolve();
    return this.model;
  }
  isDirty() {
    return this.dirty;
  }
  async save() {
    await this.model.saveNewProfile();
    return this;
  }
  async revert() {
    this.model.revert();
  }
  matches(otherInput) {
    return otherInput instanceof UserDataProfilesEditorInput_1;
  }
  dispose() {
    for (const profile of this.model.profiles) {
      if (profile instanceof UserDataProfileElement) {
        profile.reset();
      }
    }
    super.dispose();
  }
};
UserDataProfilesEditorInput = UserDataProfilesEditorInput_1 = __decorate([
  __param(0, IInstantiationService)
], UserDataProfilesEditorInput);
class UserDataProfilesEditorInputSerializer {
  static {
    __name(this, "UserDataProfilesEditorInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(UserDataProfilesEditorInput);
  }
}
export {
  UserDataProfilesEditor,
  UserDataProfilesEditorInput,
  UserDataProfilesEditorInputSerializer,
  profilesSashBorder
};
//# sourceMappingURL=userDataProfilesEditor.js.map
