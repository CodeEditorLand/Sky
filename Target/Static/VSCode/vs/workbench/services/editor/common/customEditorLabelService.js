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
import { Emitter, Event } from "../../../../base/common/event.js";
import { ParsedPattern, parse as parseGlob } from "../../../../base/common/glob.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isAbsolute, parse as parsePath, ParsedPath, dirname } from "../../../../base/common/path.js";
import { dirname as resourceDirname, relativePath as getRelativePath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { MRUCache } from "../../../../base/common/map.js";
let CustomEditorLabelService = class extends Disposable {
  constructor(configurationService, workspaceContextService) {
    super();
    this.configurationService = configurationService;
    this.workspaceContextService = workspaceContextService;
    this.storeEnablementState();
    this.storeCustomPatterns();
    this.registerListeners();
  }
  static {
    __name(this, "CustomEditorLabelService");
  }
  _serviceBrand;
  static SETTING_ID_PATTERNS = "workbench.editor.customLabels.patterns";
  static SETTING_ID_ENABLED = "workbench.editor.customLabels.enabled";
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  patterns = [];
  enabled = true;
  cache = new MRUCache(1e3);
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CustomEditorLabelService.SETTING_ID_ENABLED)) {
        const oldEnablement = this.enabled;
        this.storeEnablementState();
        if (oldEnablement !== this.enabled && this.patterns.length > 0) {
          this._onDidChange.fire();
        }
      } else if (e.affectsConfiguration(CustomEditorLabelService.SETTING_ID_PATTERNS)) {
        this.cache.clear();
        this.storeCustomPatterns();
        this._onDidChange.fire();
      }
    }));
  }
  storeEnablementState() {
    this.enabled = this.configurationService.getValue(CustomEditorLabelService.SETTING_ID_ENABLED);
  }
  _templateRegexValidation = /[a-zA-Z0-9]/;
  storeCustomPatterns() {
    this.patterns = [];
    const customLabelPatterns = this.configurationService.getValue(CustomEditorLabelService.SETTING_ID_PATTERNS);
    for (const pattern in customLabelPatterns) {
      const template = customLabelPatterns[pattern];
      if (!this._templateRegexValidation.test(template)) {
        continue;
      }
      const isAbsolutePath = isAbsolute(pattern);
      const parsedPattern = parseGlob(pattern);
      this.patterns.push({ pattern, template, isAbsolutePath, parsedPattern });
    }
    this.patterns.sort((a, b) => this.patternWeight(b.pattern) - this.patternWeight(a.pattern));
  }
  patternWeight(pattern) {
    let weight = 0;
    for (const fragment of pattern.split("/")) {
      if (fragment === "**") {
        weight += 1;
      } else if (fragment === "*") {
        weight += 10;
      } else if (fragment.includes("*") || fragment.includes("?")) {
        weight += 50;
      } else if (fragment !== "") {
        weight += 100;
      }
    }
    return weight;
  }
  getName(resource) {
    if (!this.enabled || this.patterns.length === 0) {
      return void 0;
    }
    const key = resource.toString();
    const cached = this.cache.get(key);
    if (cached !== void 0) {
      return cached ?? void 0;
    }
    const result = this.applyPatterns(resource);
    this.cache.set(key, result ?? null);
    return result;
  }
  applyPatterns(resource) {
    const root = this.workspaceContextService.getWorkspaceFolder(resource);
    let relativePath;
    for (const pattern of this.patterns) {
      let relevantPath;
      if (root && !pattern.isAbsolutePath) {
        if (!relativePath) {
          relativePath = getRelativePath(resourceDirname(root.uri), resource) ?? resource.path;
        }
        relevantPath = relativePath;
      } else {
        relevantPath = resource.path;
      }
      if (pattern.parsedPattern(relevantPath)) {
        return this.applyTemplate(pattern.template, resource, relevantPath);
      }
    }
    return void 0;
  }
  _parsedTemplateExpression = /\$\{(dirname|filename|extname|extname\((?<extnameN>[-+]?\d+)\)|dirname\((?<dirnameN>[-+]?\d+)\))\}/g;
  _filenameCaptureExpression = /(?<filename>^\.*[^.]*)/;
  applyTemplate(template, resource, relevantPath) {
    let parsedPath;
    return template.replace(this._parsedTemplateExpression, (match, variable, ...args) => {
      parsedPath = parsedPath ?? parsePath(resource.path);
      const { dirnameN = "0", extnameN = "0" } = args.pop();
      if (variable === "filename") {
        const { filename } = this._filenameCaptureExpression.exec(parsedPath.base)?.groups ?? {};
        if (filename) {
          return filename;
        }
      } else if (variable === "extname") {
        const extension = this.getExtnames(parsedPath.base);
        if (extension) {
          return extension;
        }
      } else if (variable.startsWith("extname")) {
        const n = parseInt(extnameN);
        const nthExtname = this.getNthExtname(parsedPath.base, n);
        if (nthExtname) {
          return nthExtname;
        }
      } else if (variable.startsWith("dirname")) {
        const n = parseInt(dirnameN);
        const nthDir = this.getNthDirname(dirname(relevantPath), n);
        if (nthDir) {
          return nthDir;
        }
      }
      return match;
    });
  }
  removeLeadingDot(path) {
    let withoutLeadingDot = path;
    while (withoutLeadingDot.startsWith(".")) {
      withoutLeadingDot = withoutLeadingDot.slice(1);
    }
    return withoutLeadingDot;
  }
  getNthDirname(path, n) {
    path = path.startsWith("/") ? path.slice(1) : path;
    const pathFragments = path.split("/");
    return this.getNthFragment(pathFragments, n);
  }
  getExtnames(fullFileName) {
    return this.removeLeadingDot(fullFileName).split(".").slice(1).join(".");
  }
  getNthExtname(fullFileName, n) {
    const extensionNameFragments = this.removeLeadingDot(fullFileName).split(".");
    extensionNameFragments.shift();
    return this.getNthFragment(extensionNameFragments, n);
  }
  getNthFragment(fragments, n) {
    const length = fragments.length;
    let nth;
    if (n < 0) {
      nth = Math.abs(n) - 1;
    } else {
      nth = length - n - 1;
    }
    const nthFragment = fragments[nth];
    if (nthFragment === void 0 || nthFragment === "") {
      return void 0;
    }
    return nthFragment;
  }
};
CustomEditorLabelService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkspaceContextService)
], CustomEditorLabelService);
const ICustomEditorLabelService = createDecorator("ICustomEditorLabelService");
registerSingleton(ICustomEditorLabelService, CustomEditorLabelService, InstantiationType.Delayed);
export {
  CustomEditorLabelService,
  ICustomEditorLabelService
};
//# sourceMappingURL=customEditorLabelService.js.map
