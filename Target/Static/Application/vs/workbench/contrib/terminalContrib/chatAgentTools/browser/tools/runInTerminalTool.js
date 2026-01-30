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
var RunInTerminalTool_1;
import { timeout } from "../../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { Event } from "../../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../../base/common/map.js";
import { basename, posix, win32 } from "../../../../../../base/common/path.js";
import { OS } from "../../../../../../base/common/platform.js";
import { count } from "../../../../../../base/common/strings.js";
import { generateUuid } from "../../../../../../base/common/uuid.js";
import { localize } from "../../../../../../nls.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { IRemoteAgentService } from "../../../../../services/remote/common/remoteAgentService.js";
import { IChatService } from "../../../../chat/common/chatService/chatService.js";
import { ILanguageModelToolsService, ToolDataSource, ToolInvocationPresentation } from "../../../../chat/common/tools/languageModelToolsService.js";
import { ITerminalChatService, ITerminalService } from "../../../../terminal/browser/terminal.js";
import { ITerminalProfileResolverService } from "../../../../terminal/common/terminal.js";
import { getRecommendedToolsOverRunInTerminal } from "../alternativeRecommendation.js";
import { BasicExecuteStrategy } from "../executeStrategy/basicExecuteStrategy.js";
import { NoneExecuteStrategy } from "../executeStrategy/noneExecuteStrategy.js";
import { RichExecuteStrategy } from "../executeStrategy/richExecuteStrategy.js";
import { getOutput } from "../outputHelpers.js";
import { extractCdPrefix, isFish, isPowerShell, isWindowsPowerShell, isZsh } from "../runInTerminalHelpers.js";
import { NodeCommandLinePresenter } from "./commandLinePresenter/nodeCommandLinePresenter.js";
import { PythonCommandLinePresenter } from "./commandLinePresenter/pythonCommandLinePresenter.js";
import { RubyCommandLinePresenter } from "./commandLinePresenter/rubyCommandLinePresenter.js";
import { RunInTerminalToolTelemetry } from "../runInTerminalToolTelemetry.js";
import { ToolTerminalCreator } from "../toolTerminalCreator.js";
import { TreeSitterCommandParser } from "../treeSitterCommandParser.js";
import { CommandLineAutoApproveAnalyzer } from "./commandLineAnalyzer/commandLineAutoApproveAnalyzer.js";
import { CommandLineFileWriteAnalyzer } from "./commandLineAnalyzer/commandLineFileWriteAnalyzer.js";
import { OutputMonitor } from "./monitoring/outputMonitor.js";
import { OutputMonitorState } from "./monitoring/types.js";
import { ITerminalSandboxService } from "../../common/terminalSandboxService.js";
import { chatSessionResourceToId, LocalChatSessionUri } from "../../../../chat/common/model/chatUri.js";
import { URI } from "../../../../../../base/common/uri.js";
import { CommandLineCdPrefixRewriter } from "./commandLineRewriter/commandLineCdPrefixRewriter.js";
import { CommandLinePreventHistoryRewriter } from "./commandLineRewriter/commandLinePreventHistoryRewriter.js";
import { CommandLinePwshChainOperatorRewriter } from "./commandLineRewriter/commandLinePwshChainOperatorRewriter.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IHistoryService } from "../../../../../services/history/common/history.js";
import { TerminalCommandArtifactCollector } from "./terminalCommandArtifactCollector.js";
import { isNumber, isString } from "../../../../../../base/common/types.js";
import { ChatConfiguration } from "../../../../chat/common/constants.js";
import { IChatWidgetService } from "../../../../chat/browser/chat.js";
const TOOL_REFERENCE_NAME = "runInTerminal";
const LEGACY_TOOL_REFERENCE_FULL_NAMES = ["runCommands/runInTerminal"];
function createPowerShellModelDescription(shell) {
  const isWinPwsh = isWindowsPowerShell(shell);
  return [
    `This tool allows you to execute ${isWinPwsh ? "Windows PowerShell 5.1" : "PowerShell"} commands in a persistent terminal session, preserving environment variables, working directory, and other context across multiple commands.`,
    "",
    "Command Execution:",
    // IMPORTANT: PowerShell 5 does not support `&&` so always re-write them to `;`. Note that
    // the behavior of `&&` differs a little from `;` but in general it's fine
    isWinPwsh ? "- Use semicolons ; to chain commands on one line, NEVER use && even when asked explicitly" : "- Prefer ; when chaining commands on one line",
    "- Prefer pipelines | for object-based data flow",
    '- Never create a sub-shell (eg. powershell -c "command") unless explicitly asked',
    "",
    "Directory Management:",
    "- Must use absolute paths to avoid navigation issues",
    "- Use $PWD or Get-Location for current directory",
    "- Use Push-Location/Pop-Location for directory stack",
    "",
    "Program Execution:",
    "- Supports .NET, Python, Node.js, and other executables",
    "- Install modules via Install-Module, Install-Package",
    "- Use Get-Command to verify cmdlet/function availability",
    "",
    "Background Processes:",
    "- For long-running tasks (e.g., servers), set isBackground=true",
    "- Returns a terminal ID for checking status and runtime later",
    "- Use Start-Job for background PowerShell jobs",
    "",
    "Output Management:",
    "- Output is automatically truncated if longer than 60KB to prevent context overflow",
    "- Use Select-Object, Where-Object, Format-Table to filter output",
    "- Use -First/-Last parameters to limit results",
    "- For pager commands, add | Out-String or | Format-List",
    "",
    "Best Practices:",
    "- Use proper cmdlet names instead of aliases in scripts",
    '- Quote paths with spaces: "C:\\Path With Spaces"',
    "- Prefer PowerShell cmdlets over external commands when available",
    "- Prefer idiomatic PowerShell like Get-ChildItem instead of dir or ls for file listings",
    "- Use Test-Path to check file/directory existence",
    "- Be specific with Select-Object properties to avoid excessive output",
    "- Avoid printing credentials unless absolutely required"
  ].join("\n");
}
__name(createPowerShellModelDescription, "createPowerShellModelDescription");
const genericDescription = `
Command Execution:
- Use && to chain simple commands on one line
- Prefer pipelines | over temporary files for data flow
- Never create a sub-shell (eg. bash -c "command") unless explicitly asked

Directory Management:
- Must use absolute paths to avoid navigation issues
- Use $PWD for current directory references
- Consider using pushd/popd for directory stack management
- Supports directory shortcuts like ~ and -

Program Execution:
- Supports Python, Node.js, and other executables
- Install packages via package managers (brew, apt, etc.)
- Use which or command -v to verify command availability

Background Processes:
- For long-running tasks (e.g., servers), set isBackground=true
- Returns a terminal ID for checking status and runtime later

Output Management:
- Output is automatically truncated if longer than 60KB to prevent context overflow
- Use head, tail, grep, awk to filter and limit output size
- For pager commands, disable paging: git --no-pager or add | cat
- Use wc -l to count lines before displaying large outputs

Best Practices:
- Quote variables: "$var" instead of $var to handle spaces
- Use find with -exec or xargs for file operations
- Be specific with commands to avoid excessive output
- Avoid printing credentials unless absolutely required`;
function createBashModelDescription() {
  return [
    "This tool allows you to execute shell commands in a persistent bash terminal session, preserving environment variables, working directory, and other context across multiple commands.",
    genericDescription,
    "- Use [[ ]] for conditional tests instead of [ ]",
    "- Prefer $() over backticks for command substitution",
    "- Use set -e at start of complex commands to exit on errors"
  ].join("\n");
}
__name(createBashModelDescription, "createBashModelDescription");
function createZshModelDescription() {
  return [
    "This tool allows you to execute shell commands in a persistent zsh terminal session, preserving environment variables, working directory, and other context across multiple commands.",
    genericDescription,
    "- Use type to check command type (builtin, function, alias)",
    "- Use jobs, fg, bg for job control",
    "- Use [[ ]] for conditional tests instead of [ ]",
    "- Prefer $() over backticks for command substitution",
    "- Use setopt errexit for strict error handling",
    "- Take advantage of zsh globbing features (**, extended globs)"
  ].join("\n");
}
__name(createZshModelDescription, "createZshModelDescription");
function createFishModelDescription() {
  return [
    "This tool allows you to execute shell commands in a persistent fish terminal session, preserving environment variables, working directory, and other context across multiple commands.",
    genericDescription,
    "- Use type to check command type (builtin, function, alias)",
    "- Use jobs, fg, bg for job control",
    "- Use test expressions for conditionals (no [[ ]] syntax)",
    "- Prefer command substitution with () syntax",
    "- Variables are arrays by default, use $var[1] for first element",
    "- Use set -e for strict error handling",
    "- Take advantage of fish's autosuggestions and completions"
  ].join("\n");
}
__name(createFishModelDescription, "createFishModelDescription");
async function createRunInTerminalToolData(accessor) {
  const instantiationService = accessor.get(IInstantiationService);
  const profileFetcher = instantiationService.createInstance(TerminalProfileFetcher);
  const shell = await profileFetcher.getCopilotShell();
  const os = await profileFetcher.osBackend;
  let modelDescription;
  if (shell && os && isPowerShell(shell, os)) {
    modelDescription = createPowerShellModelDescription(shell);
  } else if (shell && os && isZsh(shell, os)) {
    modelDescription = createZshModelDescription();
  } else if (shell && os && isFish(shell, os)) {
    modelDescription = createFishModelDescription();
  } else {
    modelDescription = createBashModelDescription();
  }
  return {
    id: "run_in_terminal",
    toolReferenceName: TOOL_REFERENCE_NAME,
    legacyToolReferenceFullNames: LEGACY_TOOL_REFERENCE_FULL_NAMES,
    displayName: localize("runInTerminalTool.displayName", "Run in Terminal"),
    modelDescription,
    userDescription: localize("runInTerminalTool.userDescription", "Run commands in the terminal"),
    source: ToolDataSource.Internal,
    icon: Codicon.terminal,
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The command to run in the terminal."
        },
        explanation: {
          type: "string",
          description: "A one-sentence description of what the command does. This will be shown to the user before the command is run."
        },
        isBackground: {
          type: "boolean",
          description: "Whether the command starts a background process. If true, the command will run in the background and you will not see the output. If false, the tool call will block on the command finishing, and then you will get the output. Examples of background processes: building in watch mode, starting a server. You can check the output of a background process later on by using get_terminal_output."
        },
        timeout: {
          type: "number",
          description: "An optional timeout in milliseconds. When provided, the tool will stop tracking the command after this duration and return the output collected so far. Be conservative with the timeout duration, give enough time that the command would complete on a low-end machine. Use 0 for no timeout. If it's not clear how long the command will take then use 0 to avoid prematurely terminating it, never guess too low."
        }
      },
      required: [
        "command",
        "explanation",
        "isBackground",
        "timeout"
      ]
    }
  };
}
__name(createRunInTerminalToolData, "createRunInTerminalToolData");
var TerminalToolStorageKeysInternal;
(function(TerminalToolStorageKeysInternal2) {
  TerminalToolStorageKeysInternal2["TerminalSession"] = "chat.terminalSessions";
})(TerminalToolStorageKeysInternal || (TerminalToolStorageKeysInternal = {}));
const telemetryIgnoredSequences = [
  "\x1B[I",
  // Focus in
  "\x1B[O"
  // Focus out
];
const altBufferMessage = localize("runInTerminalTool.altBufferMessage", "The command opened the alternate buffer.");
let RunInTerminalTool = class RunInTerminalTool2 extends Disposable {
  static {
    __name(this, "RunInTerminalTool");
  }
  static {
    RunInTerminalTool_1 = this;
  }
  static {
    this._backgroundExecutions = /* @__PURE__ */ new Map();
  }
  static getBackgroundOutput(id) {
    const backgroundExecution = RunInTerminalTool_1._backgroundExecutions.get(id);
    if (!backgroundExecution) {
      throw new Error("Invalid terminal ID");
    }
    return backgroundExecution.getOutput();
  }
  constructor(_chatService, _configurationService, _historyService, _instantiationService, _labelService, _languageModelToolsService, _remoteAgentService, _storageService, _terminalChatService, _logService, _terminalService, _workspaceContextService, _chatWidgetService, _sandboxService) {
    super();
    this._chatService = _chatService;
    this._configurationService = _configurationService;
    this._historyService = _historyService;
    this._instantiationService = _instantiationService;
    this._labelService = _labelService;
    this._languageModelToolsService = _languageModelToolsService;
    this._remoteAgentService = _remoteAgentService;
    this._storageService = _storageService;
    this._terminalChatService = _terminalChatService;
    this._logService = _logService;
    this._terminalService = _terminalService;
    this._workspaceContextService = _workspaceContextService;
    this._chatWidgetService = _chatWidgetService;
    this._sandboxService = _sandboxService;
    this._sessionTerminalAssociations = new ResourceMap();
    this._osBackend = this._remoteAgentService.getEnvironment().then((remoteEnv) => remoteEnv?.os ?? OS);
    this._terminalToolCreator = this._instantiationService.createInstance(ToolTerminalCreator);
    this._treeSitterCommandParser = this._register(this._instantiationService.createInstance(TreeSitterCommandParser));
    this._telemetry = this._instantiationService.createInstance(RunInTerminalToolTelemetry);
    this._commandArtifactCollector = this._instantiationService.createInstance(TerminalCommandArtifactCollector);
    this._profileFetcher = this._instantiationService.createInstance(TerminalProfileFetcher);
    this._commandLineRewriters = [
      this._register(this._instantiationService.createInstance(CommandLineCdPrefixRewriter)),
      this._register(this._instantiationService.createInstance(CommandLinePwshChainOperatorRewriter, this._treeSitterCommandParser)),
      this._register(this._instantiationService.createInstance(CommandLinePreventHistoryRewriter))
    ];
    this._commandLineAnalyzers = [
      this._register(this._instantiationService.createInstance(CommandLineFileWriteAnalyzer, this._treeSitterCommandParser, (message, args) => this._logService.info(`RunInTerminalTool#CommandLineFileWriteAnalyzer: ${message}`, args))),
      this._register(this._instantiationService.createInstance(CommandLineAutoApproveAnalyzer, this._treeSitterCommandParser, this._telemetry, (message, args) => this._logService.info(`RunInTerminalTool#CommandLineAutoApproveAnalyzer: ${message}`, args)))
    ];
    this._commandLinePresenters = [
      new NodeCommandLinePresenter(),
      new PythonCommandLinePresenter(),
      new RubyCommandLinePresenter()
    ];
    this._register(Event.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration(
        "chat.tools.terminal.enableAutoApprove"
        /* TerminalChatAgentToolsSettingId.EnableAutoApprove */
      )) {
        if (this._configurationService.getValue(
          "chat.tools.terminal.enableAutoApprove"
          /* TerminalChatAgentToolsSettingId.EnableAutoApprove */
        ) !== true) {
          this._storageService.remove(
            "chat.tools.terminal.autoApprove.warningAccepted",
            -1
            /* StorageScope.APPLICATION */
          );
        }
      }
      if (e?.affectsConfiguration(
        "chat.tools.terminal.sandbox.enabled"
        /* TerminalChatAgentToolsSettingId.TerminalSandboxEnabled */
      ) || e?.affectsConfiguration(
        "chat.tools.terminal.sandbox.network"
        /* TerminalChatAgentToolsSettingId.TerminalSandboxNetwork */
      ) || e?.affectsConfiguration(
        "chat.tools.terminal.sandbox.linuxFileSystem"
        /* TerminalChatAgentToolsSettingId.TerminalSandboxLinuxFileSystem */
      ) || e?.affectsConfiguration(
        "chat.tools.terminal.sandbox.macFileSystem"
        /* TerminalChatAgentToolsSettingId.TerminalSandboxMacFileSystem */
      )) {
        this._sandboxService.setNeedsForceUpdateConfigFile();
      }
    }));
    this._restoreTerminalAssociations();
    this._register(this._terminalService.onDidDisposeInstance((e) => {
      for (const [sessionResource, toolTerminal] of this._sessionTerminalAssociations.entries()) {
        if (e === toolTerminal.instance) {
          this._sessionTerminalAssociations.delete(sessionResource);
        }
      }
    }));
    this._register(this._chatService.onDidDisposeSession((e) => {
      for (const resource of e.sessionResource) {
        this._cleanupSessionTerminals(resource);
      }
    }));
  }
  async prepareToolInvocation(context, token) {
    const args = context.parameters;
    const chatSessionResource = context.chatSessionResource ?? (context.chatSessionId ? LocalChatSessionUri.forSession(context.chatSessionId) : void 0);
    const instance = chatSessionResource ? this._sessionTerminalAssociations.get(chatSessionResource)?.instance : void 0;
    const [os, shell, cwd] = await Promise.all([
      this._osBackend,
      this._profileFetcher.getCopilotShell(),
      (async () => {
        let cwd2 = await instance?.getCwdResource();
        if (!cwd2) {
          const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
          const workspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
          cwd2 = workspaceFolder?.uri;
        }
        return cwd2;
      })()
    ]);
    const language = os === 1 ? "pwsh" : "sh";
    const terminalToolSessionId = generateUuid();
    const terminalCommandId = `tool-${generateUuid()}`;
    let rewrittenCommand = args.command;
    for (const rewriter of this._commandLineRewriters) {
      const rewriteResult = await rewriter.rewrite({
        commandLine: rewrittenCommand,
        cwd,
        shell,
        os
      });
      if (rewriteResult) {
        rewrittenCommand = rewriteResult.rewritten;
        this._logService.info(`RunInTerminalTool: Command rewritten by ${rewriter.constructor.name}: ${rewriteResult.reasoning}`);
      }
    }
    const toolSpecificData = {
      kind: "terminal",
      terminalToolSessionId,
      terminalCommandId,
      commandLine: {
        original: args.command,
        toolEdited: rewrittenCommand === args.command ? void 0 : rewrittenCommand
      },
      cwd,
      language
    };
    const alternativeRecommendation = getRecommendedToolsOverRunInTerminal(args.command, this._languageModelToolsService);
    if (alternativeRecommendation) {
      toolSpecificData.alternativeRecommendation = alternativeRecommendation;
      return {
        confirmationMessages: void 0,
        presentation: ToolInvocationPresentation.Hidden,
        toolSpecificData
      };
    }
    if (this._sandboxService.isEnabled()) {
      toolSpecificData.autoApproveInfo = new MarkdownString(localize("autoApprove.sandbox", "In sandbox mode"));
      return {
        toolSpecificData
      };
    }
    const commandLine = rewrittenCommand ?? args.command;
    const isEligibleForAutoApproval = /* @__PURE__ */ __name(() => {
      const config = this._configurationService.getValue(ChatConfiguration.EligibleForAutoApproval);
      if (config && typeof config === "object") {
        if (Object.prototype.hasOwnProperty.call(config, TOOL_REFERENCE_NAME)) {
          return config[TOOL_REFERENCE_NAME];
        }
        for (const legacyName of LEGACY_TOOL_REFERENCE_FULL_NAMES) {
          if (Object.prototype.hasOwnProperty.call(config, legacyName)) {
            return config[legacyName];
          }
        }
      }
      return true;
    }, "isEligibleForAutoApproval");
    const isAutoApproveEnabled = this._configurationService.getValue(
      "chat.tools.terminal.enableAutoApprove"
      /* TerminalChatAgentToolsSettingId.EnableAutoApprove */
    ) === true;
    const isAutoApproveWarningAccepted = this._storageService.getBoolean("chat.tools.terminal.autoApprove.warningAccepted", -1, false);
    const isAutoApproveAllowed = isEligibleForAutoApproval() && isAutoApproveEnabled && isAutoApproveWarningAccepted;
    const commandLineAnalyzerOptions = {
      commandLine,
      cwd,
      os,
      shell,
      treeSitterLanguage: isPowerShell(shell, os) ? "powershell" : "bash",
      terminalToolSessionId,
      chatSessionResource
    };
    const commandLineAnalyzerResults = await Promise.all(this._commandLineAnalyzers.map((e) => e.analyze(commandLineAnalyzerOptions)));
    const disclaimersRaw = commandLineAnalyzerResults.map((e) => e.disclaimers).filter((e) => !!e).flatMap((e) => e);
    let disclaimer;
    if (disclaimersRaw.length > 0) {
      const disclaimerTexts = disclaimersRaw.map((d) => typeof d === "string" ? d : d.value);
      const hasMarkdownDisclaimer = disclaimersRaw.some((d) => typeof d !== "string");
      const mdOptions = hasMarkdownDisclaimer ? { supportThemeIcons: true, isTrusted: { enabledCommands: [
        "workbench.action.terminal.chat.openTerminalSettingsLink"
        /* TerminalChatCommandId.OpenTerminalSettingsLink */
      ] } } : { supportThemeIcons: true };
      disclaimer = new MarkdownString(`$(${Codicon.info.id}) ` + disclaimerTexts.join(" "), mdOptions);
    }
    const analyzersIsAutoApproveAllowed = commandLineAnalyzerResults.every((e) => e.isAutoApproveAllowed);
    const customActions = isEligibleForAutoApproval() && analyzersIsAutoApproveAllowed ? commandLineAnalyzerResults.map((e) => e.customActions ?? []).flat() : void 0;
    let shellType = basename(shell, ".exe");
    if (shellType === "powershell") {
      shellType = "pwsh";
    }
    const wouldBeAutoApproved = (
      // Does at least one analyzer auto approve
      commandLineAnalyzerResults.some((e) => e.isAutoApproved) && // No analyzer denies auto approval
      commandLineAnalyzerResults.every((e) => e.isAutoApproved !== false) && // All analyzers allow auto approval
      analyzersIsAutoApproveAllowed
    );
    const isFinalAutoApproved = (
      // Is the setting enabled and the user has opted-in
      isAutoApproveAllowed && // Would be auto-approved based on rules
      wouldBeAutoApproved
    );
    if (isFinalAutoApproved || isAutoApproveEnabled && commandLineAnalyzerResults.some((e) => e.autoApproveInfo)) {
      toolSpecificData.autoApproveInfo = commandLineAnalyzerResults.find((e) => e.autoApproveInfo)?.autoApproveInfo;
    }
    const commandToDisplay = (toolSpecificData.commandLine.toolEdited ?? toolSpecificData.commandLine.original).trimStart();
    const extractedCd = extractCdPrefix(commandToDisplay, shell, os);
    let confirmationTitle;
    if (extractedCd && cwd) {
      const isAbsolutePath = os === 1 ? win32.isAbsolute(extractedCd.directory) : posix.isAbsolute(extractedCd.directory);
      const directoryUri = isAbsolutePath ? URI.from({ scheme: cwd.scheme, authority: cwd.authority, path: extractedCd.directory }) : URI.joinPath(cwd, extractedCd.directory);
      const directoryLabel = this._labelService.getUriLabel(directoryUri);
      const cdPrefix = commandToDisplay.substring(0, commandToDisplay.length - extractedCd.command.length);
      toolSpecificData.confirmation = {
        commandLine: extractedCd.command,
        cwdLabel: directoryLabel,
        cdPrefix
      };
      confirmationTitle = args.isBackground ? localize("runInTerminal.background.inDirectory", "Run `{0}` command in background within `{1}`?", shellType, directoryLabel) : localize("runInTerminal.inDirectory", "Run `{0}` command within `{1}`?", shellType, directoryLabel);
    } else {
      toolSpecificData.confirmation = {
        commandLine: commandToDisplay
      };
      confirmationTitle = args.isBackground ? localize("runInTerminal.background", "Run `{0}` command in background?", shellType) : localize("runInTerminal", "Run `{0}` command?", shellType);
    }
    const commandForPresenter = extractedCd?.command ?? commandToDisplay;
    for (const presenter of this._commandLinePresenters) {
      const presenterResult = presenter.present({ commandLine: commandForPresenter, shell, os });
      if (presenterResult) {
        toolSpecificData.presentationOverrides = {
          commandLine: presenterResult.commandLine,
          language: presenterResult.language
        };
        if (extractedCd && toolSpecificData.confirmation?.cwdLabel) {
          confirmationTitle = args.isBackground ? localize("runInTerminal.presentationOverride.background.inDirectory", "Run `{0}` command in `{1}` in background within `{2}`?", presenterResult.languageDisplayName, shellType, toolSpecificData.confirmation.cwdLabel) : localize("runInTerminal.presentationOverride.inDirectory", "Run `{0}` command in `{1}` within `{2}`?", presenterResult.languageDisplayName, shellType, toolSpecificData.confirmation.cwdLabel);
        } else {
          confirmationTitle = args.isBackground ? localize("runInTerminal.presentationOverride.background", "Run `{0}` command in `{1}` in background?", presenterResult.languageDisplayName, shellType) : localize("runInTerminal.presentationOverride", "Run `{0}` command in `{1}`?", presenterResult.languageDisplayName, shellType);
        }
        break;
      }
    }
    const confirmationMessages = isFinalAutoApproved ? void 0 : {
      title: confirmationTitle,
      message: new MarkdownString(args.explanation),
      disclaimer,
      terminalCustomActions: customActions
    };
    return {
      confirmationMessages,
      toolSpecificData
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const toolSpecificData = invocation.toolSpecificData;
    if (!toolSpecificData) {
      throw new Error("toolSpecificData must be provided for this tool");
    }
    const commandId = toolSpecificData.terminalCommandId;
    if (toolSpecificData.alternativeRecommendation) {
      return {
        content: [{
          kind: "text",
          value: toolSpecificData.alternativeRecommendation
        }]
      };
    }
    const args = invocation.parameters;
    this._logService.debug(`RunInTerminalTool: Invoking with options ${JSON.stringify(args)}`);
    let toolResultMessage;
    const chatSessionResource = invocation.context?.sessionResource ?? LocalChatSessionUri.forSession(invocation.context?.sessionId ?? "no-chat-session");
    const chatSessionId = chatSessionResourceToId(chatSessionResource);
    let command = toolSpecificData.commandLine.userEdited ?? toolSpecificData.commandLine.toolEdited ?? toolSpecificData.commandLine.original;
    const didUserEditCommand = toolSpecificData.commandLine.userEdited !== void 0 && toolSpecificData.commandLine.userEdited !== toolSpecificData.commandLine.original;
    const didToolEditCommand = !didUserEditCommand && toolSpecificData.commandLine.toolEdited !== void 0 && toolSpecificData.commandLine.toolEdited !== toolSpecificData.commandLine.original;
    if (this._sandboxService.isEnabled()) {
      await this._sandboxService.getSandboxConfigPath();
      this._logService.info(`RunInTerminalTool: Sandboxing is enabled, wrapping command with srt.`);
      command = this._sandboxService.wrapCommand(command);
    }
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    let error;
    const isNewSession = !args.isBackground && !this._sessionTerminalAssociations.has(chatSessionResource);
    const timingStart = Date.now();
    const termId = generateUuid();
    const terminalToolSessionId = toolSpecificData.terminalToolSessionId;
    const store = new DisposableStore();
    this._logService.debug(`RunInTerminalTool: Creating ${args.isBackground ? "background" : "foreground"} terminal. termId=${termId}, chatSessionId=${chatSessionId}`);
    const toolTerminal = await (args.isBackground ? this._initBackgroundTerminal(chatSessionResource, termId, terminalToolSessionId, token) : this._initForegroundTerminal(chatSessionResource, termId, terminalToolSessionId, token));
    this._handleTerminalVisibility(toolTerminal, chatSessionResource);
    const timingConnectMs = Date.now() - timingStart;
    const xterm = await toolTerminal.instance.xtermReadyPromise;
    if (!xterm) {
      throw new Error("Instance was disposed before xterm.js was ready");
    }
    const commandDetection = toolTerminal.instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    let inputUserChars = 0;
    let inputUserSigint = false;
    store.add(xterm.raw.onData((data) => {
      if (!telemetryIgnoredSequences.includes(data)) {
        inputUserChars += data.length;
      }
      inputUserSigint ||= data === "";
    }));
    let outputMonitor;
    if (args.isBackground) {
      let pollingResult;
      try {
        this._logService.debug(`RunInTerminalTool: Starting background execution \`${command}\``);
        const execution = new BackgroundTerminalExecution(toolTerminal.instance, xterm, command, chatSessionId, commandId);
        RunInTerminalTool_1._backgroundExecutions.set(termId, execution);
        outputMonitor = store.add(this._instantiationService.createInstance(OutputMonitor, execution, void 0, invocation.context, token, command));
        await Event.toPromise(outputMonitor.onDidFinishCommand);
        const pollingResult2 = outputMonitor.pollingResult;
        if (token.isCancellationRequested) {
          throw new CancellationError();
        }
        await this._commandArtifactCollector.capture(toolSpecificData, toolTerminal.instance, commandId);
        const state = toolSpecificData.terminalCommandState ?? {};
        state.timestamp = state.timestamp ?? timingStart;
        toolSpecificData.terminalCommandState = state;
        let resultText = didUserEditCommand ? `Note: The user manually edited the command to \`${command}\`, and that command is now running in terminal with ID=${termId}` : didToolEditCommand ? `Note: The tool simplified the command to \`${command}\`, and that command is now running in terminal with ID=${termId}` : `Command is running in terminal with ID=${termId}`;
        if (pollingResult2 && pollingResult2.modelOutputEvalResponse) {
          resultText += `
 The command became idle with output:
${pollingResult2.modelOutputEvalResponse}`;
        } else if (pollingResult2) {
          resultText += `
 The command is still running, with output:
${pollingResult2.output}`;
        }
        return {
          toolMetadata: {
            exitCode: void 0
            // Background processes don't have immediate exit codes
          },
          content: [{
            kind: "text",
            value: resultText
          }]
        };
      } catch (e) {
        if (termId) {
          RunInTerminalTool_1._backgroundExecutions.get(termId)?.dispose();
          RunInTerminalTool_1._backgroundExecutions.delete(termId);
        }
        error = e instanceof CancellationError ? "canceled" : "unexpectedException";
        throw e;
      } finally {
        store.dispose();
        this._logService.debug(`RunInTerminalTool: Finished polling \`${pollingResult?.output.length}\` lines of output in \`${pollingResult?.pollDurationMs}\``);
        const timingExecuteMs = Date.now() - timingStart;
        this._telemetry.logInvoke(toolTerminal.instance, {
          terminalToolSessionId: toolSpecificData.terminalToolSessionId,
          didUserEditCommand,
          didToolEditCommand,
          shellIntegrationQuality: toolTerminal.shellIntegrationQuality,
          isBackground: true,
          error,
          exitCode: void 0,
          isNewSession: true,
          timingExecuteMs,
          timingConnectMs,
          terminalExecutionIdleBeforeTimeout: pollingResult?.state === OutputMonitorState.Idle,
          outputLineCount: pollingResult?.output ? count(pollingResult.output, "\n") : 0,
          pollDurationMs: pollingResult?.pollDurationMs,
          inputUserChars,
          inputUserSigint,
          inputToolManualAcceptCount: outputMonitor?.outputMonitorTelemetryCounters.inputToolManualAcceptCount,
          inputToolManualRejectCount: outputMonitor?.outputMonitorTelemetryCounters.inputToolManualRejectCount,
          inputToolManualChars: outputMonitor?.outputMonitorTelemetryCounters.inputToolManualChars,
          inputToolAutoAcceptCount: outputMonitor?.outputMonitorTelemetryCounters.inputToolAutoAcceptCount,
          inputToolAutoChars: outputMonitor?.outputMonitorTelemetryCounters.inputToolAutoChars,
          inputToolManualShownCount: outputMonitor?.outputMonitorTelemetryCounters.inputToolManualShownCount,
          inputToolFreeFormInputCount: outputMonitor?.outputMonitorTelemetryCounters.inputToolFreeFormInputCount,
          inputToolFreeFormInputShownCount: outputMonitor?.outputMonitorTelemetryCounters.inputToolFreeFormInputShownCount
        });
      }
    } else {
      let terminalResult = "";
      let outputLineCount = -1;
      let exitCode;
      let altBufferResult;
      let didTimeout = false;
      let timeoutPromise;
      const executeCancellation = store.add(new CancellationTokenSource(token));
      if (args.timeout !== void 0 && args.timeout > 0) {
        const shouldEnforceTimeout = this._configurationService.getValue(
          "chat.tools.terminal.enforceTimeoutFromModel"
          /* TerminalChatAgentToolsSettingId.EnforceTimeoutFromModel */
        ) === true;
        if (shouldEnforceTimeout) {
          timeoutPromise = timeout(args.timeout);
          timeoutPromise.then(() => {
            if (!executeCancellation.token.isCancellationRequested) {
              didTimeout = true;
              executeCancellation.cancel();
            }
          });
        }
      }
      try {
        const strategy = this._getExecuteStrategy(toolTerminal.shellIntegrationQuality, toolTerminal, commandDetection);
        if (toolTerminal.shellIntegrationQuality === "none") {
          toolResultMessage = "$(info) Enable [shell integration](https://code.visualstudio.com/docs/terminal/shell-integration) to improve command detection";
        }
        this._logService.debug(`RunInTerminalTool: Using \`${strategy.type}\` execute strategy for command \`${command}\``);
        store.add(strategy.onDidCreateStartMarker((startMarker) => {
          if (!outputMonitor) {
            outputMonitor = store.add(this._instantiationService.createInstance(OutputMonitor, { instance: toolTerminal.instance, sessionId: invocation.context?.sessionId, getOutput: /* @__PURE__ */ __name((marker) => getOutput(toolTerminal.instance, marker ?? startMarker), "getOutput") }, void 0, invocation.context, token, command));
          }
        }));
        const executeResult = await strategy.execute(command, executeCancellation.token, commandId);
        toolTerminal.receivedUserInput = false;
        if (token.isCancellationRequested) {
          throw new CancellationError();
        }
        if (executeResult.didEnterAltBuffer) {
          const state = toolSpecificData.terminalCommandState ?? {};
          state.timestamp = state.timestamp ?? timingStart;
          toolSpecificData.terminalCommandState = state;
          toolResultMessage = altBufferMessage;
          outputLineCount = 0;
          error = executeResult.error ?? "alternateBuffer";
          altBufferResult = {
            toolResultMessage,
            toolMetadata: {
              exitCode: void 0
            },
            content: [{
              kind: "text",
              value: altBufferMessage
            }]
          };
        } else {
          await this._commandArtifactCollector.capture(toolSpecificData, toolTerminal.instance, commandId);
          {
            const state = toolSpecificData.terminalCommandState ?? {};
            state.timestamp = state.timestamp ?? timingStart;
            if (executeResult.exitCode !== void 0) {
              state.exitCode = executeResult.exitCode;
              if (state.timestamp !== void 0) {
                state.duration = state.duration ?? Math.max(0, Date.now() - state.timestamp);
              }
            }
            toolSpecificData.terminalCommandState = state;
          }
          this._logService.debug(`RunInTerminalTool: Finished \`${strategy.type}\` execute strategy with exitCode \`${executeResult.exitCode}\`, result.length \`${executeResult.output?.length}\`, error \`${executeResult.error}\``);
          outputLineCount = executeResult.output === void 0 ? 0 : count(executeResult.output.trim(), "\n") + 1;
          exitCode = executeResult.exitCode;
          error = executeResult.error;
          const resultArr = [];
          if (executeResult.output !== void 0) {
            resultArr.push(executeResult.output);
          }
          if (executeResult.additionalInformation) {
            resultArr.push(executeResult.additionalInformation);
          }
          terminalResult = resultArr.join("\n\n");
        }
      } catch (e) {
        if (didTimeout && e instanceof CancellationError) {
          this._logService.debug(`RunInTerminalTool: Timeout reached, returning output collected so far`);
          error = "timeout";
          const timeoutOutput = getOutput(toolTerminal.instance, void 0);
          outputLineCount = timeoutOutput ? count(timeoutOutput.trim(), "\n") + 1 : 0;
          terminalResult = timeoutOutput ?? "";
        } else {
          this._logService.debug(`RunInTerminalTool: Threw exception`);
          toolTerminal.instance.dispose();
          error = e instanceof CancellationError ? "canceled" : "unexpectedException";
          throw e;
        }
      } finally {
        timeoutPromise?.cancel();
        store.dispose();
        const timingExecuteMs = Date.now() - timingStart;
        this._telemetry.logInvoke(toolTerminal.instance, {
          terminalToolSessionId: toolSpecificData.terminalToolSessionId,
          didUserEditCommand,
          didToolEditCommand,
          isBackground: false,
          shellIntegrationQuality: toolTerminal.shellIntegrationQuality,
          error,
          isNewSession,
          outputLineCount,
          exitCode,
          timingExecuteMs,
          timingConnectMs,
          inputUserChars,
          inputUserSigint,
          terminalExecutionIdleBeforeTimeout: void 0,
          pollDurationMs: void 0,
          inputToolManualAcceptCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolManualAcceptCount,
          inputToolManualRejectCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolManualRejectCount,
          inputToolManualChars: outputMonitor?.outputMonitorTelemetryCounters?.inputToolManualChars,
          inputToolAutoAcceptCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolAutoAcceptCount,
          inputToolAutoChars: outputMonitor?.outputMonitorTelemetryCounters?.inputToolAutoChars,
          inputToolManualShownCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolManualShownCount,
          inputToolFreeFormInputCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolFreeFormInputCount,
          inputToolFreeFormInputShownCount: outputMonitor?.outputMonitorTelemetryCounters?.inputToolFreeFormInputShownCount
        });
      }
      if (altBufferResult) {
        return altBufferResult;
      }
      const resultText = [];
      if (didUserEditCommand) {
        resultText.push(`Note: The user manually edited the command to \`${command}\`, and this is the output of running that command instead:
`);
      } else if (didToolEditCommand) {
        resultText.push(`Note: The tool simplified the command to \`${command}\`, and this is the output of running that command instead:
`);
      }
      resultText.push(terminalResult);
      return {
        toolResultMessage,
        toolMetadata: {
          exitCode
        },
        content: [{
          kind: "text",
          value: resultText.join("")
        }]
      };
    }
  }
  _handleTerminalVisibility(toolTerminal, chatSessionResource) {
    const chatSessionOpenInWidget = !!this._chatWidgetService.getWidgetBySessionResource(chatSessionResource);
    if (this._configurationService.getValue(
      "chat.tools.terminal.outputLocation"
      /* TerminalChatAgentToolsSettingId.OutputLocation */
    ) === "terminal" && chatSessionOpenInWidget) {
      this._terminalService.setActiveInstance(toolTerminal.instance);
      this._terminalService.revealTerminal(toolTerminal.instance, true);
    }
  }
  // #region Terminal init
  async _initBackgroundTerminal(chatSessionResource, termId, terminalToolSessionId, token) {
    this._logService.debug(`RunInTerminalTool: Creating background terminal with ID=${termId}`);
    const profile = await this._profileFetcher.getCopilotProfile();
    const os = await this._osBackend;
    const toolTerminal = await this._terminalToolCreator.createTerminal(profile, os, token);
    this._terminalChatService.registerTerminalInstanceWithToolSession(terminalToolSessionId, toolTerminal.instance);
    this._terminalChatService.registerTerminalInstanceWithChatSession(chatSessionResource, toolTerminal.instance);
    this._registerInputListener(toolTerminal);
    this._sessionTerminalAssociations.set(chatSessionResource, toolTerminal);
    if (token.isCancellationRequested) {
      toolTerminal.instance.dispose();
      throw new CancellationError();
    }
    await this._setupProcessIdAssociation(toolTerminal, chatSessionResource, termId, true);
    return toolTerminal;
  }
  async _initForegroundTerminal(chatSessionResource, termId, terminalToolSessionId, token) {
    const cachedTerminal = this._sessionTerminalAssociations.get(chatSessionResource);
    if (cachedTerminal) {
      this._logService.debug(`RunInTerminalTool: Using cached foreground terminal with session resource \`${chatSessionResource}\``);
      this._terminalToolCreator.refreshShellIntegrationQuality(cachedTerminal);
      this._terminalChatService.registerTerminalInstanceWithToolSession(terminalToolSessionId, cachedTerminal.instance);
      return cachedTerminal;
    }
    const profile = await this._profileFetcher.getCopilotProfile();
    const os = await this._osBackend;
    const toolTerminal = await this._terminalToolCreator.createTerminal(profile, os, token);
    this._terminalChatService.registerTerminalInstanceWithToolSession(terminalToolSessionId, toolTerminal.instance);
    this._terminalChatService.registerTerminalInstanceWithChatSession(chatSessionResource, toolTerminal.instance);
    this._registerInputListener(toolTerminal);
    this._sessionTerminalAssociations.set(chatSessionResource, toolTerminal);
    if (token.isCancellationRequested) {
      toolTerminal.instance.dispose();
      throw new CancellationError();
    }
    await this._setupProcessIdAssociation(toolTerminal, chatSessionResource, termId, false);
    return toolTerminal;
  }
  _registerInputListener(toolTerminal) {
    const disposable = toolTerminal.instance.onData((data) => {
      if (!telemetryIgnoredSequences.includes(data)) {
        toolTerminal.receivedUserInput = data.length > 0;
      }
    });
    this._register(toolTerminal.instance.onDisposed(() => disposable.dispose()));
  }
  // #endregion
  // #region Session management
  _restoreTerminalAssociations() {
    const storedAssociations = this._storageService.get("chat.terminalSessions", 1, "{}");
    try {
      const associations = JSON.parse(storedAssociations);
      for (const instance of this._terminalService.instances) {
        if (instance.processId) {
          const association = associations[instance.processId];
          if (association) {
            const chatSessionResource = LocalChatSessionUri.forSession(association.sessionId);
            this._logService.debug(`RunInTerminalTool: Restored terminal association for PID ${instance.processId}, session ${association.sessionId}`);
            const toolTerminal = {
              instance,
              shellIntegrationQuality: association.shellIntegrationQuality
            };
            this._sessionTerminalAssociations.set(chatSessionResource, toolTerminal);
            this._terminalChatService.registerTerminalInstanceWithChatSession(chatSessionResource, instance);
            this._register(instance.onDisposed(() => {
              this._removeProcessIdAssociation(instance.processId);
            }));
          }
        }
      }
    } catch (error) {
      this._logService.debug(`RunInTerminalTool: Failed to restore terminal associations: ${error}`);
    }
  }
  async _setupProcessIdAssociation(toolTerminal, chatSessionResource, termId, isBackground) {
    await this._associateProcessIdWithSession(toolTerminal.instance, chatSessionResource, termId, toolTerminal.shellIntegrationQuality, isBackground);
    this._register(toolTerminal.instance.onDisposed(() => {
      if (toolTerminal.instance.processId) {
        this._removeProcessIdAssociation(toolTerminal.instance.processId);
      }
    }));
  }
  async _associateProcessIdWithSession(terminal, chatSessionResource, id, shellIntegrationQuality, isBackground) {
    try {
      const pid = await Promise.race([
        terminal.processReady.then(() => terminal.processId),
        timeout(5e3).then(() => {
          throw new Error("Timeout");
        })
      ]);
      if (isNumber(pid)) {
        const storedAssociations = this._storageService.get("chat.terminalSessions", 1, "{}");
        const associations = JSON.parse(storedAssociations);
        const sessionId = chatSessionResourceToId(chatSessionResource);
        const existingAssociation = associations[pid] || {};
        associations[pid] = {
          ...existingAssociation,
          sessionId,
          shellIntegrationQuality,
          id,
          isBackground
        };
        this._storageService.store(
          "chat.terminalSessions",
          JSON.stringify(associations),
          1,
          0
          /* StorageTarget.USER */
        );
        this._logService.debug(`RunInTerminalTool: Associated terminal PID ${pid} with session ${sessionId}`);
      }
    } catch (error) {
      this._logService.debug(`RunInTerminalTool: Failed to associate terminal with session: ${error}`);
    }
  }
  async _removeProcessIdAssociation(pid) {
    try {
      const storedAssociations = this._storageService.get("chat.terminalSessions", 1, "{}");
      const associations = JSON.parse(storedAssociations);
      if (associations[pid]) {
        delete associations[pid];
        this._storageService.store(
          "chat.terminalSessions",
          JSON.stringify(associations),
          1,
          0
          /* StorageTarget.USER */
        );
        this._logService.debug(`RunInTerminalTool: Removed terminal association for PID ${pid}`);
      }
    } catch (error) {
      this._logService.debug(`RunInTerminalTool: Failed to remove terminal association: ${error}`);
    }
  }
  _cleanupSessionTerminals(chatSessionResource) {
    const toolTerminal = this._sessionTerminalAssociations.get(chatSessionResource);
    if (toolTerminal) {
      this._logService.debug(`RunInTerminalTool: Cleaning up terminal for disposed chat session ${chatSessionResource}`);
      this._sessionTerminalAssociations.delete(chatSessionResource);
      toolTerminal.instance.dispose();
      const terminalToRemove = [];
      for (const [termId, execution] of RunInTerminalTool_1._backgroundExecutions.entries()) {
        if (execution.instance === toolTerminal.instance) {
          execution.dispose();
          terminalToRemove.push(termId);
        }
      }
      for (const termId of terminalToRemove) {
        RunInTerminalTool_1._backgroundExecutions.delete(termId);
      }
    }
  }
  _getExecuteStrategy(shellIntegrationQuality, toolTerminal, commandDetection) {
    let strategy;
    switch (shellIntegrationQuality) {
      case "none":
        strategy = this._instantiationService.createInstance(NoneExecuteStrategy, toolTerminal.instance, () => toolTerminal.receivedUserInput ?? false);
        break;
      case "basic":
        strategy = this._instantiationService.createInstance(BasicExecuteStrategy, toolTerminal.instance, () => toolTerminal.receivedUserInput ?? false, commandDetection);
        break;
      case "rich":
        strategy = this._instantiationService.createInstance(RichExecuteStrategy, toolTerminal.instance, commandDetection);
        break;
    }
    return strategy;
  }
};
RunInTerminalTool = RunInTerminalTool_1 = __decorate([
  __param(0, IChatService),
  __param(1, IConfigurationService),
  __param(2, IHistoryService),
  __param(3, IInstantiationService),
  __param(4, ILabelService),
  __param(5, ILanguageModelToolsService),
  __param(6, IRemoteAgentService),
  __param(7, IStorageService),
  __param(8, ITerminalChatService),
  __param(9, ITerminalLogService),
  __param(10, ITerminalService),
  __param(11, IWorkspaceContextService),
  __param(12, IChatWidgetService),
  __param(13, ITerminalSandboxService)
], RunInTerminalTool);
class BackgroundTerminalExecution extends Disposable {
  static {
    __name(this, "BackgroundTerminalExecution");
  }
  constructor(instance, _xterm, _commandLine, sessionId, commandId) {
    super();
    this.instance = instance;
    this._xterm = _xterm;
    this._commandLine = _commandLine;
    this.sessionId = sessionId;
    this._startMarker = this._register(this._xterm.raw.registerMarker());
    this.instance.runCommand(this._commandLine, true, commandId);
  }
  getOutput(marker) {
    return getOutput(this.instance, marker ?? this._startMarker);
  }
}
let TerminalProfileFetcher = class TerminalProfileFetcher2 {
  static {
    __name(this, "TerminalProfileFetcher");
  }
  constructor(_configurationService, _terminalProfileResolverService, _remoteAgentService) {
    this._configurationService = _configurationService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._remoteAgentService = _remoteAgentService;
    this.osBackend = this._remoteAgentService.getEnvironment().then((remoteEnv) => remoteEnv?.os ?? OS);
  }
  async getCopilotProfile() {
    const os = await this.osBackend;
    const customChatAgentProfile = this._getChatTerminalProfile(os);
    if (customChatAgentProfile) {
      return customChatAgentProfile;
    }
    const defaultProfile = await this._terminalProfileResolverService.getDefaultProfile({
      os,
      remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority
    });
    if (basename(defaultProfile.path) === "cmd.exe") {
      return {
        ...defaultProfile,
        path: "C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
        profileName: "PowerShell"
      };
    }
    return { ...defaultProfile, icon: void 0 };
  }
  async getCopilotShell() {
    return (await this.getCopilotProfile()).path;
  }
  _getChatTerminalProfile(os) {
    let profileSetting;
    switch (os) {
      case 1:
        profileSetting = "chat.tools.terminal.terminalProfile.windows";
        break;
      case 2:
        profileSetting = "chat.tools.terminal.terminalProfile.osx";
        break;
      case 3:
      default:
        profileSetting = "chat.tools.terminal.terminalProfile.linux";
        break;
    }
    const profile = this._configurationService.getValue(profileSetting);
    if (this._isValidChatAgentTerminalProfile(profile)) {
      return profile;
    }
    return void 0;
  }
  _isValidChatAgentTerminalProfile(profile) {
    if (profile === null || profile === void 0 || typeof profile !== "object") {
      return false;
    }
    if ("path" in profile && isString(profile.path)) {
      return true;
    }
    return false;
  }
};
TerminalProfileFetcher = __decorate([
  __param(0, IConfigurationService),
  __param(1, ITerminalProfileResolverService),
  __param(2, IRemoteAgentService)
], TerminalProfileFetcher);
export {
  RunInTerminalTool,
  TerminalProfileFetcher,
  createRunInTerminalToolData
};
//# sourceMappingURL=runInTerminalTool.js.map
