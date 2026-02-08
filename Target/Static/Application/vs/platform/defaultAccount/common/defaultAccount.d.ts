import { Event } from '../../../base/common/event.js';
import { IDefaultAccount, IDefaultAccountAuthenticationProvider, IPolicyData } from '../../../base/common/defaultAccount.js';
export interface IDefaultAccountProvider {
    readonly defaultAccount: IDefaultAccount | null;
    readonly onDidChangeDefaultAccount: Event<IDefaultAccount | null>;
    readonly policyData: IPolicyData | null;
    readonly onDidChangePolicyData: Event<IPolicyData | null>;
    getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider;
    refresh(): Promise<IDefaultAccount | null>;
    signIn(options?: {
        additionalScopes?: readonly string[];
        [key: string]: unknown;
    }): Promise<IDefaultAccount | null>;
}
export declare const IDefaultAccountService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDefaultAccountService>;
export interface IDefaultAccountService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeDefaultAccount: Event<IDefaultAccount | null>;
    readonly onDidChangePolicyData: Event<IPolicyData | null>;
    readonly policyData: IPolicyData | null;
    getDefaultAccount(): Promise<IDefaultAccount | null>;
    getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider;
    setDefaultAccountProvider(provider: IDefaultAccountProvider): void;
    refresh(): Promise<IDefaultAccount | null>;
    signIn(options?: {
        additionalScopes?: readonly string[];
        [key: string]: unknown;
    }): Promise<IDefaultAccount | null>;
}
