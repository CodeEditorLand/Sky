var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IInteractiveDocumentService = createDecorator("IInteractiveDocumentService");
class InteractiveDocumentService extends Disposable {
  static {
    __name(this, "InteractiveDocumentService");
  }
  _onWillAddInteractiveDocument = this._register(new Emitter());
  onWillAddInteractiveDocument = this._onWillAddInteractiveDocument.event;
  _onWillRemoveInteractiveDocument = this._register(new Emitter());
  onWillRemoveInteractiveDocument = this._onWillRemoveInteractiveDocument.event;
  constructor() {
    super();
  }
  willCreateInteractiveDocument(notebookUri, inputUri, languageId) {
    this._onWillAddInteractiveDocument.fire({
      notebookUri,
      inputUri,
      languageId
    });
  }
  willRemoveInteractiveDocument(notebookUri, inputUri) {
    this._onWillRemoveInteractiveDocument.fire({
      notebookUri,
      inputUri
    });
  }
}
export {
  IInteractiveDocumentService,
  InteractiveDocumentService
};
//# sourceMappingURL=interactiveDocumentService.js.map
