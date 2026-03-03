import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IToastOptions, IToastResult } from './host.js';
export interface IShowToastController {
    onDidCreateToast: (toast: IDisposable) => void;
    onDidDisposeToast: (toast: IDisposable) => void;
}
export declare function showBrowserToast(controller: IShowToastController, options: IToastOptions, token: CancellationToken): Promise<IToastResult>;
