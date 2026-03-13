import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IElementData, IBrowserTargetLocator } from '../../../../platform/browserElements/common/browserElements.js';
import { IRectangle } from '../../../../platform/window/common/window.js';
export declare const IBrowserElementsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBrowserElementsService>;
export interface IBrowserElementsService {
    _serviceBrand: undefined;
    getElementData(rect: IRectangle, token: CancellationToken, locator: IBrowserTargetLocator | undefined): Promise<IElementData | undefined>;
    getFocusedElementData(rect: IRectangle, token: CancellationToken, locator: IBrowserTargetLocator | undefined): Promise<IElementData | undefined>;
    startDebugSession(token: CancellationToken, locator: IBrowserTargetLocator): Promise<void>;
    startConsoleSession(token: CancellationToken, locator: IBrowserTargetLocator): Promise<void>;
    getConsoleLogs(locator: IBrowserTargetLocator): Promise<string | undefined>;
}
