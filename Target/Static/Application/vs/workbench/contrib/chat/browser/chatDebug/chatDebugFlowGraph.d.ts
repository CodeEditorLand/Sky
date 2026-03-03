import { IChatDebugEvent } from '../../common/chatDebugService.js';
export interface FlowNode {
    readonly id: string;
    readonly kind: IChatDebugEvent['kind'];
    /** For `generic` nodes: the event category (e.g. `'discovery'`). Used to narrow filtering. */
    readonly category?: string;
    readonly label: string;
    readonly sublabel?: string;
    readonly description?: string;
    readonly tooltip?: string;
    readonly isError?: boolean;
    readonly created: number;
    readonly children: FlowNode[];
    /** Present on merged discovery nodes: the individual nodes that were merged. */
    readonly mergedNodes?: FlowNode[];
}
export interface FlowFilterOptions {
    readonly isKindVisible: (kind: string, category?: string) => boolean;
    readonly textFilter: string;
}
export interface LayoutNode {
    readonly id: string;
    readonly kind: IChatDebugEvent['kind'];
    readonly label: string;
    readonly sublabel?: string;
    readonly tooltip?: string;
    readonly isError?: boolean;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    /** Number of individual nodes merged into this one (for discovery merging). */
    readonly mergedCount?: number;
    /** Whether the merged node is currently expanded (individual nodes shown to the right). */
    readonly isMergedExpanded?: boolean;
}
export interface LayoutEdge {
    readonly fromId?: string;
    readonly toId?: string;
    readonly fromX: number;
    readonly fromY: number;
    readonly toX: number;
    readonly toY: number;
}
export interface SubgraphRect {
    readonly label: string;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly depth: number;
    readonly nodeId: string;
    readonly collapsedChildCount?: number;
}
export interface FlowLayout {
    readonly nodes: LayoutNode[];
    readonly edges: LayoutEdge[];
    readonly subgraphs: SubgraphRect[];
    readonly width: number;
    readonly height: number;
}
export interface FlowChartRenderResult {
    readonly svg: SVGElement;
    /** Map from node/subgraph ID to its focusable SVG element. */
    readonly focusableElements: Map<string, SVGElement>;
    /** Adjacency lists derived from graph edges: successors and predecessors per node ID. */
    readonly adjacency: Map<string, {
        next: string[];
        prev: string[];
    }>;
    /** Map from node/subgraph ID to its layout position. */
    readonly positions: Map<string, {
        x: number;
        y: number;
    }>;
}
export declare function buildFlowGraph(events: readonly IChatDebugEvent[]): FlowNode[];
/**
 * Filters a flow node tree by kind visibility and text search.
 * Returns a new tree — the input is not mutated.
 *
 * Kind filtering: nodes whose kind is not visible are removed.
 * For `subagentInvocation` nodes, the entire subgraph is removed.
 * For other kinds, the node is removed and its children are re-parented.
 *
 * Text filtering: only nodes whose label, sublabel, or tooltip match the
 * search term are kept, along with all their ancestors (path to root).
 * If a subagent label matches, its entire subgraph is kept.
 */
export declare function filterFlowNodes(nodes: FlowNode[], options: FlowFilterOptions): FlowNode[];
export interface FlowSliceResult {
    readonly nodes: FlowNode[];
    readonly totalCount: number;
    readonly shownCount: number;
}
/**
 * Slices a flow node tree to at most `maxCount` nodes (pre-order DFS).
 *
 * When a subagent's children would exceed the remaining budget, the
 * children list is truncated. Returns the sliced tree along with total
 * and shown node counts for the "Show More" UI.
 */
export declare function sliceFlowNodes(nodes: readonly FlowNode[], maxCount: number): FlowSliceResult;
/**
 * Merges consecutive prompt-discovery nodes (generic events with
 * `category === 'discovery'`) into a single summary node.
 *
 * The merged node always stays in the graph and carries the individual
 * nodes in `mergedNodes`.  Expansion (showing the individual nodes to the
 * right) is handled at the layout level.
 *
 * Operates recursively on children.
 */
export declare function mergeDiscoveryNodes(nodes: readonly FlowNode[]): FlowNode[];
/**
 * Merges consecutive tool-call nodes that invoke the same tool into a
 * single summary node.
 *
 * This mirrors `mergeDiscoveryNodes`: the merged node carries the
 * individual nodes in `mergedNodes` and expansion is handled at the
 * layout level.
 *
 * Operates recursively on children.
 */
export declare function mergeToolCallNodes(nodes: readonly FlowNode[]): FlowNode[];
