var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Lazy } from "../../../base/common/lazy.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import * as path from "../../../base/common/path.js";
import * as process from "../../../base/common/process.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { IExtHostEditorTabs } from "./extHostEditorTabs.js";
import { IExtHostExtensionService } from "./extHostExtensionService.js";
import { CustomEditorTabInput, NotebookDiffEditorTabInput, NotebookEditorTabInput, TextDiffTabInput, TextTabInput } from "./extHostTypes.js";
import { IExtHostWorkspace } from "./extHostWorkspace.js";
import { AbstractVariableResolverService } from "../../services/configurationResolver/common/variableResolver.js";
import { IExtHostConfiguration } from "./extHostConfiguration.js";
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
const IExtHostVariableResolverProvider = createDecorator("IExtHostVariableResolverProvider");
class ExtHostVariableResolverService extends AbstractVariableResolverService {
  static {
    __name(this, "ExtHostVariableResolverService");
  }
  constructor(extensionService, workspaceService, editorService, editorTabs, configProvider, context, homeDir) {
    function getActiveUri() {
      if (editorService) {
        const activeEditor = editorService.activeEditor();
        if (activeEditor) {
          return activeEditor.document.uri;
        }
        const activeTab = editorTabs.tabGroups.all.find((group) => group.isActive)?.activeTab;
        if (activeTab !== void 0) {
          if (activeTab.input instanceof TextDiffTabInput || activeTab.input instanceof NotebookDiffEditorTabInput) {
            return activeTab.input.modified;
          } else if (activeTab.input instanceof TextTabInput || activeTab.input instanceof NotebookEditorTabInput || activeTab.input instanceof CustomEditorTabInput) {
            return activeTab.input.uri;
          }
        }
      }
      return void 0;
    }
    __name(getActiveUri, "getActiveUri");
    super({
      getFolderUri: /* @__PURE__ */ __name((folderName) => {
        const found = context.folders.filter((f) => f.name === folderName);
        if (found && found.length > 0) {
          return found[0].uri;
        }
        return void 0;
      }, "getFolderUri"),
      getWorkspaceFolderCount: /* @__PURE__ */ __name(() => {
        return context.folders.length;
      }, "getWorkspaceFolderCount"),
      getConfigurationValue: /* @__PURE__ */ __name((folderUri, section) => {
        return configProvider.getConfiguration(void 0, folderUri).get(section);
      }, "getConfigurationValue"),
      getAppRoot: /* @__PURE__ */ __name(() => {
        return process.cwd();
      }, "getAppRoot"),
      getExecPath: /* @__PURE__ */ __name(() => {
        return process.env["VSCODE_EXEC_PATH"];
      }, "getExecPath"),
      getFilePath: /* @__PURE__ */ __name(() => {
        const activeUri = getActiveUri();
        if (activeUri) {
          return path.normalize(activeUri.fsPath);
        }
        return void 0;
      }, "getFilePath"),
      getWorkspaceFolderPathForFile: /* @__PURE__ */ __name(() => {
        if (workspaceService) {
          const activeUri = getActiveUri();
          if (activeUri) {
            const ws = workspaceService.getWorkspaceFolder(activeUri);
            if (ws) {
              return path.normalize(ws.uri.fsPath);
            }
          }
        }
        return void 0;
      }, "getWorkspaceFolderPathForFile"),
      getSelectedText: /* @__PURE__ */ __name(() => {
        if (editorService) {
          const activeEditor = editorService.activeEditor();
          if (activeEditor && !activeEditor.selection.isEmpty) {
            return activeEditor.document.getText(activeEditor.selection);
          }
        }
        return void 0;
      }, "getSelectedText"),
      getLineNumber: /* @__PURE__ */ __name(() => {
        if (editorService) {
          const activeEditor = editorService.activeEditor();
          if (activeEditor) {
            return String(activeEditor.selection.end.line + 1);
          }
        }
        return void 0;
      }, "getLineNumber"),
      getColumnNumber: /* @__PURE__ */ __name(() => {
        if (editorService) {
          const activeEditor = editorService.activeEditor();
          if (activeEditor) {
            return String(activeEditor.selection.end.character + 1);
          }
        }
        return void 0;
      }, "getColumnNumber"),
      getExtension: /* @__PURE__ */ __name((id) => {
        return extensionService.getExtension(id);
      }, "getExtension")
    }, void 0, homeDir ? Promise.resolve(homeDir) : void 0, Promise.resolve(process.env));
  }
}
let ExtHostVariableResolverProviderService = class ExtHostVariableResolverProviderService2 extends Disposable {
  static {
    __name(this, "ExtHostVariableResolverProviderService");
  }
  constructor(extensionService, workspaceService, editorService, configurationService, editorTabs) {
    super();
    this.extensionService = extensionService;
    this.workspaceService = workspaceService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.editorTabs = editorTabs;
    this._resolver = new Lazy(async () => {
      const configProvider = await this.configurationService.getConfigProvider();
      const folders = await this.workspaceService.getWorkspaceFolders2() || [];
      const dynamic = { folders };
      this._register(this.workspaceService.onDidChangeWorkspace(async (e) => {
        dynamic.folders = await this.workspaceService.getWorkspaceFolders2() || [];
      }));
      return new ExtHostVariableResolverService(this.extensionService, this.workspaceService, this.editorService, this.editorTabs, configProvider, dynamic, this.homeDir());
    });
  }
  getResolver() {
    return this._resolver.value;
  }
  homeDir() {
    return void 0;
  }
};
ExtHostVariableResolverProviderService = __decorate([
  __param(0, IExtHostExtensionService),
  __param(1, IExtHostWorkspace),
  __param(2, IExtHostDocumentsAndEditors),
  __param(3, IExtHostConfiguration),
  __param(4, IExtHostEditorTabs)
], ExtHostVariableResolverProviderService);
export {
  ExtHostVariableResolverProviderService,
  IExtHostVariableResolverProvider
};
//# sourceMappingURL=extHostVariableResolverService.js.map
