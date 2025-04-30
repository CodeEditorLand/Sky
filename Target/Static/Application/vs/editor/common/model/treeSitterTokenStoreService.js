var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../core/range.js";
import { TokenQuality, TokenStore } from "./tokenStore.js";
import { registerSingleton } from "../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
const ITreeSitterTokenizationStoreService = createDecorator("treeSitterTokenizationStoreService");
class TreeSitterTokenizationStoreService {
  static {
    __name(this, "TreeSitterTokenizationStoreService");
  }
  constructor() {
    this.tokens = /* @__PURE__ */ new Map();
  }
  setTokens(model, tokens, tokenQuality) {
    const disposables = new DisposableStore();
    const store = disposables.add(new TokenStore(model));
    this.tokens.set(model, { store, accurateVersion: model.getVersionId(), disposables, guessVersion: model.getVersionId() });
    store.buildStore(tokens, tokenQuality);
    disposables.add(model.onWillDispose(() => {
      const storeInfo = this.tokens.get(model);
      if (storeInfo) {
        storeInfo.disposables.dispose();
        this.tokens.delete(model);
      }
    }));
  }
  handleContentChanged(model, e) {
    const storeInfo = this.tokens.get(model);
    if (!storeInfo) {
      return;
    }
    storeInfo.guessVersion = e.versionId;
    for (const change of e.changes) {
      if (change.text.length > change.rangeLength) {
        const offset = change.rangeOffset > 0 ? change.rangeOffset - 1 : change.rangeOffset;
        const oldToken = storeInfo.store.getTokenAt(offset);
        let newToken;
        if (oldToken) {
          newToken = { startOffsetInclusive: oldToken.startOffsetInclusive, length: oldToken.length + change.text.length - change.rangeLength, token: oldToken.token };
          storeInfo.store.markForRefresh(offset, change.rangeOffset + (change.text.length > change.rangeLength ? change.text.length : change.rangeLength));
        } else {
          newToken = { startOffsetInclusive: offset, length: change.text.length, token: 0 };
        }
        storeInfo.store.update(oldToken?.length ?? 0, [newToken], TokenQuality.EditGuess);
      } else if (change.text.length < change.rangeLength) {
        const deletedCharCount = change.rangeLength - change.text.length;
        storeInfo.store.delete(deletedCharCount, change.rangeOffset);
      }
    }
  }
  rangeHasTokens(model, range, minimumTokenQuality) {
    const tokens = this.tokens.get(model);
    if (!tokens) {
      return false;
    }
    return tokens.store.rangeHasTokens(model.getOffsetAt(range.getStartPosition()), model.getOffsetAt(range.getEndPosition()), minimumTokenQuality);
  }
  hasTokens(model, accurateForRange) {
    const tokens = this.tokens.get(model);
    if (!tokens) {
      return false;
    }
    if (!accurateForRange || tokens.guessVersion === tokens.accurateVersion) {
      return true;
    }
    return !tokens.store.rangeNeedsRefresh(model.getOffsetAt(accurateForRange.getStartPosition()), model.getOffsetAt(accurateForRange.getEndPosition()));
  }
  getTokens(model, line) {
    const tokens = this.tokens.get(model)?.store;
    if (!tokens) {
      return void 0;
    }
    const lineStartOffset = model.getOffsetAt({ lineNumber: line, column: 1 });
    const lineTokens = tokens.getTokensInRange(lineStartOffset, model.getOffsetAt({ lineNumber: line, column: model.getLineLength(line) }) + 1);
    const result = new Uint32Array(lineTokens.length * 2);
    for (let i = 0; i < lineTokens.length; i++) {
      result[i * 2] = lineTokens[i].startOffsetInclusive - lineStartOffset + lineTokens[i].length;
      result[i * 2 + 1] = lineTokens[i].token;
    }
    return result;
  }
  updateTokens(model, version, updates, tokenQuality) {
    const existingTokens = this.tokens.get(model);
    if (!existingTokens) {
      return;
    }
    existingTokens.accurateVersion = version;
    for (const update of updates) {
      const lastToken = update.newTokens.length > 0 ? update.newTokens[update.newTokens.length - 1] : void 0;
      let oldRangeLength;
      if (lastToken && existingTokens.guessVersion >= version) {
        oldRangeLength = lastToken.startOffsetInclusive + lastToken.length - update.newTokens[0].startOffsetInclusive;
      } else if (update.oldRangeLength) {
        oldRangeLength = update.oldRangeLength;
      } else {
        oldRangeLength = 0;
      }
      existingTokens.store.update(oldRangeLength, update.newTokens, tokenQuality);
    }
  }
  markForRefresh(model, range) {
    const tree = this.tokens.get(model)?.store;
    if (!tree) {
      return;
    }
    tree.markForRefresh(model.getOffsetAt(range.getStartPosition()), model.getOffsetAt(range.getEndPosition()));
  }
  getNeedsRefresh(model) {
    const needsRefreshOffsetRanges = this.tokens.get(model)?.store.getNeedsRefresh();
    if (!needsRefreshOffsetRanges) {
      return [];
    }
    return needsRefreshOffsetRanges.map((range) => ({
      range: Range.fromPositions(model.getPositionAt(range.startOffset), model.getPositionAt(range.endOffset)),
      startOffset: range.startOffset,
      endOffset: range.endOffset
    }));
  }
  delete(model) {
    const storeInfo = this.tokens.get(model);
    if (storeInfo) {
      storeInfo.disposables.dispose();
      this.tokens.delete(model);
    }
  }
  dispose() {
    for (const [, value] of this.tokens) {
      value.disposables.dispose();
    }
  }
}
registerSingleton(
  ITreeSitterTokenizationStoreService,
  TreeSitterTokenizationStoreService,
  1
  /* InstantiationType.Delayed */
);
export {
  ITreeSitterTokenizationStoreService
};
//# sourceMappingURL=treeSitterTokenStoreService.js.map
