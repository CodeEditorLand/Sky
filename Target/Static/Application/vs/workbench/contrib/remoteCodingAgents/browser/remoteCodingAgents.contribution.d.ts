import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IRemoteCodingAgentsService } from '../common/remoteCodingAgentsService.js';
export declare class RemoteCodingAgentsContribution extends Disposable implements IWorkbenchContribution {
    private readonly remoteCodingAgentsService;
    constructor(remoteCodingAgentsService: IRemoteCodingAgentsService);
}
