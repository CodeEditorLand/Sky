import { IDisposable } from '../../../base/common/lifecycle.js';
import { IFileService } from '../../files/common/files.js';
export declare class WebviewProtocolProvider implements IDisposable {
    private readonly _fileService;
    private static validWebviewFilePaths;
    constructor(_fileService: IFileService);
    dispose(): void;
    private handleWebviewRequest;
}
