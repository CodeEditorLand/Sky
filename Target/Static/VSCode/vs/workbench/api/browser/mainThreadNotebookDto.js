var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as extHostProtocol from "../common/extHost.protocol.js";
import * as notebookCommon from "../../contrib/notebook/common/notebookCommon.js";
import { CellExecutionUpdateType } from "../../contrib/notebook/common/notebookExecutionService.js";
import { ICellExecuteUpdate, ICellExecutionComplete } from "../../contrib/notebook/common/notebookExecutionStateService.js";
var NotebookDto;
((NotebookDto2) => {
  function toNotebookOutputItemDto(item) {
    return {
      mime: item.mime,
      valueBytes: item.data
    };
  }
  NotebookDto2.toNotebookOutputItemDto = toNotebookOutputItemDto;
  __name(toNotebookOutputItemDto, "toNotebookOutputItemDto");
  function toNotebookOutputDto(output) {
    return {
      outputId: output.outputId,
      metadata: output.metadata,
      items: output.outputs.map(toNotebookOutputItemDto)
    };
  }
  NotebookDto2.toNotebookOutputDto = toNotebookOutputDto;
  __name(toNotebookOutputDto, "toNotebookOutputDto");
  function toNotebookCellDataDto(cell) {
    return {
      cellKind: cell.cellKind,
      language: cell.language,
      mime: cell.mime,
      source: cell.source,
      internalMetadata: cell.internalMetadata,
      metadata: cell.metadata,
      outputs: cell.outputs.map(toNotebookOutputDto)
    };
  }
  NotebookDto2.toNotebookCellDataDto = toNotebookCellDataDto;
  __name(toNotebookCellDataDto, "toNotebookCellDataDto");
  function toNotebookDataDto(data) {
    return {
      metadata: data.metadata,
      cells: data.cells.map(toNotebookCellDataDto)
    };
  }
  NotebookDto2.toNotebookDataDto = toNotebookDataDto;
  __name(toNotebookDataDto, "toNotebookDataDto");
  function fromNotebookOutputItemDto(item) {
    return {
      mime: item.mime,
      data: item.valueBytes
    };
  }
  NotebookDto2.fromNotebookOutputItemDto = fromNotebookOutputItemDto;
  __name(fromNotebookOutputItemDto, "fromNotebookOutputItemDto");
  function fromNotebookOutputDto(output) {
    return {
      outputId: output.outputId,
      metadata: output.metadata,
      outputs: output.items.map(fromNotebookOutputItemDto)
    };
  }
  NotebookDto2.fromNotebookOutputDto = fromNotebookOutputDto;
  __name(fromNotebookOutputDto, "fromNotebookOutputDto");
  function fromNotebookCellDataDto(cell) {
    return {
      cellKind: cell.cellKind,
      language: cell.language,
      mime: cell.mime,
      source: cell.source,
      outputs: cell.outputs.map(fromNotebookOutputDto),
      metadata: cell.metadata,
      internalMetadata: cell.internalMetadata
    };
  }
  NotebookDto2.fromNotebookCellDataDto = fromNotebookCellDataDto;
  __name(fromNotebookCellDataDto, "fromNotebookCellDataDto");
  function fromNotebookDataDto(data) {
    return {
      metadata: data.metadata,
      cells: data.cells.map(fromNotebookCellDataDto)
    };
  }
  NotebookDto2.fromNotebookDataDto = fromNotebookDataDto;
  __name(fromNotebookDataDto, "fromNotebookDataDto");
  function toNotebookCellDto(cell) {
    return {
      handle: cell.handle,
      uri: cell.uri,
      source: cell.textBuffer.getLinesContent(),
      eol: cell.textBuffer.getEOL(),
      language: cell.language,
      cellKind: cell.cellKind,
      outputs: cell.outputs.map(toNotebookOutputDto),
      metadata: cell.metadata,
      internalMetadata: cell.internalMetadata
    };
  }
  NotebookDto2.toNotebookCellDto = toNotebookCellDto;
  __name(toNotebookCellDto, "toNotebookCellDto");
  function fromCellExecuteUpdateDto(data) {
    if (data.editType === CellExecutionUpdateType.Output) {
      return {
        editType: data.editType,
        cellHandle: data.cellHandle,
        append: data.append,
        outputs: data.outputs.map(fromNotebookOutputDto)
      };
    } else if (data.editType === CellExecutionUpdateType.OutputItems) {
      return {
        editType: data.editType,
        append: data.append,
        outputId: data.outputId,
        items: data.items.map(fromNotebookOutputItemDto)
      };
    } else {
      return data;
    }
  }
  NotebookDto2.fromCellExecuteUpdateDto = fromCellExecuteUpdateDto;
  __name(fromCellExecuteUpdateDto, "fromCellExecuteUpdateDto");
  function fromCellExecuteCompleteDto(data) {
    return data;
  }
  NotebookDto2.fromCellExecuteCompleteDto = fromCellExecuteCompleteDto;
  __name(fromCellExecuteCompleteDto, "fromCellExecuteCompleteDto");
  function fromCellEditOperationDto(edit) {
    if (edit.editType === notebookCommon.CellEditType.Replace) {
      return {
        editType: edit.editType,
        index: edit.index,
        count: edit.count,
        cells: edit.cells.map(fromNotebookCellDataDto)
      };
    } else {
      return edit;
    }
  }
  NotebookDto2.fromCellEditOperationDto = fromCellEditOperationDto;
  __name(fromCellEditOperationDto, "fromCellEditOperationDto");
})(NotebookDto || (NotebookDto = {}));
export {
  NotebookDto
};
//# sourceMappingURL=mainThreadNotebookDto.js.map
