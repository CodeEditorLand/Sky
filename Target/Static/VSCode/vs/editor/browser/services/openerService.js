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
import * as dom from "../../../base/browser/dom.js";
import { mainWindow } from "../../../base/browser/window.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
import { ResourceMap } from "../../../base/common/map.js";
import { parse } from "../../../base/common/marshalling.js";
import { matchesScheme, matchesSomeScheme, Schemas } from "../../../base/common/network.js";
import { normalizePath } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { ICodeEditorService } from "./codeEditorService.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
import { EditorOpenSource } from "../../../platform/editor/common/editor.js";
import { extractSelection, IExternalOpener, IExternalUriResolver, IOpener, IOpenerService, IResolvedExternalUri, IValidator, OpenOptions, ResolveExternalUriOptions } from "../../../platform/opener/common/opener.js";
let CommandOpener = class {
  constructor(_commandService) {
    this._commandService = _commandService;
  }
  static {
    __name(this, "CommandOpener");
  }
  async open(target, options) {
    if (!matchesScheme(target, Schemas.command)) {
      return false;
    }
    if (!options?.allowCommands) {
      return true;
    }
    if (typeof target === "string") {
      target = URI.parse(target);
    }
    if (Array.isArray(options.allowCommands)) {
      if (!options.allowCommands.includes(target.path)) {
        return true;
      }
    }
    let args = [];
    try {
      args = parse(decodeURIComponent(target.query));
    } catch {
      try {
        args = parse(target.query);
      } catch {
      }
    }
    if (!Array.isArray(args)) {
      args = [args];
    }
    await this._commandService.executeCommand(target.path, ...args);
    return true;
  }
};
CommandOpener = __decorateClass([
  __decorateParam(0, ICommandService)
], CommandOpener);
let EditorOpener = class {
  constructor(_editorService) {
    this._editorService = _editorService;
  }
  static {
    __name(this, "EditorOpener");
  }
  async open(target, options) {
    if (typeof target === "string") {
      target = URI.parse(target);
    }
    const { selection, uri } = extractSelection(target);
    target = uri;
    if (target.scheme === Schemas.file) {
      target = normalizePath(target);
    }
    await this._editorService.openCodeEditor(
      {
        resource: target,
        options: {
          selection,
          source: options?.fromUserGesture ? EditorOpenSource.USER : EditorOpenSource.API,
          ...options?.editorOptions
        }
      },
      this._editorService.getFocusedCodeEditor(),
      options?.openToSide
    );
    return true;
  }
};
EditorOpener = __decorateClass([
  __decorateParam(0, ICodeEditorService)
], EditorOpener);
let OpenerService = class {
  static {
    __name(this, "OpenerService");
  }
  _openers = new LinkedList();
  _validators = new LinkedList();
  _resolvers = new LinkedList();
  _resolvedUriTargets = new ResourceMap((uri) => uri.with({ path: null, fragment: null, query: null }).toString());
  _defaultExternalOpener;
  _externalOpeners = new LinkedList();
  constructor(editorService, commandService) {
    this._defaultExternalOpener = {
      openExternal: /* @__PURE__ */ __name(async (href) => {
        if (matchesSomeScheme(href, Schemas.http, Schemas.https)) {
          dom.windowOpenNoOpener(href);
        } else {
          mainWindow.location.href = href;
        }
        return true;
      }, "openExternal")
    };
    this._openers.push({
      open: /* @__PURE__ */ __name(async (target, options) => {
        if (options?.openExternal || matchesSomeScheme(target, Schemas.mailto, Schemas.http, Schemas.https, Schemas.vsls)) {
          await this._doOpenExternal(target, options);
          return true;
        }
        return false;
      }, "open")
    });
    this._openers.push(new CommandOpener(commandService));
    this._openers.push(new EditorOpener(editorService));
  }
  registerOpener(opener) {
    const remove = this._openers.unshift(opener);
    return { dispose: remove };
  }
  registerValidator(validator) {
    const remove = this._validators.push(validator);
    return { dispose: remove };
  }
  registerExternalUriResolver(resolver) {
    const remove = this._resolvers.push(resolver);
    return { dispose: remove };
  }
  setDefaultExternalOpener(externalOpener) {
    this._defaultExternalOpener = externalOpener;
  }
  registerExternalOpener(opener) {
    const remove = this._externalOpeners.push(opener);
    return { dispose: remove };
  }
  async open(target, options) {
    if (!options?.skipValidation) {
      const targetURI = typeof target === "string" ? URI.parse(target) : target;
      const validationTarget = this._resolvedUriTargets.get(targetURI) ?? target;
      for (const validator of this._validators) {
        if (!await validator.shouldOpen(validationTarget, options)) {
          return false;
        }
      }
    }
    for (const opener of this._openers) {
      const handled = await opener.open(target, options);
      if (handled) {
        return true;
      }
    }
    return false;
  }
  async resolveExternalUri(resource, options) {
    for (const resolver of this._resolvers) {
      try {
        const result = await resolver.resolveExternalUri(resource, options);
        if (result) {
          if (!this._resolvedUriTargets.has(result.resolved)) {
            this._resolvedUriTargets.set(result.resolved, resource);
          }
          return result;
        }
      } catch {
      }
    }
    throw new Error("Could not resolve external URI: " + resource.toString());
  }
  async _doOpenExternal(resource, options) {
    const uri = typeof resource === "string" ? URI.parse(resource) : resource;
    let externalUri;
    try {
      externalUri = (await this.resolveExternalUri(uri, options)).resolved;
    } catch {
      externalUri = uri;
    }
    let href;
    if (typeof resource === "string" && uri.toString() === externalUri.toString()) {
      href = resource;
    } else {
      href = encodeURI(externalUri.toString(true));
    }
    if (options?.allowContributedOpeners) {
      const preferredOpenerId = typeof options?.allowContributedOpeners === "string" ? options?.allowContributedOpeners : void 0;
      for (const opener of this._externalOpeners) {
        const didOpen = await opener.openExternal(href, {
          sourceUri: uri,
          preferredOpenerId
        }, CancellationToken.None);
        if (didOpen) {
          return true;
        }
      }
    }
    return this._defaultExternalOpener.openExternal(href, { sourceUri: uri }, CancellationToken.None);
  }
  dispose() {
    this._validators.clear();
  }
};
OpenerService = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, ICommandService)
], OpenerService);
export {
  OpenerService
};
//# sourceMappingURL=openerService.js.map
