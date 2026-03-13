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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { IAICustomizationWorkspaceService, applyStorageSourceFilter } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { IPromptsService, PromptsStorage } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { AICustomizationManagementSection } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.js";
import { IMcpService } from "../../../../workbench/contrib/mcp/common/mcpTypes.js";
const PROMPT_SECTIONS = [
  { section: AICustomizationManagementSection.Agents, type: PromptsType.agent },
  { section: AICustomizationManagementSection.Skills, type: PromptsType.skill },
  { section: AICustomizationManagementSection.Instructions, type: PromptsType.instructions },
  { section: AICustomizationManagementSection.Prompts, type: PromptsType.prompt },
  { section: AICustomizationManagementSection.Hooks, type: PromptsType.hook }
];
let CustomizationsDebugLogContribution = class CustomizationsDebugLogContribution2 extends Disposable {
  static {
    __name(this, "CustomizationsDebugLogContribution");
  }
  static {
    this.ID = "sessions.customizationsDebugLog";
  }
  constructor(loggerService, _promptsService, _workspaceService, _workspaceContextService, _mcpService) {
    super();
    this._promptsService = _promptsService;
    this._workspaceService = _workspaceService;
    this._workspaceContextService = _workspaceContextService;
    this._mcpService = _mcpService;
    this._snapshotDirty = false;
    this._logger = this._register(loggerService.createLogger("customizationsDebug", { name: "Customizations Debug" }));
    this._register(this._promptsService.onDidChangeCustomAgents(() => this._logSnapshot()));
    this._register(this._promptsService.onDidChangeSlashCommands(() => this._logSnapshot()));
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._logSnapshot()));
    this._register(autorun((reader) => {
      this._workspaceService.activeProjectRoot.read(reader);
      this._logSnapshot();
    }));
    this._register(autorun((reader) => {
      this._mcpService.servers.read(reader);
      this._logSnapshot();
    }));
  }
  _logSnapshot() {
    if (this._pendingSnapshot) {
      this._snapshotDirty = true;
      return;
    }
    this._pendingSnapshot = this._doLogSnapshot().finally(() => {
      this._pendingSnapshot = void 0;
      if (this._snapshotDirty) {
        this._snapshotDirty = false;
        this._logSnapshot();
      }
    });
  }
  async _doLogSnapshot() {
    const root = this._workspaceService.getActiveProjectRoot()?.fsPath ?? "(none)";
    this._logger.info("");
    this._logger.info("=== Customizations Snapshot ===");
    this._logger.info(`  Root: ${root}`);
    this._logger.info(`  Sections: ${this._workspaceService.managementSections.join(", ")}`);
    this._logger.info("");
    this._logger.info(`  ${"Section".padEnd(16)} ${"Local".padStart(6)} ${"User".padStart(6)} ${"Ext".padStart(6)} ${"Total".padStart(7)}`);
    this._logger.info(`  ${"--------".padEnd(16)} ${"-----".padStart(6)} ${"----".padStart(6)} ${"---".padStart(6)} ${"-----".padStart(7)}`);
    for (const { section, type } of PROMPT_SECTIONS) {
      const filter = this._workspaceService.getStorageSourceFilter(type);
      await this._logSectionRow(section, type, filter);
    }
    this._logger.info("");
    for (const { section, type } of PROMPT_SECTIONS) {
      const filter = this._workspaceService.getStorageSourceFilter(type);
      await this._logSectionDetails(section, type, filter);
    }
    this._logMcpServers();
  }
  _logMcpServers() {
    const servers = this._mcpService.servers.get();
    this._logger.info(`  -- MCP Servers (${servers.length}) --`);
    if (servers.length === 0) {
      this._logger.info("     (none registered)");
    }
    for (const server of servers) {
      const state = server.connectionState.get();
      const stateStr = state?.state ?? "unknown";
      this._logger.info(`     ${server.definition.label} [${stateStr}] id=${server.definition.id}`);
    }
    this._logger.info("");
  }
  async _logSectionRow(section, type, filter) {
    try {
      const [localFiles, userFiles, extensionFiles] = await Promise.all([
        this._promptsService.listPromptFilesForStorage(type, PromptsStorage.local, CancellationToken.None),
        this._promptsService.listPromptFilesForStorage(type, PromptsStorage.user, CancellationToken.None),
        this._promptsService.listPromptFilesForStorage(type, PromptsStorage.extension, CancellationToken.None)
      ]);
      const all = [...localFiles, ...userFiles, ...extensionFiles];
      const filtered = applyStorageSourceFilter(all, filter);
      const local = filtered.filter((f) => f.storage === PromptsStorage.local).length;
      const user = filtered.filter((f) => f.storage === PromptsStorage.user).length;
      const ext = filtered.filter((f) => f.storage === PromptsStorage.extension).length;
      this._logger.info(`  ${section.padEnd(16)} ${String(local).padStart(6)} ${String(user).padStart(6)} ${String(ext).padStart(6)} ${String(filtered.length).padStart(7)}`);
    } catch {
      this._logger.info(`  ${section.padEnd(16)}  (error)`);
    }
  }
  async _logSectionDetails(section, type, filter) {
    try {
      const sourceFolders = await this._promptsService.getSourceFolders(type);
      if (sourceFolders.length > 0) {
        this._logger.info(`  -- ${section} --`);
        this._logger.info(`     Search paths:`);
        for (const sf of sourceFolders) {
          this._logger.info(`       [${sf.storage}] ${sf.uri.fsPath}`);
        }
      }
      const [localFiles, userFiles, extensionFiles] = await Promise.all([
        this._promptsService.listPromptFilesForStorage(type, PromptsStorage.local, CancellationToken.None),
        this._promptsService.listPromptFilesForStorage(type, PromptsStorage.user, CancellationToken.None),
        this._promptsService.listPromptFilesForStorage(type, PromptsStorage.extension, CancellationToken.None)
      ]);
      const all = [...localFiles, ...userFiles, ...extensionFiles];
      const filtered = applyStorageSourceFilter(all, filter);
      if (filtered.length > 0) {
        if (sourceFolders.length === 0) {
          this._logger.info(`  -- ${section} --`);
        }
        this._logger.info(`     Filter: sources=[${filter.sources.join(", ")}]${filter.includedUserFileRoots ? `, roots=[${filter.includedUserFileRoots.map((r) => r.fsPath).join(", ")}]` : ""}`);
        this._logger.info(`     Found ${filtered.length} item(s):`);
        for (const f of filtered) {
          this._logger.info(`       [${f.storage}] ${f.uri.fsPath}`);
        }
      }
      if (sourceFolders.length > 0 || filtered.length > 0) {
        this._logger.info("");
      }
    } catch {
    }
  }
};
CustomizationsDebugLogContribution = __decorate([
  __param(0, ILoggerService),
  __param(1, IPromptsService),
  __param(2, IAICustomizationWorkspaceService),
  __param(3, IWorkspaceContextService),
  __param(4, IMcpService)
], CustomizationsDebugLogContribution);
registerWorkbenchContribution2(
  CustomizationsDebugLogContribution.ID,
  CustomizationsDebugLogContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=customizationsDebugLog.contribution.js.map
