import { URI, UriComponents } from '../../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { NotebookTextModel } from '../../../../notebook/common/model/notebookTextModel.js';
import { INotebookTextModel, NotebookData, TransientOptions } from '../../../../notebook/common/notebookCommon.js';
type ChatEditingSnapshotNotebookContentQueryData = {
    session: UriComponents;
    requestId: string | undefined;
    undoStop: string | undefined;
    viewType: string;
};
export declare const ChatEditingNotebookSnapshotScheme = "chat-editing-notebook-snapshot-model";
export declare function getNotebookSnapshotFileURI(chatSessionResource: URI, requestId: string | undefined, undoStop: string | undefined, path: string, viewType: string): URI;
export declare function parseNotebookSnapshotFileURI(resource: URI): ChatEditingSnapshotNotebookContentQueryData;
export declare function createSnapshot(notebook: INotebookTextModel, transientOptions: TransientOptions | undefined, outputSizeConfig: IConfigurationService | number): string;
export declare function restoreSnapshot(notebook: INotebookTextModel, snapshot: string): void;
export declare class SnapshotComparer {
    private readonly data;
    private readonly transientOptions;
    constructor(initialCotent: string);
    isEqual(notebook: NotebookData | NotebookTextModel): boolean;
}
export declare function deserializeSnapshot(snapshot: string): {
    transientOptions: TransientOptions | undefined;
    data: NotebookData;
};
export {};
