var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { Emitter } from "../../../../base/common/event.js";
import { IInstantiationService, createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITunnelService } from "../../../../platform/tunnel/common/tunnel.js";
import { TunnelModel } from "./tunnelModel.js";
import { ExtensionsRegistry } from "../../extensions/common/extensionsRegistry.js";
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
const IRemoteExplorerService = createDecorator("remoteExplorerService");
const REMOTE_EXPLORER_TYPE_KEY = "remote.explorerType";
const TUNNEL_VIEW_ID = "~remote.forwardedPorts";
const TUNNEL_VIEW_CONTAINER_ID = "~remote.forwardedPortsContainer";
const PORT_AUTO_FORWARD_SETTING = "remote.autoForwardPorts";
const PORT_AUTO_SOURCE_SETTING = "remote.autoForwardPortsSource";
const PORT_AUTO_FALLBACK_SETTING = "remote.autoForwardPortsFallback";
const PORT_AUTO_SOURCE_SETTING_PROCESS = "process";
const PORT_AUTO_SOURCE_SETTING_OUTPUT = "output";
const PORT_AUTO_SOURCE_SETTING_HYBRID = "hybrid";
var TunnelType;
(function(TunnelType2) {
  TunnelType2["Candidate"] = "Candidate";
  TunnelType2["Detected"] = "Detected";
  TunnelType2["Forwarded"] = "Forwarded";
  TunnelType2["Add"] = "Add";
})(TunnelType || (TunnelType = {}));
var TunnelEditId;
(function(TunnelEditId2) {
  TunnelEditId2[TunnelEditId2["None"] = 0] = "None";
  TunnelEditId2[TunnelEditId2["New"] = 1] = "New";
  TunnelEditId2[TunnelEditId2["Label"] = 2] = "Label";
  TunnelEditId2[TunnelEditId2["LocalPort"] = 3] = "LocalPort";
})(TunnelEditId || (TunnelEditId = {}));
const getStartedWalkthrough = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      description: nls.localize("getStartedWalkthrough.id", "The ID of a Get Started walkthrough to open."),
      type: "string"
    }
  }
};
const remoteHelpExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "remoteHelp",
  jsonSchema: {
    description: nls.localize("RemoteHelpInformationExtPoint", "Contributes help information for Remote"),
    type: "object",
    properties: {
      "getStarted": {
        description: nls.localize("RemoteHelpInformationExtPoint.getStarted", "The url, or a command that returns the url, to your project's Getting Started page, or a walkthrough ID contributed by your project's extension"),
        oneOf: [
          { type: "string" },
          getStartedWalkthrough
        ]
      },
      "documentation": {
        description: nls.localize("RemoteHelpInformationExtPoint.documentation", "The url, or a command that returns the url, to your project's documentation page"),
        type: "string"
      },
      "feedback": {
        description: nls.localize("RemoteHelpInformationExtPoint.feedback", "The url, or a command that returns the url, to your project's feedback reporter"),
        type: "string",
        markdownDeprecationMessage: nls.localize("RemoteHelpInformationExtPoint.feedback.deprecated", "Use {0} instead", "`reportIssue`")
      },
      "reportIssue": {
        description: nls.localize("RemoteHelpInformationExtPoint.reportIssue", "The url, or a command that returns the url, to your project's issue reporter"),
        type: "string"
      },
      "issues": {
        description: nls.localize("RemoteHelpInformationExtPoint.issues", "The url, or a command that returns the url, to your project's issues list"),
        type: "string"
      }
    }
  }
});
var PortsEnablement;
(function(PortsEnablement2) {
  PortsEnablement2[PortsEnablement2["Disabled"] = 0] = "Disabled";
  PortsEnablement2[PortsEnablement2["ViewOnly"] = 1] = "ViewOnly";
  PortsEnablement2[PortsEnablement2["AdditionalFeatures"] = 2] = "AdditionalFeatures";
})(PortsEnablement || (PortsEnablement = {}));
let RemoteExplorerService = class RemoteExplorerService2 {
  static {
    __name(this, "RemoteExplorerService");
  }
  constructor(storageService, tunnelService, instantiationService) {
    this.storageService = storageService;
    this.tunnelService = tunnelService;
    this._targetType = [];
    this._onDidChangeTargetType = new Emitter();
    this.onDidChangeTargetType = this._onDidChangeTargetType.event;
    this._onDidChangeHelpInformation = new Emitter();
    this.onDidChangeHelpInformation = this._onDidChangeHelpInformation.event;
    this._helpInformation = [];
    this._onDidChangeEditable = new Emitter();
    this.onDidChangeEditable = this._onDidChangeEditable.event;
    this._onEnabledPortsFeatures = new Emitter();
    this.onEnabledPortsFeatures = this._onEnabledPortsFeatures.event;
    this._portsFeaturesEnabled = PortsEnablement.Disabled;
    this.namedProcesses = /* @__PURE__ */ new Map();
    this._tunnelModel = instantiationService.createInstance(TunnelModel);
    remoteHelpExtPoint.setHandler((extensions) => {
      this._helpInformation.push(...extensions);
      this._onDidChangeHelpInformation.fire(extensions);
    });
  }
  get helpInformation() {
    return this._helpInformation;
  }
  set targetType(name) {
    const current = this._targetType.length > 0 ? this._targetType[0] : "";
    const newName = name.length > 0 ? name[0] : "";
    if (current !== newName) {
      this._targetType = name;
      this.storageService.store(
        REMOTE_EXPLORER_TYPE_KEY,
        this._targetType.toString(),
        1,
        1
        /* StorageTarget.MACHINE */
      );
      this.storageService.store(
        REMOTE_EXPLORER_TYPE_KEY,
        this._targetType.toString(),
        0,
        0
        /* StorageTarget.USER */
      );
      this._onDidChangeTargetType.fire(this._targetType);
    }
  }
  get targetType() {
    return this._targetType;
  }
  get tunnelModel() {
    return this._tunnelModel;
  }
  forward(tunnelProperties, attributes) {
    return this.tunnelModel.forward(tunnelProperties, attributes);
  }
  close(remote, reason) {
    return this.tunnelModel.close(remote.host, remote.port, reason);
  }
  setTunnelInformation(tunnelInformation) {
    if (tunnelInformation?.features) {
      this.tunnelService.setTunnelFeatures(tunnelInformation.features);
    }
    this.tunnelModel.addEnvironmentTunnels(tunnelInformation?.environmentTunnels);
  }
  setEditable(tunnelItem, editId, data) {
    if (!data) {
      this._editable = void 0;
    } else {
      this._editable = { tunnelItem, data, editId };
    }
    this._onDidChangeEditable.fire(tunnelItem ? { tunnel: tunnelItem, editId } : void 0);
  }
  getEditableData(tunnelItem, editId) {
    return this._editable && (!tunnelItem && tunnelItem === this._editable.tunnelItem || tunnelItem && this._editable.tunnelItem?.remotePort === tunnelItem.remotePort && this._editable.tunnelItem.remoteHost === tunnelItem.remoteHost && this._editable.editId === editId) ? this._editable.data : void 0;
  }
  setCandidateFilter(filter) {
    if (!filter) {
      return {
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      };
    }
    this.tunnelModel.setCandidateFilter(filter);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.tunnelModel.setCandidateFilter(void 0);
      }, "dispose")
    };
  }
  onFoundNewCandidates(candidates) {
    this.tunnelModel.setCandidates(candidates);
  }
  restore() {
    return this.tunnelModel.restoreForwarded();
  }
  enablePortsFeatures(viewOnly) {
    this._portsFeaturesEnabled = viewOnly ? PortsEnablement.ViewOnly : PortsEnablement.AdditionalFeatures;
    this._onEnabledPortsFeatures.fire();
  }
  get portsFeaturesEnabled() {
    return this._portsFeaturesEnabled;
  }
};
RemoteExplorerService = __decorate([
  __param(0, IStorageService),
  __param(1, ITunnelService),
  __param(2, IInstantiationService)
], RemoteExplorerService);
registerSingleton(
  IRemoteExplorerService,
  RemoteExplorerService,
  1
  /* InstantiationType.Delayed */
);
export {
  IRemoteExplorerService,
  PORT_AUTO_FALLBACK_SETTING,
  PORT_AUTO_FORWARD_SETTING,
  PORT_AUTO_SOURCE_SETTING,
  PORT_AUTO_SOURCE_SETTING_HYBRID,
  PORT_AUTO_SOURCE_SETTING_OUTPUT,
  PORT_AUTO_SOURCE_SETTING_PROCESS,
  PortsEnablement,
  REMOTE_EXPLORER_TYPE_KEY,
  TUNNEL_VIEW_CONTAINER_ID,
  TUNNEL_VIEW_ID,
  TunnelEditId,
  TunnelType
};
//# sourceMappingURL=remoteExplorerService.js.map
