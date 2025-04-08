var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { decodeKeybinding, Keybinding } from "../../../base/common/keybindings.js";
import { OperatingSystem, OS } from "../../../base/common/platform.js";
import { CommandsRegistry, ICommandHandler, ICommandMetadata } from "../../commands/common/commands.js";
import { ContextKeyExpression } from "../../contextkey/common/contextkey.js";
import { Registry } from "../../registry/common/platform.js";
import { combinedDisposable, DisposableStore, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
var KeybindingWeight = /* @__PURE__ */ ((KeybindingWeight2) => {
  KeybindingWeight2[KeybindingWeight2["EditorCore"] = 0] = "EditorCore";
  KeybindingWeight2[KeybindingWeight2["EditorContrib"] = 100] = "EditorContrib";
  KeybindingWeight2[KeybindingWeight2["WorkbenchContrib"] = 200] = "WorkbenchContrib";
  KeybindingWeight2[KeybindingWeight2["BuiltinExtension"] = 300] = "BuiltinExtension";
  KeybindingWeight2[KeybindingWeight2["ExternalExtension"] = 400] = "ExternalExtension";
  return KeybindingWeight2;
})(KeybindingWeight || {});
class KeybindingsRegistryImpl {
  static {
    __name(this, "KeybindingsRegistryImpl");
  }
  _coreKeybindings;
  _extensionKeybindings;
  _cachedMergedKeybindings;
  constructor() {
    this._coreKeybindings = new LinkedList();
    this._extensionKeybindings = [];
    this._cachedMergedKeybindings = null;
  }
  /**
   * Take current platform into account and reduce to primary & secondary.
   */
  static bindToCurrentPlatform(kb) {
    if (OS === OperatingSystem.Windows) {
      if (kb && kb.win) {
        return kb.win;
      }
    } else if (OS === OperatingSystem.Macintosh) {
      if (kb && kb.mac) {
        return kb.mac;
      }
    } else {
      if (kb && kb.linux) {
        return kb.linux;
      }
    }
    return kb;
  }
  registerKeybindingRule(rule) {
    const actualKb = KeybindingsRegistryImpl.bindToCurrentPlatform(rule);
    const result = new DisposableStore();
    if (actualKb && actualKb.primary) {
      const kk = decodeKeybinding(actualKb.primary, OS);
      if (kk) {
        result.add(this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, 0, rule.when));
      }
    }
    if (actualKb && Array.isArray(actualKb.secondary)) {
      for (let i = 0, len = actualKb.secondary.length; i < len; i++) {
        const k = actualKb.secondary[i];
        const kk = decodeKeybinding(k, OS);
        if (kk) {
          result.add(this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, -i - 1, rule.when));
        }
      }
    }
    return result;
  }
  setExtensionKeybindings(rules) {
    const result = [];
    let keybindingsLen = 0;
    for (const rule of rules) {
      if (rule.keybinding) {
        result[keybindingsLen++] = {
          keybinding: rule.keybinding,
          command: rule.id,
          commandArgs: rule.args,
          when: rule.when,
          weight1: rule.weight,
          weight2: 0,
          extensionId: rule.extensionId || null,
          isBuiltinExtension: rule.isBuiltinExtension || false
        };
      }
    }
    this._extensionKeybindings = result;
    this._cachedMergedKeybindings = null;
  }
  registerCommandAndKeybindingRule(desc) {
    return combinedDisposable(
      this.registerKeybindingRule(desc),
      CommandsRegistry.registerCommand(desc)
    );
  }
  _registerDefaultKeybinding(keybinding, commandId, commandArgs, weight1, weight2, when) {
    const remove = this._coreKeybindings.push({
      keybinding,
      command: commandId,
      commandArgs,
      when,
      weight1,
      weight2,
      extensionId: null,
      isBuiltinExtension: false
    });
    this._cachedMergedKeybindings = null;
    return toDisposable(() => {
      remove();
      this._cachedMergedKeybindings = null;
    });
  }
  getDefaultKeybindings() {
    if (!this._cachedMergedKeybindings) {
      this._cachedMergedKeybindings = Array.from(this._coreKeybindings).concat(this._extensionKeybindings);
      this._cachedMergedKeybindings.sort(sorter);
    }
    return this._cachedMergedKeybindings.slice(0);
  }
}
const KeybindingsRegistry = new KeybindingsRegistryImpl();
const Extensions = {
  EditorModes: "platform.keybindingsRegistry"
};
Registry.add(Extensions.EditorModes, KeybindingsRegistry);
function sorter(a, b) {
  if (a.weight1 !== b.weight1) {
    return a.weight1 - b.weight1;
  }
  if (a.command && b.command) {
    if (a.command < b.command) {
      return -1;
    }
    if (a.command > b.command) {
      return 1;
    }
  }
  return a.weight2 - b.weight2;
}
__name(sorter, "sorter");
export {
  Extensions,
  KeybindingWeight,
  KeybindingsRegistry
};
//# sourceMappingURL=keybindingsRegistry.js.map
