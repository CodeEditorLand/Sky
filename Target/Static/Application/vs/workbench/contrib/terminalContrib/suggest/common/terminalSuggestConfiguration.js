import { localize } from "../../../../../nls.js";
var TerminalSuggestSettingId;
(function(TerminalSuggestSettingId2) {
  TerminalSuggestSettingId2["Enabled"] = "terminal.integrated.suggest.enabled";
  TerminalSuggestSettingId2["QuickSuggestions"] = "terminal.integrated.suggest.quickSuggestions";
  TerminalSuggestSettingId2["SuggestOnTriggerCharacters"] = "terminal.integrated.suggest.suggestOnTriggerCharacters";
  TerminalSuggestSettingId2["RunOnEnter"] = "terminal.integrated.suggest.runOnEnter";
  TerminalSuggestSettingId2["WindowsExecutableExtensions"] = "terminal.integrated.suggest.windowsExecutableExtensions";
  TerminalSuggestSettingId2["Providers"] = "terminal.integrated.suggest.providers";
  TerminalSuggestSettingId2["ShowStatusBar"] = "terminal.integrated.suggest.showStatusBar";
  TerminalSuggestSettingId2["CdPath"] = "terminal.integrated.suggest.cdPath";
  TerminalSuggestSettingId2["InlineSuggestion"] = "terminal.integrated.suggest.inlineSuggestion";
  TerminalSuggestSettingId2["UpArrowNavigatesHistory"] = "terminal.integrated.suggest.upArrowNavigatesHistory";
})(TerminalSuggestSettingId || (TerminalSuggestSettingId = {}));
const windowsDefaultExecutableExtensions = [
  "exe",
  // Executable file
  "bat",
  // Batch file
  "cmd",
  // Command script
  "com",
  // Command file
  "msi",
  // Windows Installer package
  "ps1",
  // PowerShell script
  "vbs",
  // VBScript file
  "js",
  // JScript file
  "jar",
  // Java Archive (requires Java runtime)
  "py",
  // Python script (requires Python interpreter)
  "rb",
  // Ruby script (requires Ruby interpreter)
  "pl",
  // Perl script (requires Perl interpreter)
  "sh"
  // Shell script (via WSL or third-party tools)
];
const terminalSuggestConfigSection = "terminal.integrated.suggest";
const terminalSuggestConfiguration = {
  [
    "terminal.integrated.suggest.enabled"
    /* TerminalSuggestSettingId.Enabled */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.enabled", "Enables terminal intellisense suggestions (preview) for supported shells ({0}) when {1} is set to {2}.\n\nIf shell integration is installed manually, {3} needs to be set to {4} before calling the shell integration script.", "PowerShell v7+, zsh, bash, fish", `\`#${"terminal.integrated.shellIntegration.enabled"}#\``, "`true`", "`VSCODE_SUGGEST`", "`1`"),
    type: "boolean",
    default: false,
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.providers"
    /* TerminalSuggestSettingId.Providers */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.providers", "Providers are enabled by default. Omit them by setting the id of the provider to `false`."),
    type: "object",
    properties: {},
    default: {
      "terminal-suggest": true,
      "pwsh-shell-integration": true
    },
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.quickSuggestions"
    /* TerminalSuggestSettingId.QuickSuggestions */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.quickSuggestions", "Controls whether suggestions should automatically show up while typing. Also be aware of the {0}-setting which controls if suggestions are triggered by special characters.", `\`#${"terminal.integrated.suggest.suggestOnTriggerCharacters"}#\``),
    type: "object",
    properties: {
      commands: {
        description: localize("suggest.quickSuggestions.commands", "Enable quick suggestions for commands, the first word in a command line input."),
        type: "string",
        enum: ["off", "on"]
      },
      arguments: {
        description: localize("suggest.quickSuggestions.arguments", "Enable quick suggestions for arguments, anything after the first word in a command line input."),
        type: "string",
        enum: ["off", "on"]
      },
      unknown: {
        description: localize("suggest.quickSuggestions.unknown", "Enable quick suggestions when it's unclear what the best suggestion is, if this is on files and folders will be suggested as a fallback."),
        type: "string",
        enum: ["off", "on"]
      }
    },
    default: {
      commands: "on",
      arguments: "on",
      unknown: "off"
    },
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.suggestOnTriggerCharacters"
    /* TerminalSuggestSettingId.SuggestOnTriggerCharacters */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.suggestOnTriggerCharacters", "Controls whether suggestions should automatically show up when typing trigger characters."),
    type: "boolean",
    default: true,
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.runOnEnter"
    /* TerminalSuggestSettingId.RunOnEnter */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.runOnEnter", "Controls whether suggestions should run immediately when `Enter` (not `Tab`) is used to accept the result."),
    enum: ["ignore", "never", "exactMatch", "exactMatchIgnoreExtension", "always"],
    markdownEnumDescriptions: [
      localize("runOnEnter.ignore", "Ignore suggestions and send the enter directly to the shell without completing. This is used as the default value so the suggest widget is as unobtrusive as possible."),
      localize("runOnEnter.never", "Never run on `Enter`."),
      localize("runOnEnter.exactMatch", "Run on `Enter` when the suggestion is typed in its entirety."),
      localize("runOnEnter.exactMatchIgnoreExtension", "Run on `Enter` when the suggestion is typed in its entirety or when a file is typed without its extension included."),
      localize("runOnEnter.always", "Always run on `Enter`.")
    ],
    default: "ignore",
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.windowsExecutableExtensions"
    /* TerminalSuggestSettingId.WindowsExecutableExtensions */
  ]: {
    restricted: true,
    markdownDescription: localize("terminalWindowsExecutableSuggestionSetting", "A set of windows command executable extensions that will be included as suggestions in the terminal.\n\nMany executables are included by default, listed below:\n\n{0}.\n\nTo exclude an extension, set it to `false`\n\n. To include one not in the list, add it and set it to `true`.", windowsDefaultExecutableExtensions.sort().map((extension) => `- ${extension}`).join("\n")),
    type: "object",
    default: {},
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.showStatusBar"
    /* TerminalSuggestSettingId.ShowStatusBar */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.showStatusBar", "Controls whether the terminal suggestions status bar should be shown."),
    type: "boolean",
    default: true,
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.cdPath"
    /* TerminalSuggestSettingId.CdPath */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.cdPath", "Controls whether to enable $CDPATH support which exposes children of the folders in the $CDPATH variable regardless of the current working directory. $CDPATH is expected to be semi colon-separated on Windows and colon-separated on other platforms."),
    type: "string",
    enum: ["off", "relative", "absolute"],
    markdownEnumDescriptions: [
      localize("suggest.cdPath.off", "Disable the feature."),
      localize("suggest.cdPath.relative", "Enable the feature and use relative paths."),
      localize("suggest.cdPath.absolute", "Enable the feature and use absolute paths. This is useful when the shell doesn't natively support `$CDPATH`.")
    ],
    default: "absolute",
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.inlineSuggestion"
    /* TerminalSuggestSettingId.InlineSuggestion */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.inlineSuggestion", "Controls whether the shell's inline suggestion should be detected and how it is scored."),
    type: "string",
    enum: ["off", "alwaysOnTopExceptExactMatch", "alwaysOnTop"],
    markdownEnumDescriptions: [
      localize("suggest.inlineSuggestion.off", "Disable the feature."),
      localize("suggest.inlineSuggestion.alwaysOnTopExceptExactMatch", "Enable the feature and sort the inline suggestion without forcing it to be on top. This means that exact matches will be will be above the inline suggestion."),
      localize("suggest.inlineSuggestion.alwaysOnTop", "Enable the feature and always put the inline suggestion on top.")
    ],
    default: "alwaysOnTop",
    tags: ["preview"]
  },
  [
    "terminal.integrated.suggest.upArrowNavigatesHistory"
    /* TerminalSuggestSettingId.UpArrowNavigatesHistory */
  ]: {
    restricted: true,
    markdownDescription: localize("suggest.upArrowNavigatesHistory", "Determines whether the up arrow key navigates the command history when focus is on the first suggestion and navigation has not yet occurred. When set to false, the up arrow will move focus to the last suggestion instead."),
    type: "boolean",
    default: true,
    tags: ["preview"]
  }
};
export {
  TerminalSuggestSettingId,
  terminalSuggestConfigSection,
  terminalSuggestConfiguration,
  windowsDefaultExecutableExtensions
};
//# sourceMappingURL=terminalSuggestConfiguration.js.map
