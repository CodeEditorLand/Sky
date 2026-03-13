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
import { timeout } from "../../../../base/common/async.js";
import { Event } from "../../../../base/common/event.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { isWindows } from "../../../../base/common/platform.js";
import { dirname, joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { ITerminalService } from "../../terminal/browser/terminal.js";
function sanitizeCacheSegment(name) {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}
__name(sanitizeCacheSegment, "sanitizeCacheSegment");
function gitRevisionCacheSuffix(ref, sha) {
  if (sha) {
    return [`sha_${sanitizeCacheSegment(sha)}`];
  }
  if (ref) {
    return [`ref_${sanitizeCacheSegment(ref)}`];
  }
  return [];
}
__name(gitRevisionCacheSuffix, "gitRevisionCacheSuffix");
function showGitOutputAction(commandService) {
  return new Action("showGitOutput", localize("showGitOutput", "Show Git Output"), void 0, true, () => {
    commandService.executeCommand("git.showOutput");
  });
}
__name(showGitOutputAction, "showGitOutputAction");
function shellEscapeArg(value) {
  if (isWindows) {
    return `"${value.replace(/[`$"]/g, "`$&")}"`;
  }
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
__name(shellEscapeArg, "shellEscapeArg");
function formatShellCommand(args) {
  const [command, ...rest] = args;
  return [command, ...rest.map((arg) => shellEscapeArg(arg))].join(" ");
}
__name(formatShellCommand, "formatShellCommand");
let AbstractGitPluginSource = class AbstractGitPluginSource2 {
  static {
    __name(this, "AbstractGitPluginSource");
  }
  constructor(_commandService, _fileService, _logService, _notificationService, _progressService) {
    this._commandService = _commandService;
    this._fileService = _fileService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._progressService = _progressService;
  }
  getCleanupTarget(cacheRoot, descriptor) {
    return this.getInstallUri(cacheRoot, descriptor);
  }
  async ensure(cacheRoot, plugin, options) {
    const descriptor = plugin.sourceDescriptor;
    const repoDir = this.getInstallUri(cacheRoot, descriptor);
    const repoExists = await this._fileService.exists(repoDir);
    const label = this._displayLabel(descriptor);
    if (repoExists) {
      await this._checkoutRevision(repoDir, descriptor, options?.failureLabel ?? label);
      return repoDir;
    }
    const progressTitle = options?.progressTitle ?? localize("cloningPluginSource", "Cloning plugin source '{0}'...", label);
    const failureLabel = options?.failureLabel ?? label;
    const ref = descriptor.ref;
    await this._cloneRepository(repoDir, this._cloneUrl(descriptor), progressTitle, failureLabel, ref);
    await this._checkoutRevision(repoDir, descriptor, failureLabel);
    return repoDir;
  }
  async update(cacheRoot, plugin, options) {
    const descriptor = plugin.sourceDescriptor;
    const repoDir = this.getInstallUri(cacheRoot, descriptor);
    const repoExists = await this._fileService.exists(repoDir);
    if (!repoExists) {
      this._logService.warn(`[${this.kind}] Cannot update plugin '${options?.pluginName ?? plugin.name}': source repository not cloned`);
      return false;
    }
    const updateLabel = options?.pluginName ?? plugin.name;
    const failureLabel = options?.failureLabel ?? updateLabel;
    try {
      const doUpdate = /* @__PURE__ */ __name(async () => {
        await this._commandService.executeCommand("git.openRepository", repoDir.fsPath);
        const git = descriptor;
        let changed;
        if (git.sha) {
          const headBefore = await this._commandService.executeCommand("_git.revParse", repoDir.fsPath, "HEAD").catch(() => void 0);
          await this._commandService.executeCommand("git.fetch", repoDir.fsPath);
          await this._checkoutRevision(repoDir, descriptor, failureLabel);
          const headAfter = await this._commandService.executeCommand("_git.revParse", repoDir.fsPath, "HEAD").catch(() => void 0);
          changed = headBefore !== headAfter;
        } else {
          changed = !!await this._commandService.executeCommand("_git.pull", repoDir.fsPath);
          await this._checkoutRevision(repoDir, descriptor, failureLabel);
        }
        return changed;
      }, "doUpdate");
      if (options?.silent) {
        return await doUpdate();
      }
      return await this._progressService.withProgress({
        location: 15,
        title: localize("updatingPluginSource", "Updating plugin '{0}'...", updateLabel),
        cancellable: false
      }, doUpdate);
    } catch (err) {
      this._logService.error(`[${this.kind}] Failed to update plugin source '${updateLabel}':`, err);
      if (!options?.silent) {
        this._notificationService.notify({
          severity: Severity.Error,
          message: localize("pullPluginSourceFailed", "Failed to update plugin '{0}': {1}", failureLabel, err?.message ?? String(err)),
          actions: { primary: [showGitOutputAction(this._commandService)] }
        });
      }
      throw err;
    }
  }
  // -- internal helpers ---
  async _cloneRepository(repoDir, cloneUrl, progressTitle, failureLabel, ref) {
    try {
      await this._progressService.withProgress({
        location: 15,
        title: progressTitle,
        cancellable: false
      }, async () => {
        await this._fileService.createFolder(dirname(repoDir));
        await this._commandService.executeCommand("_git.cloneRepository", cloneUrl, repoDir.fsPath, ref);
      });
    } catch (err) {
      this._logService.error(`[${this.kind}] Failed to clone ${cloneUrl}:`, err);
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("cloneFailed", "Failed to install plugin '{0}': {1}", failureLabel, err?.message ?? String(err)),
        actions: { primary: [showGitOutputAction(this._commandService)] }
      });
      throw err;
    }
  }
  async _checkoutRevision(repoDir, descriptor, failureLabel) {
    const git = descriptor;
    if (!git.sha && !git.ref) {
      return;
    }
    try {
      if (git.sha) {
        await this._commandService.executeCommand("_git.checkout", repoDir.fsPath, git.sha, true);
        return;
      }
      await this._commandService.executeCommand("_git.checkout", repoDir.fsPath, git.ref);
    } catch (err) {
      this._logService.error(`[${this.kind}] Failed to checkout revision for '${failureLabel}':`, err);
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("checkoutPluginSourceFailed", "Failed to checkout plugin '{0}' to requested revision: {1}", failureLabel, err?.message ?? String(err)),
        actions: { primary: [showGitOutputAction(this._commandService)] }
      });
      throw err;
    }
  }
};
AbstractGitPluginSource = __decorate([
  __param(0, ICommandService),
  __param(1, IFileService),
  __param(2, ILogService),
  __param(3, INotificationService),
  __param(4, IProgressService)
], AbstractGitPluginSource);
class RelativePathPluginSource {
  static {
    __name(this, "RelativePathPluginSource");
  }
  constructor() {
    this.kind = "relativePath";
  }
  getInstallUri(_cacheRoot, _descriptor) {
    throw new Error("Use getPluginInstallUri() for relative-path sources");
  }
  async ensure(_cacheRoot, _plugin, _options) {
    throw new Error("Use ensureRepository() for relative-path sources");
  }
  async update(_cacheRoot, _plugin, _options) {
    throw new Error("Use pullRepository() for relative-path sources");
  }
  getCleanupTarget(_cacheRoot, _descriptor) {
    return void 0;
  }
  getLabel(descriptor) {
    return descriptor.path || ".";
  }
}
class GitHubPluginSource extends AbstractGitPluginSource {
  static {
    __name(this, "GitHubPluginSource");
  }
  constructor() {
    super(...arguments);
    this.kind = "github";
  }
  getInstallUri(cacheRoot, descriptor) {
    const gh = descriptor;
    const [owner, repo] = gh.repo.split("/");
    return joinPath(cacheRoot, "github.com", owner, repo, ...gitRevisionCacheSuffix(gh.ref, gh.sha));
  }
  getLabel(descriptor) {
    return descriptor.repo;
  }
  _cloneUrl(descriptor) {
    return `https://github.com/${descriptor.repo}.git`;
  }
  _displayLabel(descriptor) {
    return descriptor.repo;
  }
}
class GitUrlPluginSource extends AbstractGitPluginSource {
  static {
    __name(this, "GitUrlPluginSource");
  }
  constructor() {
    super(...arguments);
    this.kind = "url";
  }
  getInstallUri(cacheRoot, descriptor) {
    const git = descriptor;
    const segments = this._gitUrlCacheSegments(git.url, git.ref, git.sha);
    return joinPath(cacheRoot, ...segments);
  }
  getLabel(descriptor) {
    return descriptor.url;
  }
  _cloneUrl(descriptor) {
    return descriptor.url;
  }
  _displayLabel(descriptor) {
    return descriptor.url;
  }
  _gitUrlCacheSegments(url, ref, sha) {
    try {
      const parsed = URI.parse(url);
      const authority = (parsed.authority || "unknown").replace(/[\\/:*?"<>|]/g, "_").toLowerCase();
      const pathPart = parsed.path.replace(/^\/+/, "").replace(/\.git$/i, "").replace(/\/+$/g, "");
      const segments = pathPart.split("/").map((s) => s.replace(/[\\/:*?"<>|]/g, "_"));
      return [authority, ...segments, ...gitRevisionCacheSuffix(ref, sha)];
    } catch {
      return ["git", url.replace(/[\\/:*?"<>|]/g, "_"), ...gitRevisionCacheSuffix(ref, sha)];
    }
  }
}
let AbstractPackagePluginSource = class AbstractPackagePluginSource2 {
  static {
    __name(this, "AbstractPackagePluginSource");
  }
  constructor(_dialogService, _fileService, _logService, _notificationService, _progressService, _terminalService) {
    this._dialogService = _dialogService;
    this._fileService = _fileService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._progressService = _progressService;
    this._terminalService = _terminalService;
  }
  getCleanupTarget(cacheRoot, descriptor) {
    return this._getCacheDir(cacheRoot, descriptor);
  }
  async ensure(cacheRoot, plugin, _options) {
    const cacheDir = this._getCacheDir(cacheRoot, plugin.sourceDescriptor);
    await this._fileService.createFolder(cacheDir);
    return cacheDir;
  }
  async update(cacheRoot, plugin, _options) {
    const installDir = this._getCacheDir(cacheRoot, plugin.sourceDescriptor);
    const pluginDir = this.getInstallUri(cacheRoot, plugin.sourceDescriptor);
    await this.runInstall(installDir, pluginDir, plugin, { silent: _options?.silent });
    return true;
  }
  async runInstall(installDir, pluginDir, plugin, options) {
    const args = this._buildInstallArgs(installDir, plugin);
    const command = formatShellCommand(args);
    const confirmed = await this._confirmTerminalCommand(plugin.name, command, options?.silent);
    if (!confirmed) {
      return void 0;
    }
    const progressTitle = localize("installingPackagePlugin", "Installing {0} plugin '{1}'...", this._managerName, plugin.name);
    const { success, terminal } = await this._runTerminalCommand(command, progressTitle);
    if (!success) {
      return void 0;
    }
    const exists = await this._fileService.exists(pluginDir);
    if (!exists) {
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("packagePluginNotFound", "{0} package '{1}' was not found after installation.", this._managerName, this.getLabel(plugin.sourceDescriptor))
      });
      return void 0;
    }
    terminal?.dispose();
    return { pluginDir };
  }
  // -- terminal helpers (moved from PluginInstallService) ---
  async _confirmTerminalCommand(pluginName, command, silent) {
    if (silent) {
      return new Promise((resolve) => {
        const n = this._notificationService.notify({
          severity: Severity.Info,
          message: localize("confirmPluginInstallNotification", "Plugin '{0}' wants to run: {1}", pluginName, command),
          actions: {
            primary: [
              new Action("installPlugin", localize("install", "Install"), void 0, true, async () => resolve(true))
            ]
          }
        });
        Event.once(n.onDidClose)(() => resolve(false));
      });
    }
    const { confirmed } = await this._dialogService.confirm({
      type: "question",
      message: localize("confirmPluginInstall", "Install Plugin '{0}'?", pluginName),
      detail: localize("confirmPluginInstallDetail", "This will run the following command in a terminal:\n\n{0}", command),
      primaryButton: localize({ key: "confirmInstall", comment: ["&& denotes a mnemonic"] }, "&&Install")
    });
    return confirmed;
  }
  async _runTerminalCommand(command, progressTitle) {
    let terminal;
    try {
      await this._progressService.withProgress({
        location: 15,
        title: progressTitle,
        cancellable: false
      }, async () => {
        terminal = await this._terminalService.createTerminal({
          config: {
            name: localize("pluginInstallTerminal", "Plugin Install"),
            forceShellIntegration: true,
            isTransient: true,
            isFeatureTerminal: true
          }
        });
        await terminal.processReady;
        this._terminalService.setActiveInstance(terminal);
        const commandResultPromise = this._waitForTerminalCommandCompletion(terminal);
        await terminal.runCommand(command, true);
        const exitCode = await commandResultPromise;
        if (exitCode !== 0) {
          throw new Error(localize("terminalCommandExitCode", "Command exited with code {0}", exitCode));
        }
      });
      return { success: true, terminal };
    } catch (err) {
      this._logService.error(`[${this.kind}] Terminal command failed:`, err);
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("terminalCommandFailed", "Plugin installation command failed: {0}", err?.message ?? String(err))
      });
      return { success: false, terminal };
    }
  }
  _waitForTerminalCommandCompletion(terminal) {
    return new Promise((resolve) => {
      const disposables = new DisposableStore();
      let isResolved = false;
      const resolveAndDispose = /* @__PURE__ */ __name((exitCode) => {
        if (isResolved) {
          return;
        }
        isResolved = true;
        disposables.dispose();
        resolve(exitCode);
      }, "resolveAndDispose");
      const attachCommandFinishedListener = /* @__PURE__ */ __name(() => {
        const commandDetection = terminal.capabilities.get(
          2
          /* TerminalCapability.CommandDetection */
        );
        if (!commandDetection) {
          return;
        }
        disposables.add(commandDetection.onCommandFinished((command) => {
          resolveAndDispose(command.exitCode ?? 0);
        }));
      }, "attachCommandFinishedListener");
      attachCommandFinishedListener();
      disposables.add(terminal.capabilities.onDidAddCommandDetectionCapability(() => attachCommandFinishedListener()));
      const timeoutHandle = timeout(12e4);
      disposables.add(toDisposable(() => timeoutHandle.cancel()));
      void timeoutHandle.then(() => {
        if (isResolved) {
          return;
        }
        this._logService.warn(`[${this.kind}] Terminal command completion timed out`);
        resolveAndDispose(void 0);
      });
    });
  }
};
AbstractPackagePluginSource = __decorate([
  __param(0, IDialogService),
  __param(1, IFileService),
  __param(2, ILogService),
  __param(3, INotificationService),
  __param(4, IProgressService),
  __param(5, ITerminalService)
], AbstractPackagePluginSource);
class NpmPluginSource extends AbstractPackagePluginSource {
  static {
    __name(this, "NpmPluginSource");
  }
  constructor() {
    super(...arguments);
    this.kind = "npm";
    this._managerName = "npm";
  }
  getInstallUri(cacheRoot, descriptor) {
    const npm = descriptor;
    return joinPath(cacheRoot, "npm", sanitizeCacheSegment(npm.package), "node_modules", npm.package);
  }
  getLabel(descriptor) {
    const npm = descriptor;
    return npm.version ? `${npm.package}@${npm.version}` : npm.package;
  }
  _getCacheDir(cacheRoot, descriptor) {
    const npm = descriptor;
    return joinPath(cacheRoot, "npm", sanitizeCacheSegment(npm.package));
  }
  _buildInstallArgs(installDir, plugin) {
    const npm = plugin.sourceDescriptor;
    const packageSpec = npm.version ? `${npm.package}@${npm.version}` : npm.package;
    const args = ["npm", "install", "--prefix", installDir.fsPath, packageSpec];
    if (npm.registry) {
      args.push("--registry", npm.registry);
    }
    return args;
  }
}
class PipPluginSource extends AbstractPackagePluginSource {
  static {
    __name(this, "PipPluginSource");
  }
  constructor() {
    super(...arguments);
    this.kind = "pip";
    this._managerName = "pip";
  }
  getInstallUri(cacheRoot, descriptor) {
    const pip = descriptor;
    return joinPath(cacheRoot, "pip", sanitizeCacheSegment(pip.package));
  }
  getLabel(descriptor) {
    const pip = descriptor;
    return pip.version ? `${pip.package}==${pip.version}` : pip.package;
  }
  _getCacheDir(cacheRoot, descriptor) {
    const pip = descriptor;
    return joinPath(cacheRoot, "pip", sanitizeCacheSegment(pip.package));
  }
  _buildInstallArgs(installDir, plugin) {
    const pip = plugin.sourceDescriptor;
    const packageSpec = pip.version ? `${pip.package}==${pip.version}` : pip.package;
    const args = ["pip", "install", "--target", installDir.fsPath, packageSpec];
    if (pip.registry) {
      args.push("--index-url", pip.registry);
    }
    return args;
  }
}
export {
  AbstractPackagePluginSource,
  GitHubPluginSource,
  GitUrlPluginSource,
  NpmPluginSource,
  PipPluginSource,
  RelativePathPluginSource
};
//# sourceMappingURL=pluginSources.js.map
