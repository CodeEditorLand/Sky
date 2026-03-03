import { Disposable } from '../../../base/common/lifecycle.js';
import { type MainThreadTerminalShellIntegrationShape } from '../common/extHost.protocol.js';
import { ITerminalService } from '../../contrib/terminal/browser/terminal.js';
import { IWorkbenchEnvironmentService } from '../../services/environment/common/environmentService.js';
import { type IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
export declare class MainThreadTerminalShellIntegration extends Disposable implements MainThreadTerminalShellIntegrationShape {
    private readonly _terminalService;
    private readonly _extensionService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _terminalService: ITerminalService, workbenchEnvironmentService: IWorkbenchEnvironmentService, _extensionService: IExtensionService);
    $executeCommand(terminalId: number, commandLine: string): void;
    private _enableShellIntegration;
}
