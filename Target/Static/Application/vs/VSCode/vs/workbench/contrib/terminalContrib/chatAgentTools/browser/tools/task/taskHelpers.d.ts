import { URI } from '../../../../../../../base/common/uri.js';
import { Location } from '../../../../../../../editor/common/languages.js';
import { Range } from '../../../../../../../editor/common/core/range.js';
import { ITaskSummary } from '../../../../../tasks/common/taskService.js';
import { OutputMonitorState } from '../monitoring/types.js';
import { MarkdownString } from '../../../../../../../base/common/htmlContent.js';
export declare function toolResultDetailsFromResponse(terminalResults: {
    output: string;
    resources?: ILinkLocation[];
}[]): (URI | Location)[];
export declare function toolResultMessageFromResponse(result: ITaskSummary | undefined, taskLabel: string, toolResultDetails: (URI | Location)[], terminalResults: {
    output: string;
    resources?: ILinkLocation[];
    state: OutputMonitorState;
}[], getOutputTool?: boolean, isBackground?: boolean): MarkdownString;
export interface ILinkLocation {
    uri: URI;
    range?: Range;
}
