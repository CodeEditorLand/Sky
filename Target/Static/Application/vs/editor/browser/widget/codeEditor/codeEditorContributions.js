var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getWindow, runWhenWindowIdle } from "../../../../base/browser/dom.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Disposable, DisposableMap } from "../../../../base/common/lifecycle.js";
class CodeEditorContributions extends Disposable {
  static {
    __name(this, "CodeEditorContributions");
  }
  constructor() {
    super();
    this._editor = null;
    this._instantiationService = null;
    this._instances = this._register(new DisposableMap());
    this._pending = /* @__PURE__ */ new Map();
    this._finishedInstantiation = [];
    this._finishedInstantiation[
      0
      /* EditorContributionInstantiation.Eager */
    ] = false;
    this._finishedInstantiation[
      1
      /* EditorContributionInstantiation.AfterFirstRender */
    ] = false;
    this._finishedInstantiation[
      2
      /* EditorContributionInstantiation.BeforeFirstInteraction */
    ] = false;
    this._finishedInstantiation[
      3
      /* EditorContributionInstantiation.Eventually */
    ] = false;
  }
  initialize(editor, contributions, instantiationService) {
    this._editor = editor;
    this._instantiationService = instantiationService;
    for (const desc of contributions) {
      if (this._pending.has(desc.id)) {
        onUnexpectedError(new Error(`Cannot have two contributions with the same id ${desc.id}`));
        continue;
      }
      this._pending.set(desc.id, desc);
    }
    this._instantiateSome(
      0
      /* EditorContributionInstantiation.Eager */
    );
    this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
      this._instantiateSome(
        1
        /* EditorContributionInstantiation.AfterFirstRender */
      );
    }));
    this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
      this._instantiateSome(
        2
        /* EditorContributionInstantiation.BeforeFirstInteraction */
      );
    }));
    this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
      this._instantiateSome(
        3
        /* EditorContributionInstantiation.Eventually */
      );
    }, 5e3));
  }
  saveViewState() {
    const contributionsState = {};
    for (const [id, contribution] of this._instances) {
      if (typeof contribution.saveViewState === "function") {
        contributionsState[id] = contribution.saveViewState();
      }
    }
    return contributionsState;
  }
  restoreViewState(contributionsState) {
    for (const [id, contribution] of this._instances) {
      if (typeof contribution.restoreViewState === "function") {
        contribution.restoreViewState(contributionsState[id]);
      }
    }
  }
  get(id) {
    this._instantiateById(id);
    return this._instances.get(id) || null;
  }
  /**
   * used by tests
   */
  set(id, value) {
    this._instances.set(id, value);
  }
  onBeforeInteractionEvent() {
    this._instantiateSome(
      2
      /* EditorContributionInstantiation.BeforeFirstInteraction */
    );
  }
  onAfterModelAttached() {
    return runWhenWindowIdle(getWindow(this._editor?.getDomNode()), () => {
      this._instantiateSome(
        1
        /* EditorContributionInstantiation.AfterFirstRender */
      );
    }, 50);
  }
  _instantiateSome(instantiation) {
    if (this._finishedInstantiation[instantiation]) {
      return;
    }
    this._finishedInstantiation[instantiation] = true;
    const contribs = this._findPendingContributionsByInstantiation(instantiation);
    for (const contrib of contribs) {
      this._instantiateById(contrib.id);
    }
  }
  _findPendingContributionsByInstantiation(instantiation) {
    const result = [];
    for (const [, desc] of this._pending) {
      if (desc.instantiation === instantiation) {
        result.push(desc);
      }
    }
    return result;
  }
  _instantiateById(id) {
    const desc = this._pending.get(id);
    if (!desc) {
      return;
    }
    this._pending.delete(id);
    if (!this._instantiationService || !this._editor) {
      throw new Error(`Cannot instantiate contributions before being initialized!`);
    }
    try {
      const instance = this._instantiationService.createInstance(desc.ctor, this._editor);
      this._instances.set(desc.id, instance);
      if (typeof instance.restoreViewState === "function" && desc.instantiation !== 0) {
        console.warn(`Editor contribution '${desc.id}' should be eager instantiated because it uses saveViewState / restoreViewState.`);
      }
    } catch (err) {
      onUnexpectedError(err);
    }
  }
}
export {
  CodeEditorContributions
};
//# sourceMappingURL=codeEditorContributions.js.map
