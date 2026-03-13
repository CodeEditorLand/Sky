import { FlowLayout, FlowNode, FlowChartRenderResult } from './chatDebugFlowGraph.js';
/**
 * Lays out a list of flow nodes in a top-down vertical flow.
 * Parallel subagent invocations are arranged side by side.
 */
export declare function layoutFlowGraph(roots: FlowNode[], options?: {
    collapsedIds?: ReadonlySet<string>;
    expandedMergedIds?: ReadonlySet<string>;
}): FlowLayout;
export declare function renderFlowChartSVG(layout: FlowLayout): FlowChartRenderResult;
