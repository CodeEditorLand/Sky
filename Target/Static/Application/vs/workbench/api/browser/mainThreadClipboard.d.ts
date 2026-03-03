import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadClipboardShape } from '../common/extHost.protocol.js';
import { IClipboardService } from '../../../platform/clipboard/common/clipboardService.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare class MainThreadClipboard implements MainThreadClipboardShape {
    private readonly _clipboardService;
    private readonly _logService;
    constructor(_context: IExtHostContext, _clipboardService: IClipboardService, _logService: ILogService);
    dispose(): void;
    $readText(): Promise<string>;
    $writeText(value: string): Promise<void>;
}
