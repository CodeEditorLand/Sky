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
var InlineEditsAdapterContribution_1;
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorunWithStore, observableSignalFromEvent } from "../../../../../base/common/observable.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { InlineEditTriggerKind } from "../../../../common/languages.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
let InlineEditsAdapterContribution = class InlineEditsAdapterContribution2 extends Disposable {
  static {
    __name(this, "InlineEditsAdapterContribution");
  }
  static {
    InlineEditsAdapterContribution_1 = this;
  }
  static {
    this.ID = "editor.contrib.inlineEditsAdapter";
  }
  static {
    this.isFirst = true;
  }
  constructor(_editor, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    if (InlineEditsAdapterContribution_1.isFirst) {
      InlineEditsAdapterContribution_1.isFirst = false;
      this.instantiationService.createInstance(InlineEditsAdapter);
    }
  }
};
InlineEditsAdapterContribution = InlineEditsAdapterContribution_1 = __decorate([
  __param(1, IInstantiationService)
], InlineEditsAdapterContribution);
let InlineEditsAdapter = class InlineEditsAdapter2 extends Disposable {
  static {
    __name(this, "InlineEditsAdapter");
  }
  constructor(_languageFeaturesService, _commandService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    this._commandService = _commandService;
    const didChangeSignal = observableSignalFromEvent("didChangeSignal", this._languageFeaturesService.inlineEditProvider.onDidChange);
    this._register(autorunWithStore((reader, store) => {
      didChangeSignal.read(reader);
      store.add(this._languageFeaturesService.inlineCompletionsProvider.register("*", {
        async provideInlineCompletions(model, position, context, token) {
          if (!context.includeInlineEdits) {
            return void 0;
          }
          const allInlineEditProvider = _languageFeaturesService.inlineEditProvider.all(model);
          const inlineEdits = await Promise.all(allInlineEditProvider.map(async (provider) => {
            const result = await provider.provideInlineEdit(model, {
              triggerKind: InlineEditTriggerKind.Automatic,
              requestUuid: context.requestUuid
            }, token);
            if (!result) {
              return void 0;
            }
            return { result, provider };
          }));
          const definedEdits = inlineEdits.filter((e) => !!e);
          return {
            edits: definedEdits,
            items: definedEdits.map((e) => {
              return {
                range: e.result.range,
                showRange: e.result.showRange,
                insertText: e.result.text,
                command: e.result.accepted,
                shownCommand: e.result.shown,
                action: e.result.action,
                isInlineEdit: true,
                edit: e.result
              };
            }),
            commands: definedEdits.flatMap((e) => e.result.commands ?? []),
            enableForwardStability: true
          };
        },
        handleRejection: /* @__PURE__ */ __name((completions, item) => {
          if (item.edit.rejected) {
            this._commandService.executeCommand(item.edit.rejected.id, ...item.edit.rejected.arguments ?? []);
          }
        }, "handleRejection"),
        freeInlineCompletions(c) {
          for (const e of c.edits) {
            e.provider.freeInlineEdit(e.result);
          }
        },
        toString() {
          return "InlineEditsAdapter";
        }
      }));
    }));
  }
};
InlineEditsAdapter = __decorate([
  __param(0, ILanguageFeaturesService),
  __param(1, ICommandService)
], InlineEditsAdapter);
export {
  InlineEditsAdapter,
  InlineEditsAdapterContribution
};
//# sourceMappingURL=inlineEditsAdapter.js.map
