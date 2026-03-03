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
var SlashCommandHandler_1;
import { Disposable } from "../../../../base/common/lifecycle.js";
import { themeColorFromId } from "../../../../base/common/themables.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { Range } from "../../../../editor/common/core/range.js";
import { getWordAtText } from "../../../../editor/common/core/wordHelper.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { CommandsRegistry, ICommandService } from "../../../../platform/commands/common/commands.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { inputPlaceholderForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { localize } from "../../../../nls.js";
import { chatSlashCommandBackground, chatSlashCommandForeground } from "../../../../workbench/contrib/chat/common/widget/chatColors.js";
import { AICustomizationManagementCommands, AICustomizationManagementSection } from "../../../../workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.js";
const SESSIONS_EXECUTE_SLASH_COMMAND_ID = "sessions.chat.executeSlashCommand";
CommandsRegistry.registerCommand(SESSIONS_EXECUTE_SLASH_COMMAND_ID, (_, handler, slashCommandStr) => {
  handler.tryExecuteSlashCommand(slashCommandStr);
  handler.clearInput();
});
let SlashCommandHandler = class SlashCommandHandler2 extends Disposable {
  static {
    __name(this, "SlashCommandHandler");
  }
  static {
    SlashCommandHandler_1 = this;
  }
  static {
    this._slashDecoType = "sessions-slash-command";
  }
  static {
    this._slashPlaceholderDecoType = "sessions-slash-placeholder";
  }
  static {
    this._slashDecosRegistered = false;
  }
  constructor(_editor, commandService, codeEditorService, languageFeaturesService, themeService) {
    super();
    this._editor = _editor;
    this.commandService = commandService;
    this.codeEditorService = codeEditorService;
    this.languageFeaturesService = languageFeaturesService;
    this.themeService = themeService;
    this._slashCommands = [];
    this._registerSlashCommands();
    this._registerCompletions();
    this._registerDecorations();
  }
  clearInput() {
    this._editor.getModel()?.setValue("");
  }
  /**
   * Attempts to parse and execute a slash command from the input.
   * Returns `true` if a command was handled.
   */
  tryExecuteSlashCommand(query) {
    const match = query.match(/^\/(\w+)\s*(.*)/s);
    if (!match) {
      return false;
    }
    const commandName = match[1];
    const slashCommand = this._slashCommands.find((c) => c.command === commandName);
    if (!slashCommand) {
      return false;
    }
    slashCommand.execute(match[2]?.trim() ?? "");
    return true;
  }
  _registerSlashCommands() {
    const openSection = /* @__PURE__ */ __name((section) => () => this.commandService.executeCommand(AICustomizationManagementCommands.OpenEditor, section), "openSection");
    this._slashCommands.push({
      command: "agents",
      detail: localize("slashCommand.agents", "View and manage custom agents"),
      sortText: "z3_agents",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Agents)
    });
    this._slashCommands.push({
      command: "skills",
      detail: localize("slashCommand.skills", "View and manage skills"),
      sortText: "z3_skills",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Skills)
    });
    this._slashCommands.push({
      command: "instructions",
      detail: localize("slashCommand.instructions", "View and manage instructions"),
      sortText: "z3_instructions",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Instructions)
    });
    this._slashCommands.push({
      command: "prompts",
      detail: localize("slashCommand.prompts", "View and manage prompt files"),
      sortText: "z3_prompts",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Prompts)
    });
    this._slashCommands.push({
      command: "hooks",
      detail: localize("slashCommand.hooks", "View and manage hooks"),
      sortText: "z3_hooks",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Hooks)
    });
  }
  _registerDecorations() {
    if (!SlashCommandHandler_1._slashDecosRegistered) {
      SlashCommandHandler_1._slashDecosRegistered = true;
      this.codeEditorService.registerDecorationType("sessions-chat", SlashCommandHandler_1._slashDecoType, {
        color: themeColorFromId(chatSlashCommandForeground),
        backgroundColor: themeColorFromId(chatSlashCommandBackground),
        borderRadius: "3px"
      });
      this.codeEditorService.registerDecorationType("sessions-chat", SlashCommandHandler_1._slashPlaceholderDecoType, {});
    }
    this._register(this._editor.onDidChangeModelContent(() => this._updateDecorations()));
    this._updateDecorations();
  }
  _updateDecorations() {
    const model = this._editor.getModel();
    const value = model?.getValue() ?? "";
    const match = value.match(/^\/(\w+)\s?/);
    if (!match) {
      this._editor.setDecorationsByType("sessions-chat", SlashCommandHandler_1._slashDecoType, []);
      this._editor.setDecorationsByType("sessions-chat", SlashCommandHandler_1._slashPlaceholderDecoType, []);
      return;
    }
    const commandName = match[1];
    const slashCommand = this._slashCommands.find((c) => c.command === commandName);
    if (!slashCommand) {
      this._editor.setDecorationsByType("sessions-chat", SlashCommandHandler_1._slashDecoType, []);
      this._editor.setDecorationsByType("sessions-chat", SlashCommandHandler_1._slashPlaceholderDecoType, []);
      return;
    }
    const commandEnd = match[0].trimEnd().length;
    const commandDeco = [{
      range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: commandEnd + 1 }
    }];
    this._editor.setDecorationsByType("sessions-chat", SlashCommandHandler_1._slashDecoType, commandDeco);
    const restOfInput = value.slice(match[0].length).trim();
    if (!restOfInput && slashCommand.detail) {
      const placeholderCol = match[0].length + 1;
      const placeholderDeco = [{
        range: { startLineNumber: 1, startColumn: placeholderCol, endLineNumber: 1, endColumn: model.getLineMaxColumn(1) },
        renderOptions: {
          after: {
            contentText: slashCommand.detail,
            color: this._getPlaceholderColor()
          }
        }
      }];
      this._editor.setDecorationsByType("sessions-chat", SlashCommandHandler_1._slashPlaceholderDecoType, placeholderDeco);
    } else {
      this._editor.setDecorationsByType("sessions-chat", SlashCommandHandler_1._slashPlaceholderDecoType, []);
    }
  }
  _getPlaceholderColor() {
    const theme = this.themeService.getColorTheme();
    return theme.getColor(inputPlaceholderForeground)?.toString();
  }
  _registerCompletions() {
    const uri = this._editor.getModel()?.uri;
    if (!uri) {
      return;
    }
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: uri.scheme, hasAccessToAllModels: true }, {
      _debugDisplayName: "sessionsSlashCommands",
      triggerCharacters: ["/"],
      provideCompletionItems: /* @__PURE__ */ __name((model, position, _context, _token) => {
        const range = this._computeCompletionRanges(model, position, /\/\w*/g);
        if (!range) {
          return null;
        }
        const textBefore = model.getValueInRange(new Range(1, 1, range.replace.startLineNumber, range.replace.startColumn));
        if (textBefore.trim() !== "") {
          return null;
        }
        return {
          suggestions: this._slashCommands.map((c, i) => {
            const withSlash = `/${c.command}`;
            return {
              label: withSlash,
              insertText: c.executeImmediately ? "" : `${withSlash} `,
              detail: c.detail,
              range,
              sortText: c.sortText ?? "a".repeat(i + 1),
              kind: 18,
              command: c.executeImmediately ? { id: SESSIONS_EXECUTE_SLASH_COMMAND_ID, title: withSlash, arguments: [this, withSlash] } : void 0
            };
          })
        };
      }, "provideCompletionItems")
    }));
  }
  _computeCompletionRanges(model, position, reg) {
    const varWord = getWordAtText(position.column, reg, model.getLineContent(position.lineNumber), 0);
    if (!varWord && model.getWordUntilPosition(position).word) {
      return;
    }
    if (!varWord && position.column > 1) {
      const textBefore = model.getValueInRange(new Range(position.lineNumber, position.column - 1, position.lineNumber, position.column));
      if (textBefore !== " ") {
        return;
      }
    }
    let insert;
    let replace;
    if (!varWord) {
      insert = replace = Range.fromPositions(position);
    } else {
      insert = new Range(position.lineNumber, varWord.startColumn, position.lineNumber, position.column);
      replace = new Range(position.lineNumber, varWord.startColumn, position.lineNumber, varWord.endColumn);
    }
    return { insert, replace };
  }
};
SlashCommandHandler = SlashCommandHandler_1 = __decorate([
  __param(1, ICommandService),
  __param(2, ICodeEditorService),
  __param(3, ILanguageFeaturesService),
  __param(4, IThemeService)
], SlashCommandHandler);
export {
  SESSIONS_EXECUTE_SLASH_COMMAND_ID,
  SlashCommandHandler
};
//# sourceMappingURL=slashCommands.js.map
