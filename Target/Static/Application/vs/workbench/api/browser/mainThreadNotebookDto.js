var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CellExecutionUpdateType } from "../../contrib/notebook/common/notebookExecutionService.js";
var NotebookDto;
(function(NotebookDto2) {
  function toNotebookOutputItemDto(item) {
    return {
      mime: item.mime,
      valueBytes: item.data
    };
  }
  __name(toNotebookOutputItemDto, "toNotebookOutputItemDto");
  NotebookDto2.toNotebookOutputItemDto = toNotebookOutputItemDto;
  function toNotebookOutputDto(output) {
    return {
      outputId: output.outputId,
      metadata: output.metadata,
      items: output.outputs.map(toNotebookOutputItemDto)
    };
  }
  __name(toNotebookOutputDto, "toNotebookOutputDto");
  NotebookDto2.toNotebookOutputDto = toNotebookOutputDto;
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
  __name(toNotebookCellDataDto, "toNotebookCellDataDto");
  NotebookDto2.toNotebookCellDataDto = toNotebookCellDataDto;
  function toNotebookDataDto(data) {
    return {
      metadata: data.metadata,
      cells: data.cells.map(toNotebookCellDataDto)
    };
  }
  __name(toNotebookDataDto, "toNotebookDataDto");
  NotebookDto2.toNotebookDataDto = toNotebookDataDto;
  function fromNotebookOutputItemDto(item) {
    return {
      mime: item.mime,
      data: item.valueBytes
    };
  }
  __name(fromNotebookOutputItemDto, "fromNotebookOutputItemDto");
  NotebookDto2.fromNotebookOutputItemDto = fromNotebookOutputItemDto;
  function fromNotebookOutputDto(output) {
    return {
      outputId: output.outputId,
      metadata: output.metadata,
      outputs: output.items.map(fromNotebookOutputItemDto)
    };
  }
  __name(fromNotebookOutputDto, "fromNotebookOutputDto");
  NotebookDto2.fromNotebookOutputDto = fromNotebookOutputDto;
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
  __name(fromNotebookCellDataDto, "fromNotebookCellDataDto");
  NotebookDto2.fromNotebookCellDataDto = fromNotebookCellDataDto;
  function fromNotebookDataDto(data) {
    return {
      metadata: data.metadata,
      cells: data.cells.map(fromNotebookCellDataDto)
    };
  }
  __name(fromNotebookDataDto, "fromNotebookDataDto");
  NotebookDto2.fromNotebookDataDto = fromNotebookDataDto;
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
  __name(toNotebookCellDto, "toNotebookCellDto");
  NotebookDto2.toNotebookCellDto = toNotebookCellDto;
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
  __name(fromCellExecuteUpdateDto, "fromCellExecuteUpdateDto");
  NotebookDto2.fromCellExecuteUpdateDto = fromCellExecuteUpdateDto;
  function fromCellExecuteCompleteDto(data) {
    return data;
  }
  __name(fromCellExecuteCompleteDto, "fromCellExecuteCompleteDto");
  NotebookDto2.fromCellExecuteCompleteDto = fromCellExecuteCompleteDto;
  function fromCellEditOperationDto(edit) {
    if (edit.editType === 1) {
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
  __name(fromCellEditOperationDto, "fromCellEditOperationDto");
  NotebookDto2.fromCellEditOperationDto = fromCellEditOperationDto;
})(NotebookDto || (NotebookDto = {}));
export {
  NotebookDto
};
//# sourceMappingURL=mainThreadNotebookDto.js.map
