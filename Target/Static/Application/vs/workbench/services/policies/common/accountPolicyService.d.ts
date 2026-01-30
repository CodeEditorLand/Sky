import { IStringDictionary } from '../../../../base/common/collections.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractPolicyService, IPolicyService, PolicyDefinition } from '../../../../platform/policy/common/policy.js';
import { IDefaultAccountService } from '../../../../platform/defaultAccount/common/defaultAccount.js';
export declare class AccountPolicyService extends AbstractPolicyService implements IPolicyService {
    private readonly logService;
    private readonly defaultAccountService;
    private account;
    constructor(logService: ILogService, defaultAccountService: IDefaultAccountService);
    protected _updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<void>;
}
