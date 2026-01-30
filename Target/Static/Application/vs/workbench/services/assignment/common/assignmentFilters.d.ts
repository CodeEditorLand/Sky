import type { IExperimentationFilterProvider } from 'tas-client';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IChatEntitlementService } from '../../chat/common/chatEntitlementService.js';
export declare enum ExtensionsFilter {
    /**
     * Version of the github.copilot extension.
     */
    CopilotExtensionVersion = "X-Copilot-RelatedPluginVersion-githubcopilot",
    /**
     * Version of the github.copilot-chat extension.
     */
    CopilotChatExtensionVersion = "X-Copilot-RelatedPluginVersion-githubcopilotchat",
    /**
     * Version of the completions version.
     */
    CompletionsVersionInCopilotChat = "X-VSCode-CompletionsInChatExtensionVersion",
    /**
     * SKU of the copilot entitlement.
     */
    CopilotSku = "X-GitHub-Copilot-SKU",
    /**
     * The internal org of the user.
     */
    MicrosoftInternalOrg = "X-Microsoft-Internal-Org"
}
export declare class CopilotAssignmentFilterProvider extends Disposable implements IExperimentationFilterProvider {
    private readonly _extensionService;
    private readonly _logService;
    private readonly _storageService;
    private readonly _chatEntitlementService;
    private copilotChatExtensionVersion;
    private copilotExtensionVersion;
    private copilotCompletionsVersion;
    private copilotInternalOrg;
    private copilotSku;
    private readonly _onDidChangeFilters;
    readonly onDidChangeFilters: import("../../../../base/common/event.js").Event<void>;
    constructor(_extensionService: IExtensionService, _logService: ILogService, _storageService: IStorageService, _chatEntitlementService: IChatEntitlementService);
    private updateExtensionVersions;
    private updateCopilotEntitlementInfo;
    /**
     * Returns a version string that can be parsed by the TAS client.
     * The tas client cannot handle suffixes lke "-insider"
     * Ref: https://github.com/microsoft/tas-client/blob/30340d5e1da37c2789049fcf45928b954680606f/vscode-tas-client/src/vscode-tas-client/VSCodeFilterProvider.ts#L35
     *
     * @param version Version string to be trimmed.
    */
    private static trimVersionSuffix;
    getFilterValue(filter: string): string | null;
    getFilters(): Map<string, string | null>;
}
