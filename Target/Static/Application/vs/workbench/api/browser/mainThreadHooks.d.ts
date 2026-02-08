import { UriComponents } from '../../../base/common/uri.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadHooksShape } from '../common/extHost.protocol.js';
import { IHookResult, IHooksExecutionService } from '../../contrib/chat/common/hooksExecutionService.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
export declare class MainThreadHooks extends Disposable implements MainThreadHooksShape {
    private readonly _hooksExecutionService;
    constructor(extHostContext: IExtHostContext, _hooksExecutionService: IHooksExecutionService);
    $executeHook(hookType: string, sessionResource: UriComponents, input: unknown, token: CancellationToken): Promise<IHookResult[]>;
}
