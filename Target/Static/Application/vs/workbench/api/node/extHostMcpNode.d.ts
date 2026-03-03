import { URI } from '../../../base/common/uri.js';
import { McpServerLaunch } from '../../contrib/mcp/common/mcpTypes.js';
import { ExtHostMcpService } from '../common/extHostMcp.js';
export declare class NodeExtHostMpcService extends ExtHostMcpService {
    private nodeServers;
    protected _startMcp(id: number, launch: McpServerLaunch, defaultCwd?: URI, errorOnUserInteraction?: boolean): void;
    $stopMcp(id: number): void;
    $sendMessage(id: number, message: string): void;
    private startNodeMpc;
}
/**
 * Formats arguments to avoid issues on Windows for CVE-2024-27980.
 */
export declare const formatSubprocessArguments: (executable: string, args: ReadonlyArray<string>, cwd: string | undefined, env: Record<string, string | undefined>) => Promise<{
    executable: string;
    args: readonly string[];
    shell: boolean;
}>;
