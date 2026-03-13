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
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IAgentPluginRepositoryService } from "../common/plugins/agentPluginRepositoryService.js";
import { IPluginMarketplaceService, hasSourceChanged, parseMarketplaceReference } from "../common/plugins/pluginMarketplaceService.js";
let PluginInstallService = class PluginInstallService2 {
  static {
    __name(this, "PluginInstallService");
  }
  constructor(_pluginRepositoryService, _pluginMarketplaceService, _fileService, _notificationService, _dialogService, _logService, _progressService, _commandService, _quickInputService) {
    this._pluginRepositoryService = _pluginRepositoryService;
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._fileService = _fileService;
    this._notificationService = _notificationService;
    this._dialogService = _dialogService;
    this._logService = _logService;
    this._progressService = _progressService;
    this._commandService = _commandService;
    this._quickInputService = _quickInputService;
  }
  async installPlugin(plugin) {
    if (!await this._ensureMarketplaceTrusted(plugin)) {
      return;
    }
    const kind = plugin.sourceDescriptor.kind;
    if (kind === "relativePath") {
      return this._installRelativePathPlugin(plugin);
    }
    if (kind === "npm" || kind === "pip") {
      await this._installPackagePlugin(plugin);
      return;
    }
    return this._installGitPlugin(plugin);
  }
  async installPluginFromSource(source) {
    const reference = parseMarketplaceReference(source);
    if (!reference) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("invalidSource", "'{0}' is not a valid plugin source. Enter a GitHub repository (owner/repo) or a git clone URL.", source)
      });
      return;
    }
    if (reference.kind === "localFileUri") {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("localSourceNotSupported", "Local file paths are not supported. Enter a GitHub repository (owner/repo) or a git clone URL.")
      });
      return;
    }
    const sourceDescriptor = reference.kind === "githubShorthand" ? { kind: "github", repo: reference.githubRepo } : { kind: "url", url: reference.cloneUrl };
    const tempPlugin = {
      name: reference.displayLabel,
      description: "",
      version: "",
      source: "",
      sourceDescriptor,
      marketplace: reference.displayLabel,
      marketplaceReference: reference,
      marketplaceType: "openPlugin"
    };
    if (!await this._ensureMarketplaceTrusted(tempPlugin)) {
      return;
    }
    let repoDir;
    try {
      repoDir = await this._pluginRepositoryService.ensurePluginSource(tempPlugin, {
        progressTitle: localize("cloningSource", "Cloning plugin source '{0}'...", reference.displayLabel),
        failureLabel: reference.displayLabel,
        marketplaceType: "openPlugin"
      });
    } catch {
      return;
    }
    const repoExists = await this._fileService.exists(repoDir);
    if (!repoExists) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("cloneFailed", "Failed to clone plugin source '{0}'.", reference.displayLabel)
      });
      return;
    }
    const discoveredPlugins = await this._pluginMarketplaceService.readPluginsFromDirectory(repoDir, reference);
    if (discoveredPlugins.length === 0) {
      const repoName = basename(URI.parse(reference.cloneUrl));
      const plugin2 = {
        name: repoName.replace(/\.git$/i, ""),
        description: "",
        version: "",
        source: "",
        sourceDescriptor,
        marketplace: reference.displayLabel,
        marketplaceReference: reference,
        marketplaceType: "openPlugin"
      };
      this._pluginMarketplaceService.addInstalledPlugin(repoDir, plugin2);
      return;
    }
    if (discoveredPlugins.length === 1) {
      const plugin2 = discoveredPlugins[0];
      const pluginDir2 = plugin2.source ? URI.joinPath(repoDir, plugin2.source) : repoDir;
      this._pluginMarketplaceService.addInstalledPlugin(pluginDir2, plugin2);
      return;
    }
    const picks = discoveredPlugins.map((p) => ({
      label: p.name,
      description: p.description,
      plugin: p
    }));
    const selected = await this._quickInputService.pick(picks, {
      placeHolder: localize("selectPlugin", "Select a plugin to install from '{0}'", reference.displayLabel),
      canPickMany: false
    });
    if (!selected) {
      return;
    }
    const plugin = selected.plugin;
    const pluginDir = plugin.source ? URI.joinPath(repoDir, plugin.source) : repoDir;
    this._pluginMarketplaceService.addInstalledPlugin(pluginDir, plugin);
  }
  async updatePlugin(plugin, silent) {
    const kind = plugin.sourceDescriptor.kind;
    if (kind === "npm" || kind === "pip") {
      return this._installPackagePlugin(plugin, silent);
    }
    return this._pluginRepositoryService.updatePluginSource(plugin, {
      pluginName: plugin.name,
      failureLabel: plugin.name,
      marketplaceType: plugin.marketplaceType
    });
  }
  async updateAllPlugins(options, token) {
    const installed = this._pluginMarketplaceService.installedPlugins.get().filter((e) => e.enabled);
    if (installed.length === 0) {
      return { updatedNames: [], failedNames: [] };
    }
    const updatedNames = [];
    const failedNames = [];
    const doUpdate = /* @__PURE__ */ __name(async () => {
      const gitTasks = [];
      const packagePlugins = [];
      const seenMarketplaces = /* @__PURE__ */ new Set();
      for (const entry of installed) {
        const ref = entry.plugin.marketplaceReference;
        if (seenMarketplaces.has(ref.canonicalId)) {
          continue;
        }
        seenMarketplaces.add(ref.canonicalId);
        gitTasks.push((async () => {
          if (token.isCancellationRequested) {
            return;
          }
          try {
            const changed = await this._pluginRepositoryService.pullRepository(ref, {
              pluginName: ref.displayLabel,
              failureLabel: ref.displayLabel,
              marketplaceType: entry.plugin.marketplaceType,
              silent: options.silent
            });
            if (changed) {
              updatedNames.push(ref.displayLabel);
            }
          } catch (err) {
            this._logService.error(`[PluginInstallService] Failed to pull marketplace '${ref.displayLabel}':`, err);
            failedNames.push(ref.displayLabel);
          }
        })());
      }
      await Promise.all(gitTasks);
      const marketplacePlugins = await this._pluginMarketplaceService.fetchMarketplacePlugins(token);
      const marketplaceByKey = /* @__PURE__ */ new Map();
      for (const mp of marketplacePlugins) {
        marketplaceByKey.set(`${mp.marketplaceReference.canonicalId}::${mp.name}`, mp);
      }
      const independentGitTasks = [];
      for (const entry of installed) {
        if (entry.plugin.sourceDescriptor.kind === "relativePath") {
          continue;
        }
        const livePlugin = marketplaceByKey.get(`${entry.plugin.marketplaceReference.canonicalId}::${entry.plugin.name}`);
        if (!livePlugin || !hasSourceChanged(entry.plugin.sourceDescriptor, livePlugin.sourceDescriptor)) {
          continue;
        }
        const desc = livePlugin.sourceDescriptor;
        if (desc.kind === "npm" || desc.kind === "pip") {
          if (!options.force && !desc.version) {
            continue;
          }
          packagePlugins.push({ installed: entry.plugin, marketplace: livePlugin });
          continue;
        }
        independentGitTasks.push((async () => {
          if (token.isCancellationRequested) {
            return;
          }
          try {
            const changed = await this._pluginRepositoryService.updatePluginSource(livePlugin, {
              pluginName: livePlugin.name,
              failureLabel: livePlugin.name,
              marketplaceType: livePlugin.marketplaceType,
              silent: options.silent
            });
            if (changed) {
              updatedNames.push(livePlugin.name);
              this._pluginMarketplaceService.addInstalledPlugin(entry.pluginUri, livePlugin);
            }
          } catch (err) {
            this._logService.error(`[PluginInstallService] Failed to update plugin '${livePlugin.name}':`, err);
            failedNames.push(livePlugin.name);
          }
        })());
      }
      await Promise.all(independentGitTasks);
      for (const { installed: _installed, marketplace } of packagePlugins) {
        if (token.isCancellationRequested) {
          return;
        }
        try {
          const changed = await this.updatePlugin(marketplace, options?.silent);
          if (changed) {
            updatedNames.push(marketplace.name);
            const pluginUri = this._pluginRepositoryService.getPluginSourceInstallUri(marketplace.sourceDescriptor);
            this._pluginMarketplaceService.addInstalledPlugin(pluginUri, marketplace);
          }
        } catch (err) {
          this._logService.error(`[PluginInstallService] Failed to update plugin '${marketplace.name}':`, err);
          failedNames.push(marketplace.name);
        }
      }
    }, "doUpdate");
    if (options.silent) {
      await doUpdate();
    } else {
      await this._progressService.withProgress({
        location: 15,
        title: localize("updatingAllPlugins", "Updating plugins...")
      }, doUpdate);
    }
    if (failedNames.length > 0) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("updateAllFailed", "Failed to update: {0}", failedNames.join(", ")),
        actions: {
          primary: [new Action("showGitOutput", localize("showOutput", "Show Output"), void 0, true, () => {
            this._commandService.executeCommand("git.showOutput");
          })]
        }
      });
    } else if (updatedNames.length > 0) {
      this._pluginMarketplaceService.clearUpdatesAvailable();
      this._notificationService.notify({
        severity: Severity.Info,
        message: localize("updateAllSuccess", "Updated plugins: {0}", updatedNames.join(", "))
      });
    } else if (!token.isCancellationRequested) {
      this._pluginMarketplaceService.clearUpdatesAvailable();
    }
    return { updatedNames, failedNames };
  }
  getPluginInstallUri(plugin) {
    if (plugin.sourceDescriptor.kind === "relativePath") {
      return this._pluginRepositoryService.getPluginInstallUri(plugin);
    }
    return this._pluginRepositoryService.getPluginSourceInstallUri(plugin.sourceDescriptor);
  }
  // --- Trust gate -------------------------------------------------------------
  async _ensureMarketplaceTrusted(plugin) {
    if (this._pluginMarketplaceService.isMarketplaceTrusted(plugin.marketplaceReference)) {
      return true;
    }
    const { confirmed } = await this._dialogService.confirm({
      type: "question",
      message: localize("trustMarketplace", "Trust Plugins from '{0}'?", plugin.marketplaceReference.displayLabel),
      detail: localize("trustMarketplaceDetail", "Plugins can run code on your machine. Only install plugins from sources you trust.\n\nSource: {0}", plugin.marketplaceReference.rawValue),
      primaryButton: localize({ key: "trustAndInstall", comment: ["&& denotes a mnemonic"] }, "&&Trust"),
      custom: {
        icon: Codicon.shield
      }
    });
    if (!confirmed) {
      return false;
    }
    this._pluginMarketplaceService.trustMarketplace(plugin.marketplaceReference);
    return true;
  }
  // --- Relative-path source (existing git-based flow) -----------------------
  async _installRelativePathPlugin(plugin) {
    try {
      await this._pluginRepositoryService.ensureRepository(plugin.marketplaceReference, {
        progressTitle: localize("installingPlugin", "Installing plugin '{0}'...", plugin.name),
        failureLabel: plugin.name,
        marketplaceType: plugin.marketplaceType
      });
    } catch {
      return;
    }
    let pluginDir;
    try {
      pluginDir = this._pluginRepositoryService.getPluginInstallUri(plugin);
    } catch {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("pluginDirInvalid", "Plugin source directory '{0}' is invalid for repository '{1}'.", plugin.source, plugin.marketplace)
      });
      return;
    }
    const pluginExists = await this._fileService.exists(pluginDir);
    if (!pluginExists) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("pluginDirNotFound", "Plugin source directory '{0}' not found in repository '{1}'.", plugin.source, plugin.marketplace)
      });
      return;
    }
    this._pluginMarketplaceService.addInstalledPlugin(pluginDir, plugin);
  }
  // --- GitHub / Git URL source (independent clone) --------------------------
  async _installGitPlugin(plugin) {
    const repo = this._pluginRepositoryService.getPluginSource(plugin.sourceDescriptor.kind);
    let pluginDir;
    try {
      pluginDir = await this._pluginRepositoryService.ensurePluginSource(plugin, {
        progressTitle: localize("installingPlugin", "Installing plugin '{0}'...", plugin.name),
        failureLabel: plugin.name,
        marketplaceType: plugin.marketplaceType
      });
    } catch {
      return;
    }
    const pluginExists = await this._fileService.exists(pluginDir);
    if (!pluginExists) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("pluginSourceNotFound", "Plugin source '{0}' not found after cloning.", repo.getLabel(plugin.sourceDescriptor))
      });
      return;
    }
    this._pluginMarketplaceService.addInstalledPlugin(pluginDir, plugin);
  }
  // --- Package-manager sources (npm / pip) ----------------------------------
  async _installPackagePlugin(plugin, silent) {
    const repo = this._pluginRepositoryService.getPluginSource(plugin.sourceDescriptor.kind);
    if (!repo.runInstall) {
      this._logService.error(`[PluginInstallService] Expected package repository for kind '${plugin.sourceDescriptor.kind}'`);
      return false;
    }
    const installDir = await this._pluginRepositoryService.ensurePluginSource(plugin);
    const pluginDir = this._pluginRepositoryService.getPluginSourceInstallUri(plugin.sourceDescriptor);
    const result = await repo.runInstall(installDir, pluginDir, plugin, { silent });
    if (!result) {
      return false;
    }
    this._pluginMarketplaceService.addInstalledPlugin(result.pluginDir, plugin);
    return true;
  }
};
PluginInstallService = __decorate([
  __param(0, IAgentPluginRepositoryService),
  __param(1, IPluginMarketplaceService),
  __param(2, IFileService),
  __param(3, INotificationService),
  __param(4, IDialogService),
  __param(5, ILogService),
  __param(6, IProgressService),
  __param(7, ICommandService),
  __param(8, IQuickInputService)
], PluginInstallService);
export {
  PluginInstallService
};
//# sourceMappingURL=pluginInstallService.js.map
