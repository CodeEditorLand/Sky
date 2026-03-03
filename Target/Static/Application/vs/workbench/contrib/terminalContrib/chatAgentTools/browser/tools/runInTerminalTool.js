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
import { DeferredPromise, timeout } from "../../../../../../base/common/async.js";
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
import { SandboxedCommandLinePresenter } from "./commandLinePresenter/sandboxedCommandLinePresenter.js";
import { RunInTerminalToolTelemetry } from "../runInTerminalToolTelemetry.js";
import { ToolTerminalCreator } from "../toolTerminalCreator.js";
import { TreeSitterCommandParser } from "../treeSitterCommandParser.js";
import { CommandLineAutoApproveAnalyzer } from "./commandLineAnalyzer/commandLineAutoApproveAnalyzer.js";
import { CommandLineFileWriteAnalyzer } from "./commandLineAnalyzer/commandLineFileWriteAnalyzer.js";
import { CommandLineSandboxAnalyzer } from "./commandLineAnalyzer/commandLineSandboxAnalyzer.js";
import { OutputMonitor } from "./monitoring/outputMonitor.js";
import { OutputMonitorState } from "./monitoring/types.js";
import { chatSessionResourceToId, LocalChatSessionUri } from "../../../../chat/common/model/chatUri.js";
import { URI } from "../../../../../../base/common/uri.js";
import { CommandLineCdPrefixRewriter } from "./commandLineRewriter/commandLineCdPrefixRewriter.js";
import { CommandLinePreventHistoryRewriter } from "./commandLineRewriter/commandLinePreventHistoryRewriter.js";
import { CommandLinePwshChainOperatorRewriter } from "./commandLineRewriter/commandLinePwshChainOperatorRewriter.js";
import { CommandLineSandboxRewriter } from "./commandLineRewriter/commandLineSandboxRewriter.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IHistoryService } from "../../../../../services/history/common/history.js";
import { TerminalCommandArtifactCollector } from "./terminalCommandArtifactCollector.js";
import { isNumber, isString } from "../../../../../../base/common/types.js";
import { ChatConfiguration } from "../../../../chat/common/constants.js";
import { IChatWidgetService } from "../../../../chat/browser/chat.js";
import { clamp } from "../../../../../../base/common/numbers.js";
import { SandboxOutputAnalyzer } from "./sandboxOutputAnalyzer.js";
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
    "- Prefer relative paths when navigating directories, only use absolute when the path is far away or the current cwd is not expected",
    "- Remember when isBackground=false is specified, that the shell and cwd are reused until it is moved to the background",
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
- Prefer relative paths when navigating directories, only use absolute when the path is far away or the current cwd is not expected
- Remember when isBackground=false is specified, that shell and cwd is reused until it is moved to the background
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
        goal: {
          type: "string",
          description: 'A short description of the goal or purpose of the command (e.g., "Install dependencies", "Start development server").'
        },
        isBackground: {
          type: "boolean",
          description: `Whether the command starts a background process.

- If true, a new shell will be spawned where the cwd is the workspace directory and will run asynchronously in the background and you will not see the output.

- If false, a single shell is shared between all non-background terminals where the cwd starts at the workspace directory and is remembered until that terminal is moved to the background, the tool call will block on the command finishing and only then you will get the output.

Examples of background processes: building in watch mode, starting a server. You can check the output of a background process later on by using ${"get_terminal_output"}.`
        },
        timeout: {
          type: "number",
          description: "An optional timeout in milliseconds. When provided, the tool will stop tracking the command after this duration and return the output collected so far. Be conservative with the timeout duration, give enough time that the command would complete on a low-end machine. Use 0 for no timeout. If it's not clear how long the command will take then use 0 to avoid prematurely terminating it, never guess too low."
        }
      },
      required: [
        "command",
        "explanation",
        "goal",
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
const altBufferMessage = "\n" + localize("runInTerminalTool.altBufferMessage", "The command opened the alternate buffer.");
let RunInTerminalTool = class RunInTerminalTool2 extends Disposable {
  static {
    __name(this, "RunInTerminalTool");
  }
  static {
    RunInTerminalTool_1 = this;
  }
  static {
    this._activeExecutions = /* @__PURE__ */ new Map();
  }
  static getBackgroundOutput(id) {
    const execution = RunInTerminalTool_1._activeExecutions.get(id);
    if (!execution) {
      throw new Error("Invalid terminal ID");
    }
    return execution.getOutput();
  }
  /**
   * Gets an active terminal execution by ID. Returns undefined if not found.
   * Can be used to await the completion of a background terminal command.
   */
  static getExecution(id) {
    return RunInTerminalTool_1._activeExecutions.get(id);
  }
  /**
   * Removes an active terminal execution by ID and disposes it.
   * @returns true if the execution was found and removed, false otherwise.
   */
  static removeExecution(id) {
    const execution = RunInTerminalTool_1._activeExecutions.get(id);
    if (!execution) {
      return false;
    }
    execution.dispose();
    RunInTerminalTool_1._activeExecutions.delete(id);
    return true;
  }
  constructor(_chatService, _configurationService, _historyService, _instantiationService, _labelService, _languageModelToolsService, _remoteAgentService, _storageService, _terminalChatService, _logService, _terminalService, _workspaceContextService, _chatWidgetService) {
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
      this._register(this._instantiationService.createInstance(CommandLinePreventHistoryRewriter)),
      this._register(this._instantiationService.createInstance(CommandLineSandboxRewriter))
    ];
    this._commandLineAnalyzers = [
      this._register(this._instantiationService.createInstance(CommandLineFileWriteAnalyzer, this._treeSitterCommandParser, (message, args) => this._logService.info(`RunInTerminalTool#CommandLineFileWriteAnalyzer: ${message}`, args))),
      this._register(this._instantiationService.createInstance(CommandLineAutoApproveAnalyzer, this._treeSitterCommandParser, this._telemetry, (message, args) => this._logService.info(`RunInTerminalTool#CommandLineAutoApproveAnalyzer: ${message}`, args))),
      this._register(this._instantiationService.createInstance(CommandLineSandboxAnalyzer))
    ];
    this._commandLinePresenters = [
      this._instantiationService.createInstance(SandboxedCommandLinePresenter),
      new NodeCommandLinePresenter(),
      new PythonCommandLinePresenter(),
      new RubyCommandLinePresenter()
    ];
    this._outputAnalyzers = [
      this._register(this._instantiationService.createInstance(SandboxOutputAnalyzer))
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
    const chatSessionResource = context.chatSessionResource;
    let instance;
    if (chatSessionResource) {
      const toolTerminal = this._sessionTerminalAssociations.get(chatSessionResource);
      if (toolTerminal && !toolTerminal.isBackground) {
        instance = toolTerminal.instance;
      }
    }
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
    let forDisplayCommand = void 0;
    for (const rewriter of this._commandLineRewriters) {
      const rewriteResult = await rewriter.rewrite({
        commandLine: rewrittenCommand,
        cwd,
        shell,
        os
      });
      if (rewriteResult) {
        rewrittenCommand = rewriteResult.rewritten;
        forDisplayCommand = rewriteResult.forDisplay;
        this._logService.info(`RunInTerminalTool: Command rewritten by ${rewriter.constructor.name}: ${rewriteResult.reasoning}`);
      }
    }
    const toolSpecificData = {
      kind: "terminal",
      terminalToolSessionId,
      terminalCommandId,
      commandLine: {
        original: args.command,
        toolEdited: rewrittenCommand === args.command ? void 0 : rewrittenCommand,
        forDisplay: forDisplayCommand
      },
      cwd,
      language,
      isBackground: args.isBackground
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
      wouldBeAutoApproved || commandLineAnalyzerResults.some((e) => e.forceAutoApproval)
    );
    if (isFinalAutoApproved || isAutoApproveEnabled && commandLineAnalyzerResults.some((e) => e.autoApproveInfo)) {
      toolSpecificData.autoApproveInfo = commandLineAnalyzerResults.find((e) => e.autoApproveInfo)?.autoApproveInfo;
    }
    const commandToDisplay = (toolSpecificData.commandLine.userEdited ?? toolSpecificData.commandLine.toolEdited ?? toolSpecificData.commandLine.original).trimStart();
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
    let presenterInput = commandForPresenter;
    for (const presenter of this._commandLinePresenters) {
      const presenterResult = await presenter.present({ commandLine: { original: args.command, forDisplay: presenterInput }, shell, os });
      if (presenterResult) {
        toolSpecificData.presentationOverrides = {
          commandLine: presenterResult.commandLine,
          language: presenterResult.language ?? void 0
        };
        if (extractedCd && toolSpecificData.confirmation?.cwdLabel) {
          confirmationTitle = args.isBackground ? localize("runInTerminal.presentationOverride.background.inDirectory", "Run `{0}` command in `{1}` in background within `{2}`?", presenterResult.languageDisplayName, shellType, toolSpecificData.confirmation.cwdLabel) : localize("runInTerminal.presentationOverride.inDirectory", "Run `{0}` command in `{1}` within `{2}`?", presenterResult.languageDisplayName, shellType, toolSpecificData.confirmation.cwdLabel);
        } else {
          confirmationTitle = args.isBackground ? localize("runInTerminal.presentationOverride.background", "Run `{0}` command in `{1}` in background?", presenterResult.languageDisplayName, shellType) : localize("runInTerminal.presentationOverride", "Run `{0}` command in `{1}`?", presenterResult.languageDisplayName, shellType);
        }
        if (!presenterResult.processOtherPresenters) {
          break;
        }
        presenterInput = presenterResult.commandLine;
      }
    }
    const shouldShowConfirmation = !isFinalAutoApproved || context.forceConfirmationReason !== void 0;
    const confirmationMessages = shouldShowConfirmation ? {
      title: confirmationTitle,
      message: new MarkdownString(localize("runInTerminal.confirmationMessage", "Explanation: {0}\n\nGoal: {1}", args.explanation, args.goal)),
      disclaimer,
      terminalCustomActions: customActions
    } : void 0;
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
    if (!invocation.context) {
      throw new Error("Invocation context must be provided for this tool");
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
    const chatSessionResource = invocation.context.sessionResource;
    const command = toolSpecificData.commandLine.userEdited ?? toolSpecificData.commandLine.toolEdited ?? toolSpecificData.commandLine.original;
    const didUserEditCommand = toolSpecificData.commandLine.userEdited !== void 0 && toolSpecificData.commandLine.userEdited !== toolSpecificData.commandLine.original;
    const didToolEditCommand = !didUserEditCommand && toolSpecificData.commandLine.toolEdited !== void 0 && toolSpecificData.commandLine.toolEdited !== toolSpecificData.commandLine.original;
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    let error;
    const isNewSession = !args.isBackground && !this._sessionTerminalAssociations.has(chatSessionResource);
    const timingStart = Date.now();
    const termId = generateUuid();
    const terminalToolSessionId = toolSpecificData.terminalToolSessionId;
    const store = new DisposableStore();
    this._logService.debug(`RunInTerminalTool: Creating ${args.isBackground ? "background" : "foreground"} terminal. termId=${termId}, chatSessionResource=${chatSessionResource}`);
    const toolTerminal = await this._initTerminal(chatSessionResource, termId, terminalToolSessionId, args.isBackground, token);
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
    let terminalResult = "";
    let outputLineCount = -1;
    let exitCode;
    let altBufferResult;
    let didTimeout = false;
    let didMoveToBackground = args.isBackground;
    let timeoutPromise;
    let outputMonitor;
    let pollingResult;
    const executeCancellation = store.add(new CancellationTokenSource(token));
    const timeoutValue = args.timeout !== void 0 ? clamp(args.timeout, 0, Number.MAX_SAFE_INTEGER) : void 0;
    if (!args.isBackground && timeoutValue !== void 0 && timeoutValue > 0) {
      const shouldEnforceTimeout = this._configurationService.getValue(
        "chat.tools.terminal.enforceTimeoutFromModel"
        /* TerminalChatAgentToolsSettingId.EnforceTimeoutFromModel */
      ) === true;
      if (shouldEnforceTimeout) {
        timeoutPromise = timeout(timeoutValue);
        timeoutPromise.then(() => {
          if (!executeCancellation.token.isCancellationRequested) {
            didTimeout = true;
            executeCancellation.cancel();
          }
        });
      }
    }
    let continueInBackgroundResolve;
    const continueInBackgroundPromise = new Promise((resolve) => {
      continueInBackgroundResolve = resolve;
    });
    if (terminalToolSessionId) {
      store.add(this._terminalChatService.onDidContinueInBackground((sessionId) => {
        if (sessionId === terminalToolSessionId) {
          const execution = RunInTerminalTool_1._activeExecutions.get(termId);
          if (execution) {
            execution.setBackground();
          }
          didMoveToBackground = true;
          continueInBackgroundResolve?.();
        }
      }));
    }
    let executionPromise;
    try {
      const execution = this._instantiationService.createInstance(ActiveTerminalExecution, chatSessionResource, termId, toolTerminal, commandDetection, args.isBackground);
      if (toolTerminal.shellIntegrationQuality === "none") {
        toolResultMessage = "$(info) Enable [shell integration](https://code.visualstudio.com/docs/terminal/shell-integration) to improve command detection";
      }
      this._logService.debug(`RunInTerminalTool: Using \`${execution.strategy.type}\` execute strategy for command \`${command}\``);
      store.add(execution);
      RunInTerminalTool_1._activeExecutions.set(termId, execution);
      const startMarkerPromise = Event.toPromise(execution.strategy.onDidCreateStartMarker);
      store.add(execution.strategy.onDidCreateStartMarker((startMarker) => {
        if (!outputMonitor) {
          outputMonitor = store.add(this._instantiationService.createInstance(OutputMonitor, {
            instance: toolTerminal.instance,
            sessionResource: chatSessionResource,
            getOutput: /* @__PURE__ */ __name((marker) => execution.getOutput(marker ?? startMarker), "getOutput")
          }, void 0, invocation.context, token, command));
        }
      }));
      executionPromise = execution.start(command, executeCancellation.token, commandId);
      if (args.isBackground) {
        this._logService.debug(`RunInTerminalTool: Starting background execution \`${command}\``);
        await startMarkerPromise;
        if (outputMonitor) {
          await Event.toPromise(outputMonitor.onDidFinishCommand);
          pollingResult = outputMonitor.pollingResult;
        }
        await this._commandArtifactCollector.capture(toolSpecificData, toolTerminal.instance, commandId);
        if (token.isCancellationRequested) {
          throw new CancellationError();
        }
        const state = toolSpecificData.terminalCommandState ?? {};
        state.timestamp = state.timestamp ?? timingStart;
        toolSpecificData.terminalCommandState = state;
        let resultText2 = didUserEditCommand ? `Note: The user manually edited the command to \`${command}\`, and that command is now running in terminal with ID=${termId}` : didToolEditCommand ? `Note: The tool simplified the command to \`${command}\`, and that command is now running in terminal with ID=${termId}` : `Command is running in terminal with ID=${termId}`;
        if (pollingResult && pollingResult.modelOutputEvalResponse) {
          resultText2 += `
 The command became idle with output:
${pollingResult.modelOutputEvalResponse}`;
        } else if (pollingResult) {
          resultText2 += `
 The command is still running, with output:
${pollingResult.output}`;
        }
        return {
          toolMetadata: {
            exitCode: void 0
            // Background processes don't have immediate exit codes
          },
          content: [{
            kind: "text",
            value: resultText2
          }]
        };
      } else {
        const raceResult = await Promise.race([
          executionPromise.then((result) => ({ type: "completed", result })),
          continueInBackgroundPromise.then(() => ({ type: "background" }))
        ]);
        if (raceResult.type === "background") {
          this._logService.debug(`RunInTerminalTool: Continue in background triggered, returning output collected so far`);
          error = "continueInBackground";
          const backgroundOutput = execution.getOutput();
          outputLineCount = backgroundOutput ? count(backgroundOutput.trim(), "\n") + 1 : 0;
          terminalResult = backgroundOutput;
        } else {
          const executeResult = raceResult.result;
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
            this._logService.debug(`RunInTerminalTool: Finished \`${execution.strategy.type}\` execute strategy with exitCode \`${executeResult.exitCode}\`, result.length \`${executeResult.output?.length}\`, error \`${executeResult.error}\``);
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
        }
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
        if (e instanceof CancellationError) {
          await this._commandArtifactCollector.capture(toolSpecificData, toolTerminal.instance, commandId);
          const state = toolSpecificData.terminalCommandState ?? {};
          if (state.exitCode === void 0) {
            state.exitCode = -1;
            state.timestamp = state.timestamp ?? timingStart;
            state.duration = state.duration ?? Math.max(0, Date.now() - state.timestamp);
          }
          toolSpecificData.terminalCommandState = state;
        }
        RunInTerminalTool_1._activeExecutions.get(termId)?.dispose();
        RunInTerminalTool_1._activeExecutions.delete(termId);
        toolTerminal.instance.dispose();
        error = e instanceof CancellationError ? "canceled" : "unexpectedException";
        throw e;
      }
    } finally {
      timeoutPromise?.cancel();
      if (didMoveToBackground && executionPromise) {
        executionPromise.catch((e) => {
          if (!(e instanceof CancellationError)) {
            this._logService.error(`RunInTerminalTool: Background execution error`, e);
          }
        });
      } else {
        RunInTerminalTool_1._activeExecutions.get(termId)?.dispose();
        RunInTerminalTool_1._activeExecutions.delete(termId);
      }
      store.dispose();
      const timingExecuteMs = Date.now() - timingStart;
      this._telemetry.logInvoke(toolTerminal.instance, {
        terminalToolSessionId: toolSpecificData.terminalToolSessionId,
        didUserEditCommand,
        didToolEditCommand,
        isBackground: args.isBackground,
        shellIntegrationQuality: toolTerminal.shellIntegrationQuality,
        error,
        isNewSession,
        outputLineCount,
        exitCode,
        timingExecuteMs,
        timingConnectMs,
        inputUserChars,
        inputUserSigint,
        terminalExecutionIdleBeforeTimeout: pollingResult?.state === OutputMonitorState.Idle,
        pollDurationMs: pollingResult?.pollDurationMs,
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
    if (didMoveToBackground && !args.isBackground) {
      resultText.push(`Note: This terminal execution was moved to the background using the ID ${termId}
`);
    }
    let outputAnalyzerMessage;
    for (const analyzer of this._outputAnalyzers) {
      const message = await analyzer.analyze({ exitCode, exitResult: terminalResult, commandLine: command });
      if (message) {
        outputAnalyzerMessage = message;
        break;
      }
    }
    if (outputAnalyzerMessage) {
      resultText.push(`${outputAnalyzerMessage}
`);
    }
    resultText.push(terminalResult);
    const isError = exitCode !== void 0 && exitCode !== 0;
    return {
      toolResultMessage,
      toolMetadata: {
        exitCode
      },
      toolResultDetails: isError ? {
        input: command,
        output: [{ type: "embed", isText: true, value: terminalResult }],
        isError: true
      } : void 0,
      content: [{
        kind: "text",
        value: resultText.join("")
      }]
    };
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
  /**
   * Initializes a terminal for command execution. For foreground mode, reuses existing cached
   * terminal from the session. For background mode, always creates a new terminal to allow
   * parallel execution.
   */
  async _initTerminal(chatSessionResource, termId, terminalToolSessionId, isBackground, token) {
    if (!isBackground) {
      const cachedTerminal = this._sessionTerminalAssociations.get(chatSessionResource);
      if (cachedTerminal && !cachedTerminal.isBackground) {
        this._logService.debug(`RunInTerminalTool: Using cached terminal with session resource \`${chatSessionResource}\``);
        this._terminalToolCreator.refreshShellIntegrationQuality(cachedTerminal);
        this._terminalChatService.registerTerminalInstanceWithToolSession(terminalToolSessionId, cachedTerminal.instance);
        return cachedTerminal;
      }
    }
    this._logService.debug(`RunInTerminalTool: Creating ${isBackground ? "background" : "foreground"} terminal with ID=${termId}`);
    const profile = await this._profileFetcher.getCopilotProfile();
    const os = await this._osBackend;
    const toolTerminal = await this._terminalToolCreator.createTerminal(profile, os, token);
    toolTerminal.isBackground = isBackground;
    this._terminalChatService.registerTerminalInstanceWithToolSession(terminalToolSessionId, toolTerminal.instance);
    this._terminalChatService.registerTerminalInstanceWithChatSession(chatSessionResource, toolTerminal.instance);
    this._registerInputListener(toolTerminal);
    this._sessionTerminalAssociations.set(chatSessionResource, toolTerminal);
    if (token.isCancellationRequested) {
      toolTerminal.instance.dispose();
      throw new CancellationError();
    }
    await this._setupProcessIdAssociation(toolTerminal, chatSessionResource, termId, isBackground);
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
              shellIntegrationQuality: association.shellIntegrationQuality,
              isBackground: association.isBackground
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
      for (const [termId, execution] of RunInTerminalTool_1._activeExecutions.entries()) {
        if (execution.instance === toolTerminal.instance) {
          execution.dispose();
          terminalToRemove.push(termId);
        }
      }
      for (const termId of terminalToRemove) {
        RunInTerminalTool_1._activeExecutions.delete(termId);
      }
    }
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
  __param(12, IChatWidgetService)
], RunInTerminalTool);
let ActiveTerminalExecution = class ActiveTerminalExecution2 extends Disposable {
  static {
    __name(this, "ActiveTerminalExecution");
  }
  /**
   * The promise that resolves when the execute strategy completes. Can be awaited to get the
   * full result with exit code.
   */
  get completionPromise() {
    return this._completionDeferred.p;
  }
  get isBackground() {
    return this._isBackground;
  }
  get startMarker() {
    return this._startMarker;
  }
  get instance() {
    return this._toolTerminal.instance;
  }
  constructor(sessionResource, termId, toolTerminal, commandDetection, isBackground, _instantiationService) {
    super();
    this.sessionResource = sessionResource;
    this.termId = termId;
    this._instantiationService = _instantiationService;
    this._toolTerminal = toolTerminal;
    this._isBackground = isBackground;
    this._completionDeferred = new DeferredPromise();
    this.strategy = this._register(this._createStrategy(commandDetection));
    this._register(this.strategy.onDidCreateStartMarker((marker) => {
      if (marker) {
        this._startMarker = marker;
      }
    }));
  }
  _createStrategy(commandDetection) {
    switch (this._toolTerminal.shellIntegrationQuality) {
      case "none":
        return this._instantiationService.createInstance(NoneExecuteStrategy, this._toolTerminal.instance, () => this._toolTerminal.receivedUserInput ?? false);
      case "basic":
        return this._instantiationService.createInstance(BasicExecuteStrategy, this._toolTerminal.instance, () => this._toolTerminal.receivedUserInput ?? false, commandDetection);
      case "rich":
        return this._instantiationService.createInstance(RichExecuteStrategy, this._toolTerminal.instance, commandDetection);
    }
  }
  /**
   * Starts the command execution using the execute strategy.
   * @param commandLine The command to execute
   * @param token Cancellation token
   * @param commandId Optional command ID for linking
   * @returns The execution result
   */
  async start(commandLine, token, commandId) {
    try {
      const result = await this.strategy.execute(commandLine, token, commandId);
      this._completionDeferred.complete(result);
      return result;
    } catch (e) {
      this._completionDeferred.error(e);
      throw e;
    }
  }
  /**
   * Switches this execution to foreground mode, meaning callers will await its completion.
   */
  setForeground() {
    this._isBackground = false;
  }
  /**
   * Switches this execution to background mode.
   */
  setBackground() {
    this._isBackground = true;
  }
  /**
   * Gets the current output from the terminal.
   */
  getOutput(marker) {
    return getOutput(this.instance, marker ?? this._startMarker);
  }
};
ActiveTerminalExecution = __decorate([
  __param(5, IInstantiationService)
], ActiveTerminalExecution);
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
