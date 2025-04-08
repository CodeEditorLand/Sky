var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { CancellationError, onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IPosition, Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { InlayHint, InlayHintList, InlayHintsProvider, Command } from "../../../common/languages.js";
import { ITextModel } from "../../../common/model.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
class InlayHintAnchor {
  constructor(range, direction) {
    this.range = range;
    this.direction = direction;
  }
  static {
    __name(this, "InlayHintAnchor");
  }
}
class InlayHintItem {
  constructor(hint, anchor, provider) {
    this.hint = hint;
    this.anchor = anchor;
    this.provider = provider;
  }
  static {
    __name(this, "InlayHintItem");
  }
  _isResolved = false;
  _currentResolve;
  with(delta) {
    const result = new InlayHintItem(this.hint, delta.anchor, this.provider);
    result._isResolved = this._isResolved;
    result._currentResolve = this._currentResolve;
    return result;
  }
  async resolve(token) {
    if (typeof this.provider.resolveInlayHint !== "function") {
      return;
    }
    if (this._currentResolve) {
      await this._currentResolve;
      if (token.isCancellationRequested) {
        return;
      }
      return this.resolve(token);
    }
    if (!this._isResolved) {
      this._currentResolve = this._doResolve(token).finally(() => this._currentResolve = void 0);
    }
    await this._currentResolve;
  }
  async _doResolve(token) {
    try {
      const newHint = await Promise.resolve(this.provider.resolveInlayHint(this.hint, token));
      this.hint.tooltip = newHint?.tooltip ?? this.hint.tooltip;
      this.hint.label = newHint?.label ?? this.hint.label;
      this.hint.textEdits = newHint?.textEdits ?? this.hint.textEdits;
      this._isResolved = true;
    } catch (err) {
      onUnexpectedExternalError(err);
      this._isResolved = false;
    }
  }
}
class InlayHintsFragments {
  static {
    __name(this, "InlayHintsFragments");
  }
  static _emptyInlayHintList = Object.freeze({ dispose() {
  }, hints: [] });
  static async create(registry, model, ranges, token) {
    const data = [];
    const promises = registry.ordered(model).reverse().map((provider) => ranges.map(async (range) => {
      try {
        const result = await provider.provideInlayHints(model, range, token);
        if (result?.hints.length || provider.onDidChangeInlayHints) {
          data.push([result ?? InlayHintsFragments._emptyInlayHintList, provider]);
        }
      } catch (err) {
        onUnexpectedExternalError(err);
      }
    }));
    await Promise.all(promises.flat());
    if (token.isCancellationRequested || model.isDisposed()) {
      throw new CancellationError();
    }
    return new InlayHintsFragments(ranges, data, model);
  }
  _disposables = new DisposableStore();
  items;
  ranges;
  provider;
  constructor(ranges, data, model) {
    this.ranges = ranges;
    this.provider = /* @__PURE__ */ new Set();
    const items = [];
    for (const [list, provider] of data) {
      this._disposables.add(list);
      this.provider.add(provider);
      for (const hint of list.hints) {
        const position = model.validatePosition(hint.position);
        let direction = "before";
        const wordRange = InlayHintsFragments._getRangeAtPosition(model, position);
        let range;
        if (wordRange.getStartPosition().isBefore(position)) {
          range = Range.fromPositions(wordRange.getStartPosition(), position);
          direction = "after";
        } else {
          range = Range.fromPositions(position, wordRange.getEndPosition());
          direction = "before";
        }
        items.push(new InlayHintItem(hint, new InlayHintAnchor(range, direction), provider));
      }
    }
    this.items = items.sort((a, b) => Position.compare(a.hint.position, b.hint.position));
  }
  dispose() {
    this._disposables.dispose();
  }
  static _getRangeAtPosition(model, position) {
    const line = position.lineNumber;
    const word = model.getWordAtPosition(position);
    if (word) {
      return new Range(line, word.startColumn, line, word.endColumn);
    }
    model.tokenization.tokenizeIfCheap(line);
    const tokens = model.tokenization.getLineTokens(line);
    const offset = position.column - 1;
    const idx = tokens.findTokenIndexAtOffset(offset);
    let start = tokens.getStartOffset(idx);
    let end = tokens.getEndOffset(idx);
    if (end - start === 1) {
      if (start === offset && idx > 1) {
        start = tokens.getStartOffset(idx - 1);
        end = tokens.getEndOffset(idx - 1);
      } else if (end === offset && idx < tokens.getCount() - 1) {
        start = tokens.getStartOffset(idx + 1);
        end = tokens.getEndOffset(idx + 1);
      }
    }
    return new Range(line, start + 1, line, end + 1);
  }
}
function asCommandLink(command) {
  return URI.from({
    scheme: Schemas.command,
    path: command.id,
    query: command.arguments && encodeURIComponent(JSON.stringify(command.arguments))
  }).toString();
}
__name(asCommandLink, "asCommandLink");
export {
  InlayHintAnchor,
  InlayHintItem,
  InlayHintsFragments,
  asCommandLink
};
//# sourceMappingURL=inlayHints.js.map
