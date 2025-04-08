import { FastDomNode } from "../../../../../base/browser/fastDomNode.js";
import { IMouseWheelEvent } from "../../../../../base/browser/mouseEvent.js";
import { IListContextMenuEvent, IListEvent, IListMouseEvent } from "../../../../../base/browser/ui/list/list.js";
import { IListStyles } from "../../../../../base/browser/ui/list/listWidget.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ScrollEvent } from "../../../../../base/common/scrollable.js";
import { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchListOptionsUpdate } from "../../../../../platform/list/browser/listService.js";
import { CellRevealRangeType, CellRevealType, ICellOutputViewModel, ICellViewModel, INotebookCellOverlayChangeAccessor, INotebookViewZoneChangeAccessor } from "../notebookBrowser.js";
import { CellPartsCollection } from "./cellPart.js";
import { CellViewModel, NotebookViewModel } from "../viewModel/notebookViewModelImpl.js";
import { ICellRange } from "../../common/notebookRange.js";
//# sourceMappingURL=notebookRenderingCommon.js.map
