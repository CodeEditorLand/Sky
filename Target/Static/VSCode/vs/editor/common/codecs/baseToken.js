/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { pick } from '../../../base/common/arrays.js';
import { assert } from '../../../base/common/assert.js';
import { Range } from '../../../editor/common/core/range.js';
/**
 * Base class for all tokens with a `range` that
 * reflects token position in the original data.
 */
export class BaseToken {
    constructor(_range) {
        this._range = _range;
    }
    get range() {
        return this._range;
    }
    /**
     * Check if this token has the same range as another one.
     */
    sameRange(other) {
        return this.range.equalsRange(other);
    }
    /**
     * Check if this token is equal to another one.
     */
    equals(other) {
        if (!(other instanceof this.constructor)) {
            return false;
        }
        return this.sameRange(other.range);
    }
    /**
     * Change `range` of the token with provided range components.
     */
    withRange(components) {
        this._range = new Range(components.startLineNumber ?? this.range.startLineNumber, components.startColumn ?? this.range.startColumn, components.endLineNumber ?? this.range.endLineNumber, components.endColumn ?? this.range.endColumn);
        return this;
    }
    /**
     * Render a list of tokens into a string.
     */
    static render(tokens) {
        return tokens.map(pick('text')).join('');
    }
    /**
     * Returns the full range of a list of tokens in which the first token is
     * used as the start of a tokens sequence and the last token reflects the end.
     *
     * @throws if:
     * 	- provided {@link tokens} list is empty
     *  - the first token start number is greater than the start line of the last token
     *  - if the first and last token are on the same line, the first token start column must
     * 	  be smaller than the start column of the last token
     */
    static fullRange(tokens) {
        assert(tokens.length > 0, 'Cannot get full range for an empty list of tokens.');
        const firstToken = tokens[0];
        const lastToken = tokens[tokens.length - 1];
        // sanity checks for the full range we would construct
        assert(firstToken.range.startLineNumber <= lastToken.range.startLineNumber, 'First token must start on previous or the same line as the last token.');
        if ((firstToken !== lastToken) && (firstToken.range.startLineNumber === lastToken.range.startLineNumber)) {
            assert(firstToken.range.endColumn <= lastToken.range.startColumn, [
                'First token must end at least on previous or the same column as the last token.',
                `First token: ${firstToken}; Last token: ${lastToken}.`,
            ].join('\n'));
        }
        return new Range(firstToken.range.startLineNumber, firstToken.range.startColumn, lastToken.range.endLineNumber, lastToken.range.endColumn);
    }
    /**
     * Shorten version of the {@link text} property.
     */
    shortText(maxLength = 32) {
        if (this.text.length <= maxLength) {
            return this.text;
        }
        return `${this.text.slice(0, maxLength - 1)}...`;
    }
}
/**
 * Tokens that represent a sequence of tokens that does not
 * hold an additional meaning in the text.
 */
export class Text extends BaseToken {
    get text() {
        return BaseToken.render(this.tokens);
    }
    constructor(range, tokens) {
        super(range);
        this.tokens = tokens;
    }
    /**
     * Create new instance of the token from a provided list of tokens.
     *
     * @throws if the provided tokens list is empty because this function
     *         automatically infers the range of the resulting token based
     *         on the first and last token in the list.
     */
    static fromTokens(tokens) {
        assert(tokens.length > 0, 'Cannot infer range from an empty list of tokens.');
        const range = BaseToken.fullRange(tokens);
        return new Text(range, tokens);
    }
    toString() {
        return `text(${this.shortText()})${this.range}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZVRva2VuLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vRDovRGV2ZWxvcGVyL0FwcGxpY2F0aW9uL0NvZGVFZGl0b3JMYW5kL0xhbmQvRGVwZW5kZW5jeS9NaWNyb3NvZnQvRGVwZW5kZW5jeS9FZGl0b3Ivc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb2RlY3MvYmFzZVRva2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN0RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDeEQsT0FBTyxFQUFVLEtBQUssRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRXJFOzs7R0FHRztBQUNILE1BQU0sT0FBZ0IsU0FBUztJQUM5QixZQUNTLE1BQWE7UUFBYixXQUFNLEdBQU4sTUFBTSxDQUFPO0lBQ2xCLENBQUM7SUFFTCxJQUFXLEtBQUs7UUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDcEIsQ0FBQztJQU9EOztPQUVHO0lBQ0ksU0FBUyxDQUFDLEtBQVk7UUFDNUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBT0Q7O09BRUc7SUFDSSxNQUFNLENBQXNCLEtBQVE7UUFDMUMsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQzFDLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksU0FBUyxDQUFDLFVBQTJCO1FBQzNDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQ3RCLFVBQVUsQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLEtB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