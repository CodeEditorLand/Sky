var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Queue } from "../../../../base/common/async.js";
import { IStringDictionary } from "../../../../base/common/collections.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { LRUCache } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { IProcessEnvironment } from "../../../../base/common/platform.js";
import * as Types from "../../../../base/common/types.js";
import { URI as uri } from "../../../../base/common/uri.js";
import { ICodeEditor, isCodeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ConfigurationTarget, IConfigurationOverrides, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IInputOptions, IPickOptions, IQuickInputService, IQuickPickItem } from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService, IWorkspaceFolderData, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../common/editor.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { IPathService } from "../../path/common/pathService.js";
import { ConfiguredInput, VariableError, VariableKind } from "../common/configurationResolver.js";
import { ConfigurationResolverExpression, IResolvedValue } from "../common/configurationResolverExpression.js";
import { AbstractVariableResolverService } from "../common/variableResolver.js";
const LAST_INPUT_STORAGE_KEY = "configResolveInputLru";
const LAST_INPUT_CACHE_SIZE = 5;
class BaseConfigurationResolverService extends AbstractVariableResolverService {
  constructor(context, envVariablesPromise, editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService, storageService) {
    super({
      getFolderUri: /* @__PURE__ */ __name((folderName) => {
        const folder = workspaceContextService.getWorkspace().folders.filter((f) => f.name === folderName).pop();
        return folder ? folder.uri : void 0;
      }, "getFolderUri"),
      getWorkspaceFolderCount: /* @__PURE__ */ __name(() => {
        return workspaceContextService.getWorkspace().folders.length;
      }, "getWorkspaceFolderCount"),
      getConfigurationValue: /* @__PURE__ */ __name((folderUri, section) => {
        return configurationService.getValue(section, folderUri ? { resource: folderUri } : {});
      }, "getConfigurationValue"),
      getAppRoot: /* @__PURE__ */ __name(() => {
        return context.getAppRoot();
      }, "getAppRoot"),
      getExecPath: /* @__PURE__ */ __name(() => {
        return context.getExecPath();
      }, "getExecPath"),
      getFilePath: /* @__PURE__ */ __name(() => {
        const fileResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: [Schemas.file, Schemas.vscodeUserData, this.pathService.defaultUriScheme]
        });
        if (!fileResource) {
          return void 0;
        }
        return this.labelService.getUriLabel(fileResource, { noPrefix: true });
      }, "getFilePath"),
      getWorkspaceFolderPathForFile: /* @__PURE__ */ __name(() => {
        const fileResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: [Schemas.file, Schemas.vscodeUserData, this.pathService.defaultUriScheme]
        });
        if (!fileResource) {
          return void 0;
        }
        const wsFolder = workspaceContextService.getWorkspaceFolder(fileResource);
        if (!wsFolder) {
          return void 0;
        }
        return this.labelService.getUriLabel(wsFolder.uri, { noPrefix: true });
      }, "getWorkspaceFolderPathForFile"),
      getSelectedText: /* @__PURE__ */ __name(() => {
        const activeTextEditorControl = editorService.activeTextEditorControl;
        let activeControl = null;
        if (isCodeEditor(activeTextEditorControl)) {
          activeControl = activeTextEditorControl;
        } else if (isDiffEditor(activeTextEditorControl)) {
          const original = activeTextEditorControl.getOriginalEditor();
          const modified = activeTextEditorControl.getModifiedEditor();
          activeControl = original.hasWidgetFocus() ? original : modified;
        }
        const activeModel = activeControl?.getModel();
        const activeSelection = activeControl?.getSelection();
        if (activeModel && activeSelection) {
          return activeModel.getValueInRange(activeSelection);
        }
        return void 0;
      }, "getSelectedText"),
      getLineNumber: /* @__PURE__ */ __name(() => {
        const activeTextEditorControl = editorService.activeTextEditorControl;
        if (isCodeEditor(activeTextEditorControl)) {
          const selection = activeTextEditorControl.getSelection();
          if (selection) {
            const lineNumber = selection.positionLineNumber;
            return String(lineNumber);
          }
        }
        return void 0;
      }, "getLineNumber"),
      getColumnNumber: /* @__PURE__ */ __name(() => {
        const activeTextEditorControl = editorService.activeTextEditorControl;
        if (isCodeEditor(activeTextEditorControl)) {
          const selection = activeTextEditorControl.getSelection();
          if (selection) {
            const columnNumber = selection.positionColumn;
            return String(columnNumber);
          }
        }
        return void 0;
      }, "getColumnNumber"),
      getExtension: /* @__PURE__ */ __name((id) => {
        return extensionService.getExtension(id);
      }, "getExtension")
    }, labelService, pathService.userHome().then((home) => home.path), envVariablesPromise);
    this.configurationService = configurationService;
    this.commandService = commandService;
    this.workspaceContextService = workspaceContextService;
    this.quickInputService = quickInputService;
    this.labelService = labelService;
    this.pathService = pathService;
    this.storageService = storageService;
    this.resolvableVariables.add("command");
    this.resolvableVariables.add("input");
  }
  static {
    __name(this, "BaseConfigurationResolverService");
  }
  static INPUT_OR_COMMAND_VARIABLES_PATTERN = /\${((input|command):(.*?))}/g;
  userInputAccessQueue = new Queue();
  async resolveWithInteractionReplace(folder, config, section, variables, target) {
    config = await this.resolveAsync(folder, config);
    const parsed = ConfigurationResolverExpression.parse(config);
    await this.resolveWithInteraction(folder, parsed, section, variables, target);
    return parsed.toObject();
  }
  async resolveWithInteraction(folder, config, section, variableToCommandMap, target) {
    const expr = ConfigurationResolverExpression.parse(config);
    for (const variable of expr.unresolved()) {
      let result;
      if (variable.name === "command") {
        const commandId = (variableToCommandMap ? variableToCommandMap[variable.arg] : void 0) || variable.arg;
        const value = await this.commandService.executeCommand(commandId, expr.toObject());
        if (!Types.isUndefinedOrNull(value)) {
          if (typeof value !== "string") {
            throw new VariableError(VariableKind.Command, localize("commandVariable.noStringType", "Cannot substitute command variable '{0}' because command did not return a result of type string.", commandId));
          }
          result = { value };
        }
      } else if (variable.name === "input") {
        result = await this.showUserInput(section, variable.arg, await this.resolveInputs(folder, section, target), variableToCommandMap);
      } else if (this._contributedVariables.has(variable.inner)) {
        result = { value: await this._contributedVariables.get(variable.inner)() };
      } else {
        continue;
      }
      if (result === void 0) {
        return void 0;
      }
      expr.resolve(variable, result);
    }
    return new Map(Iterable.map(expr.resolved(), ([key, value]) => [key.inner, value.value]));
  }
  async resolveInputs(folder, section, target) {
    if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY || !section) {
      return void 0;
    }
    let inputs;
    const overrides = folder ? { resource: folder.uri } : {};
    const result = this.configurationService.inspect(section, overrides);
    if (result) {
      switch (target) {
        case ConfigurationTarget.MEMORY:
          inputs = result.memoryValue?.inputs;
          break;
        case ConfigurationTarget.DEFAULT:
          inputs = result.defaultValue?.inputs;
          break;
        case ConfigurationTarget.USER:
          inputs = result.userValue?.inputs;
          break;
        case ConfigurationTarget.USER_LOCAL:
          inputs = result.userLocalValue?.inputs;
          break;
        case ConfigurationTarget.USER_REMOTE:
          inputs = result.userRemoteValue?.inputs;
          break;
        case ConfigurationTarget.APPLICATION:
          inputs = result.applicationValue?.inputs;
          break;
        case ConfigurationTarget.WORKSPACE:
          inputs = result.workspaceValue?.inputs;
          break;
        case ConfigurationTarget.WORKSPACE_FOLDER:
        default:
          inputs = result.workspaceFolderValue?.inputs;
          break;
      }
    }
    inputs ??= this.configurationService.getValue(section, overrides)?.inputs;
    return inputs;
  }
  readInputLru() {
    const contents = this.storageService.get(LAST_INPUT_STORAGE_KEY, StorageScope.WORKSPACE);
    const lru = new LRUCache(LAST_INPUT_CACHE_SIZE);
    try {
      if (contents) {
        lru.fromJSON(JSON.parse(contents));
      }
    } catch {
    }
    return lru;
  }
  storeInputLru(lru) {
    this.storageService.store(LAST_INPUT_STORAGE_KEY, JSON.stringify(lru.toJSON()), StorageScope.WORKSPACE, StorageTarget.MACHINE);
  }
  async showUserInput(section, variable, inputInfos, variableToCommandMap) {
    if (!inputInfos) {
      throw new VariableError(VariableKind.Input, localize("inputVariable.noInputSection", "Variable '{0}' must be defined in an '{1}' section of the debug or task configuration.", variable, "inputs"));
    }
    const info = inputInfos.filter((item) => item.id === variable).pop();
    if (info) {
      const missingAttribute = /* @__PURE__ */ __name((attrName) => {
        throw new VariableError(VariableKind.Input, localize("inputVariable.missingAttribute", "Input variable '{0}' is of type '{1}' and must include '{2}'.", variable, info.type, attrName));
      }, "missingAttribute");
      const defaultValueMap = this.readInputLru();
      const defaultValueKey = `${section}.${variable}`;
      const previousPickedValue = defaultValueMap.get(defaultValueKey);
      switch (info.type) {
        case "promptString": {
          if (!Types.isString(info.description)) {
            missingAttribute("description");
          }
          const inputOptions = { prompt: info.description, ignoreFocusLost: true, value: variableToCommandMap?.[`input:${variable}`] ?? previousPickedValue ?? info.default };
          if (info.password) {
            inputOptions.password = info.password;
          }
          return this.userInputAccessQueue.queue(() => this.quickInputService.input(inputOptions)).then((resolvedInput) => {
            if (typeof resolvedInput === "string") {
              this.storeInputLru(defaultValueMap.set(defaultValueKey, resolvedInput));
            }
            return resolvedInput ? { value: resolvedInput, input: info } : void 0;
          });
        }
        case "pickString": {
          if (!Types.isString(info.description)) {
            missingAttribute("description");
          }
          if (Array.isArray(info.options)) {
            for (const pickOption of info.options) {
              if (!Types.isString(pickOption) && !Types.isString(pickOption.value)) {
                missingAttribute("value");
              }
            }
          } else {
            missingAttribute("options");
          }
          const picks = new Array();
          for (const pickOption of info.options) {
            const value = Types.isString(pickOption) ? pickOption : pickOption.value;
            const label = Types.isString(pickOption) ? void 0 : pickOption.label;
            const item = {
              label: label ? `${label}: ${value}` : value,
              value
            };
            const topValue = variableToCommandMap?.[`input:${variable}`] ?? previousPickedValue ?? info.default;
            if (value === info.default) {
              item.description = localize("inputVariable.defaultInputValue", "(Default)");
              picks.unshift(item);
            } else if (value === topValue) {
              picks.unshift(item);
            } else {
              picks.push(item);
            }
          }
          const pickOptions = { placeHolder: info.description, matchOnDetail: true, ignoreFocusLost: true };
          return this.userInputAccessQueue.queue(() => this.quickInputService.pick(picks, pickOptions, void 0)).then((resolvedInput) => {
            if (resolvedInput) {
              const value = resolvedInput.value;
              this.storeInputLru(defaultValueMap.set(defaultValueKey, value));
              return { value, input: info };
            }
            return void 0;
          });
        }
        case "command": {
          if (!Types.isString(info.command)) {
            missingAttribute("command");
          }
          return this.userInputAccessQueue.queue(() => this.commandService.executeCommand(info.command, info.args)).then((result) => {
            if (typeof result === "string" || Types.isUndefinedOrNull(result)) {
              return { value: result, input: info };
            }
            throw new VariableError(VariableKind.Input, localize("inputVariable.command.noStringType", "Cannot substitute input variable '{0}' because command '{1}' did not return a result of type string.", variable, info.command));
          });
        }
        default:
          throw new VariableError(VariableKind.Input, localize("inputVariable.unknownType", "Input variable '{0}' can only be of type 'promptString', 'pickString', or 'command'.", variable));
      }
    }
    throw new VariableError(VariableKind.Input, localize("inputVariable.undefinedVariable", "Undefined input variable '{0}' encountered. Remove or define '{0}' to continue.", variable));
  }
}
export {
  BaseConfigurationResolverService
};
//# sourceMappingURL=baseConfigurationResolverService.js.map
