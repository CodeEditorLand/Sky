import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { IMarkdownRendererService } from '../../../../platform/markdown/browser/markdownRenderer.js';
import { ContributionEnablementState } from '../common/enablement.js';
/**
 * A small reusable widget that renders an enablement status message inside
 * a `.status` container, matching the style used by the extension and MCP
 * server editors. The message is shown only when the contribution is
 * disabled and is rendered as markdown with a theme icon prefix.
 */
export declare class EnablementStatusWidget extends Disposable {
    private readonly _container;
    private readonly _labels;
    private readonly _markdownRendererService;
    private readonly _renderDisposables;
    constructor(_container: HTMLElement, enablement: IObservable<ContributionEnablementState>, _labels: {
        disabledProfile: string;
        disabledWorkspace: string;
    }, _markdownRendererService: IMarkdownRendererService);
    private _render;
}
/** Default labels for plugin enablement status. */
export declare const pluginEnablementLabels: {
    disabledProfile: string;
    disabledWorkspace: string;
};
/** Default labels for MCP server enablement status. */
export declare const mcpServerEnablementLabels: {
    disabledProfile: string;
    disabledWorkspace: string;
};
