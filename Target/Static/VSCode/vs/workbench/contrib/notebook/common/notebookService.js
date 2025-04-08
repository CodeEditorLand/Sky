var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { URI } from "../../../../base/common/uri.js";
import { NotebookProviderInfo } from "./notebookProvider.js";
import { Event } from "../../../../base/common/event.js";
import { INotebookRendererInfo, NotebookData, TransientOptions, IOrderedMimeType, IOutputDto, INotebookContributionData, NotebookExtensionDescription, INotebookStaticPreloadInfo } from "./notebookCommon.js";
import { NotebookTextModel } from "./model/notebookTextModel.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { NotebookCellTextModel } from "./model/notebookCellTextModel.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { VSBuffer, VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IFileStatWithMetadata, IWriteFileOptions } from "../../../../platform/files/common/files.js";
import { ITextQuery } from "../../../services/search/common/search.js";
import { NotebookPriorityInfo } from "../../search/common/search.js";
import { INotebookFileMatchNoModel } from "../../search/common/searchNotebookHelpers.js";
import { SnapshotContext } from "../../../services/workingCopy/common/fileWorkingCopy.js";
const INotebookService = createDecorator("notebookService");
class SimpleNotebookProviderInfo {
  constructor(viewType, serializer, extensionData) {
    this.viewType = viewType;
    this.serializer = serializer;
    this.extensionData = extensionData;
  }
  static {
    __name(this, "SimpleNotebookProviderInfo");
  }
}
export {
  INotebookService,
  SimpleNotebookProviderInfo
};
//# sourceMappingURL=notebookService.js.map
