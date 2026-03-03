import { type IMarkdownString } from '../../../../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../../../base/common/uri.js';
import { IUriIdentityService } from '../../../../../../../../platform/uriIdentity/common/uriIdentity.js';
import { IConfigurationService } from '../../../../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../../../../../platform/workspace/common/workspace.js';
export interface INpmScriptAutoApproveResult {
    isAutoApproved: boolean;
    scriptName?: string;
    autoApproveInfo?: IMarkdownString;
}
export declare class NpmScriptAutoApprover extends Disposable {
    private readonly _configurationService;
    private readonly _fileService;
    private readonly _uriIdentityService;
    private readonly _workspaceContextService;
    constructor(_configurationService: IConfigurationService, _fileService: IFileService, _uriIdentityService: IUriIdentityService, _workspaceContextService: IWorkspaceContextService);
    /**
     * Checks if a single command is an npm/yarn/pnpm script that exists in package.json.
     * Returns auto-approve result if the command is a valid script.
     */
    isCommandAutoApproved(command: string, cwd: URI | undefined): Promise<INpmScriptAutoApproveResult>;
    /**
     * Extracts script name from an npm/yarn/pnpm run command.
     */
    private _extractScriptName;
    /**
     * Checks if a URI is within any workspace folder.
     */
    private _isWithinWorkspace;
    /**
     * Finds and parses package.json to get the scripts section.
     * Only looks within the workspace for security.
     */
    private _getPackageJsonScripts;
    /**
     * Reads and parses the scripts section from a package.json file.
     */
    private _readPackageJsonScripts;
    /**
     * Parses the scripts section from package.json content using jsonc-parser.
     */
    private _parsePackageJsonScripts;
}
