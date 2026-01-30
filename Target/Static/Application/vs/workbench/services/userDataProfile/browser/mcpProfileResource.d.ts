import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, ProfileResourceType } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from '../../../common/views.js';
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from '../common/userDataProfile.js';
interface IMcpResourceContent {
    readonly mcp: string | null;
}
export declare class McpResourceInitializer implements IProfileResourceInitializer {
    private readonly userDataProfileService;
    private readonly fileService;
    private readonly logService;
    constructor(userDataProfileService: IUserDataProfileService, fileService: IFileService, logService: ILogService);
    initialize(content: string): Promise<void>;
}
export declare class McpProfileResource implements IProfileResource {
    private readonly fileService;
    private readonly logService;
    constructor(fileService: IFileService, logService: ILogService);
    getContent(profile: IUserDataProfile): Promise<string>;
    getMcpResourceContent(profile: IUserDataProfile): Promise<IMcpResourceContent>;
    apply(content: string, profile: IUserDataProfile): Promise<void>;
    private getMcpContent;
}
export declare class McpResourceTreeItem implements IProfileResourceTreeItem {
    private readonly profile;
    private readonly uriIdentityService;
    private readonly instantiationService;
    readonly type = ProfileResourceType.Mcp;
    readonly handle = ProfileResourceType.Mcp;
    readonly label: {
        label: string;
    };
    readonly collapsibleState = TreeItemCollapsibleState.Expanded;
    checkbox: ITreeItemCheckboxState | undefined;
    constructor(profile: IUserDataProfile, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    getChildren(): Promise<IProfileResourceChildTreeItem[]>;
    hasContent(): Promise<boolean>;
    getContent(): Promise<string>;
    isFromDefaultProfile(): boolean;
}
export {};
