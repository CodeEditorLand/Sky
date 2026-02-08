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
var BrowserEditorInput_1;
import { Codicon } from "../../../../base/common/codicons.js";
import { truncate } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { BrowserViewUri } from "../../../../platform/browserView/common/browserViewUri.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { TAB_ACTIVE_FOREGROUND } from "../../../common/theme.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IBrowserViewWorkbenchService } from "../common/browserView.js";
import { hasKey } from "../../../../base/common/types.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { BrowserEditor } from "./browserEditor.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { logBrowserOpen } from "./browserViewTelemetry.js";
const LOADING_SPINNER_SVG = /* @__PURE__ */ __name((color) => `
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
		<path d="M8 1a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z" fill="${color}" opacity="0.3"/>
		<path d="M8 1a7 7 0 0 1 7 7h-1.5A5.5 5.5 0 0 0 8 2.5V1z" fill="${color}">
			<animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 8 8;360 8 8"/>
		</path>
	</svg>
`, "LOADING_SPINNER_SVG");
const MAX_TITLE_LENGTH = 30;
let BrowserEditorInput = class BrowserEditorInput2 extends EditorInput {
  static {
    __name(this, "BrowserEditorInput");
  }
  static {
    BrowserEditorInput_1 = this;
  }
  static {
    this.ID = "workbench.editorinputs.browser";
  }
  static {
    this.DEFAULT_LABEL = localize("browser.editorLabel", "Browser");
  }
  constructor(options, themeService, browserViewWorkbenchService, lifecycleService, instantiationService, telemetryService) {
    super();
    this.themeService = themeService;
    this.browserViewWorkbenchService = browserViewWorkbenchService;
    this.lifecycleService = lifecycleService;
    this.instantiationService = instantiationService;
    this.telemetryService = telemetryService;
    this._id = options.id;
    this._initialData = options;
    this._register(this.lifecycleService.onWillShutdown((e) => {
      if (this._model) {
        if (e.reason === 3) {
          void this._model.setVisible(false);
        } else {
          this._model.dispose();
          this._model = void 0;
        }
      }
    }));
  }
  get id() {
    return this._id;
  }
  async resolve() {
    if (!this._model && !this._modelPromise) {
      this._modelPromise = (async () => {
        this._model = await this.browserViewWorkbenchService.getOrCreateBrowserViewModel(this._id);
        this._modelPromise = void 0;
        this._register(this._model.onWillDispose(() => {
          this._model = void 0;
        }));
        this._register(this._model.onDidClose(() => {
          this.dispose();
        }));
        this._register(this._model.onDidChangeTitle(() => this._onDidChangeLabel.fire()));
        this._register(this._model.onDidChangeFavicon(() => this._onDidChangeLabel.fire()));
        this._register(this._model.onDidChangeLoadingState(() => this._onDidChangeLabel.fire()));
        this._register(this._model.onDidNavigate(() => this._onDidChangeLabel.fire()));
        if (this._initialData.url && this._model.url !== this._initialData.url) {
          void this._model.loadURL(this._initialData.url);
        }
        return this._model;
      })();
    }
    return this._model || this._modelPromise;
  }
  get typeId() {
    return BrowserEditorInput_1.ID;
  }
  get editorId() {
    return BrowserEditor.ID;
  }
  get capabilities() {
    return 8 | 2;
  }
  get resource() {
    if (this._resourceBeforeDisposal) {
      return this._resourceBeforeDisposal;
    }
    const url = this._model?.url ?? this._initialData.url ?? "";
    return BrowserViewUri.forUrl(url, this._id);
  }
  getIcon() {
    if (this._model) {
      if (this._model.loading) {
        const color = this.themeService.getColorTheme().getColor(TAB_ACTIVE_FOREGROUND);
        return URI.parse("data:image/svg+xml;utf8," + encodeURIComponent(LOADING_SPINNER_SVG(color?.toString())));
      }
      if (this._model.favicon) {
        return URI.parse(this._model.favicon);
      }
      return Codicon.globe;
    }
    if (this._initialData.favicon) {
      return URI.parse(this._initialData.favicon);
    }
    return Codicon.globe;
  }
  getName() {
    return truncate(this.getTitle(), MAX_TITLE_LENGTH);
  }
  getTitle() {
    if (this._model && this._model.url) {
      if (this._model.title) {
        return this._model.title;
      }
      const authority2 = URI.parse(this._model.url).authority;
      return authority2 || BrowserEditorInput_1.DEFAULT_LABEL;
    }
    if (this._initialData.title) {
      return this._initialData.title;
    }
    const url = this._initialData.url ?? "";
    const authority = URI.parse(url).authority;
    return authority || BrowserEditorInput_1.DEFAULT_LABEL;
  }
  getDescription() {
    return this._model ? this._model.url : this._initialData.url;
  }
  canReopen() {
    return true;
  }
  matches(otherInput) {
    if (super.matches(otherInput)) {
      return true;
    }
    if (otherInput instanceof BrowserEditorInput_1) {
      return this._id === otherInput._id;
    }
    if (hasKey(otherInput, { resource: true }) && otherInput.resource?.scheme === BrowserViewUri.scheme) {
      const parsed = BrowserViewUri.parse(otherInput.resource);
      if (parsed) {
        return this._id === parsed.id;
      }
    }
    return false;
  }
  /**
   * Creates a copy of this browser editor input with a new unique ID, creating an independent browser view with no linked state.
   * This is used during Copy into New Window.
   */
  copy() {
    logBrowserOpen(this.telemetryService, "copyToNewWindow");
    const currentUrl = this._model?.url ?? this._initialData.url;
    return this.instantiationService.createInstance(BrowserEditorInput_1, {
      id: generateUuid(),
      url: currentUrl,
      title: this._model?.title ?? this._initialData.title,
      favicon: this._model?.favicon ?? this._initialData.favicon
    });
  }
  toUntyped() {
    return {
      resource: this.resource,
      options: {
        override: BrowserEditorInput_1.ID
      }
    };
  }
  dispose() {
    if (this._model) {
      this._resourceBeforeDisposal = this.resource;
      this._model.dispose();
      this._model = void 0;
    }
    super.dispose();
  }
  serialize() {
    return {
      id: this._id,
      url: this._model ? this._model.url : this._initialData.url,
      title: this._model ? this._model.title : this._initialData.title,
      favicon: this._model ? this._model.favicon : this._initialData.favicon
    };
  }
};
BrowserEditorInput = BrowserEditorInput_1 = __decorate([
  __param(1, IThemeService),
  __param(2, IBrowserViewWorkbenchService),
  __param(3, ILifecycleService),
  __param(4, IInstantiationService),
  __param(5, ITelemetryService)
], BrowserEditorInput);
class BrowserEditorSerializer {
  static {
    __name(this, "BrowserEditorSerializer");
  }
  canSerialize(editorInput) {
    return editorInput instanceof BrowserEditorInput;
  }
  serialize(editorInput) {
    if (!this.canSerialize(editorInput)) {
      return void 0;
    }
    return JSON.stringify(editorInput.serialize());
  }
  deserialize(instantiationService, serializedEditor) {
    try {
      const data = JSON.parse(serializedEditor);
      return instantiationService.createInstance(BrowserEditorInput, data);
    } catch {
      return void 0;
    }
  }
}
export {
  BrowserEditorInput,
  BrowserEditorSerializer
};
//# sourceMappingURL=browserEditorInput.js.map
