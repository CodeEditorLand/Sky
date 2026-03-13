import { IMarkdownString } from '../../../../../../../base/common/htmlContent.js';
import { ConfirmedReason, IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
/**
 * Creates a markdown message explaining why a tool was auto-approved.
 * @param toolInvocation The tool invocation to get the approval message for
 * @returns A markdown string with the approval message, or undefined if no message should be shown
 */
export declare function getToolApprovalMessage(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized): IMarkdownString | undefined;
/**
 * Creates a markdown message from a ConfirmedReason explaining why a tool was auto-approved.
 * @param reason The confirmation reason
 * @returns A markdown string with the approval message, or undefined if no message should be shown
 */
export declare function getApprovalMessageFromReason(reason: ConfirmedReason): IMarkdownString | undefined;
