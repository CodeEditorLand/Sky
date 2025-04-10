/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/* eslint-disable local/code-no-native-private */
import { validateConstraint } from '../../../base/common/types.js';
import * as extHostTypes from './extHostTypes.js';
import * as extHostTypeConverter from './extHostTypeConverters.js';
import { cloneAndChange } from '../../../base/common/objects.js';
import { MainContext } from './extHost.protocol.js';
import { isNonEmptyArray } from '../../../base/common/arrays.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { revive } from '../../../base/common/marshalling.js';
import { Range } from '../../../editor/common/core/range.js';
import { Position } from '../../../editor/common/core/position.js';
import { URI } from '../../../base/common/uri.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { TestItemImpl } from './extHostTestItem.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
import { toErrorMessage } from '../../../base/common/errorMessage.js';
import { StopWatch } from '../../../base/common/stopwatch.js';
import { TelemetryTrustedValue } from '../../../platform/telemetry/common/telemetryUtils.js';
import { IExtHostTelemetry } from './extHostTelemetry.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { isCancellationError } from '../../../base/common/errors.js';
let ExtHostCommands = class ExtHostCommands {
    #proxy;
    #telemetry;
    #extHostTelemetry;
    constructor(extHostRpc, logService, extHostTelemetry) {
        this._commands = new Map();
        this._apiCommands = new Map();
        this.#proxy = extHostRpc.getProxy(MainContext.MainThreadCommands);
        this._logService = logService;
        this.#extHostTelemetry = extHostTelemetry;
        this.#telemetry = extHostRpc.getProxy(MainContext.MainThreadTelemetry);
        this.converter = new CommandsConverter(this, id => {
            // API commands that have no return type (void) can be
            // converted to their internal command and don't need
            // any indirection commands
            const candidate = this._apiCommands.get(id);
            return candidate?.result === ApiCommandResult.Void
                ? candidate : undefined;
        }, logService);
        this._argumentProcessors = [
            {
                processArgument(a) {
                    // URI, Regex
                    return revive(a);
                }
            },
            {
                processArgument(arg) {
                    return cloneAndChange(arg, function (obj) {
                        // Reverse of https://github.com/microsoft/vscode/blob/1f28c5fc681f4c01226460b6d1c7e91b8acb4a5b/src/vs/workbench/api/node/extHostCommands.ts#L112-L127
                        if (Range.isIRange(obj)) {
                            return extHostTypeConverter.Range.to(obj);
                        }
                        if (Position.isIPosition(obj)) {
                            return extHostTypeConverter.Position.to(obj);
                        }
                        if (Range.isIRange(obj.range) && URI.isUri(obj.uri)) {
                            return extHostTypeConverter.location.to(obj);
                        }
                        if (obj instanceof VSBuffer) {
                            return obj.buffer.buffer;
                        }
                        if (!Array.isArray(obj)) {
                            return obj;
                        }
                    });
                }
            }
        ];
    }
    registerArgumentProcessor(processor) {
        this._argumentProcessors.push(processor);
    }
    registerApiCommand(apiCommand) {
        const registration = this.registerCommand(false, apiCommand.id, async (...apiArgs) => {
            const internalArgs = apiCommand.args.map((arg, i) => {
                if (!arg.validate(apiArgs[i])) {
                    throw new Error(`Invalid argument '${arg.name}' when running '${apiCommand.id}', received: ${typeof apiArgs[i] === 'object' ? JSON.stringify(apiArgs[i], null, '\t') : apiArgs[i]} `);
                }
                return arg.convert(apiArgs[i]);
            });
            const internalResult = await this.executeCommand(apiCommand.internalId, ...internalArgs);
            return apiCommand.result.convert(internalResult, apiArgs, this.converter);
        }, undefined, {
            description: apiCommand.description,
            args: apiCommand.args,
            returns: apiCommand.result.description
        });
        this._apiCommands.set(apiCommand.id, apiCommand);
        return new extHostTypes.Disposable(() => {
            registration.dispose();
            this._apiCommands.delete(apiCommand.id);
        });
    }
    registerCommand(global, id, callback, thisArg, metadata, extension) {
        this._logService.trace('ExtHostCommands#registerCommand', id);
        if (!id.trim().length) {
            throw new Error('invalid id');
        }
        if (this._commands.has(id)) {
            throw new Error(`command '${id}' already exists`);
        }
        this._commands.set(id, { callback, thisArg, metadata, extension });
        if (global) {
            this.#proxy.$registerCommand(id);
        }
        return new extHostTypes.Disposable(() => {
            if (this._commands.delete(id)) {
                if (global) {
                    this.#proxy.$unregisterCommand(id);
                }
            }
        });
    }
    executeCommand(id, ...args) {
        this._logService.trace('ExtHostCommands#executeCommand', id);
        return this._doExecuteCommand(id, args, true);
    }
    async _doExecuteCommand(id, args, retry) {
        if (this._commands.has(id)) {
            // - We stay inside the extension host and support
            // 	 to pass any kind of parameters around.
            // - We still emit the corresponding activation event
            //   BUT we don't await that event
            this.#proxy.$fireCommandActivationEvent(id);
            return this._executeContributedCommand(id, args, false);
        }
        else {
            // automagically convert some argument types
            let hasBuffers = false;
            const toArgs = cloneAndChange(args, function (value) {
                if (value instanceof extHostTypes.Position) {
                    return extHostTypeConverter.Position.from(value);
                }
                else if (value instanceof extHostTypes.Range) {
                    return extHostTypeConverter.Range.from(value);
                }
                else if (value instanceof extHostTypes.Location) {
                    return extHostTypeConverter.location.from(value);
                }
                else if (extHostTypes.NotebookRange.isNotebookRange(value)) {
                    return extHostTypeConverter.NotebookRange.from(value);
                }
                else if (value instanceof ArrayBuffer) {
                    hasBuffers = true;
                    return VSBuffer.wrap(new Uint8Array(value));
                }
                else if (value instanceof Uint8Array) {
                    hasBuffers = true;
                    return VSBuffer.wrap(value);
                }
                else if (value instanceof VSBuffer) {
                    hasBuffers = true;
                    return value;
                }
                if (!Array.isArray(value)) {
                    return value;
                }
            });
            try {
                const result = await this.#proxy.$executeCommand(id, hasBuffers ? new SerializableObjectWithBuffers(toArgs) : toArgs, retry);
                return revive(result);
            }
            catch (e) {
                // Rerun the command when it wasn't known, had arguments, and when retry
                // is enabled. We do this because the command might be registered inside
                // the extension host now and can therefore accept the arguments as-is.
                if (e instanceof Error && e.message === '$executeCommand:retry') {
                    return this._doExecuteCommand(id, args, false);
                }
                else {
                    throw e;
                }
            }
        }
    }
    async _executeContributedCommand(id, args, annotateError) {
        const command = this._commands.get(id);
        if (!command) {
            throw new Error('Unknown command');
        }
        const { callback, thisArg, metadata } = command;
        if (metadata?.args) {
            for (let i = 0; i < metadata.args.length; i++) {
                try {
                    validateConstraint(args[i], metadata.args[i].constraint);
                }
                catch (err) {
                    throw new Error(`Running the contributed command: '${id}' failed. Illegal argument '${metadata.args[i].name}' - ${metadata.args[i].description}`);
                }
            }
        }
        const stopWatch = StopWatch.create();
        try {
            return await callback.apply(thisArg, args);
        }
        catch (err) {
            // The indirection-command from the converter can fail when invoking the actual
            // command and in that case it is better to blame the correct command
            if (id === this.converter.delegatingCommandId) {
                const actual = this.converter.getActualCommand(...args);
                if (actual) {
                    id = actual.command;
                }
            }
            if (!isCancellationError(err)) {
                this._logService.error(err, id, command.extension?.identifier);
            }
            if (!annotateError) {
                throw err;
            }
            if (command.extension?.identifier) {
                const reported = this.#extHostTelemetry.onExtensionError(command.extension.identifier, err);
                this._logService.trace('forwarded error to extension?', reported, command.extension?.identifier);
            }
            throw new class CommandError extends Error {
                constructor() {
                    super(toErrorMessage(err));
                    this.id = id;
                    this.source = command.extension?.displayName ?? command.extension?.name;
                }
            };
        }
        finally {
            this._reportTelemetry(command, id, stopWatch.elapsed());
        }
    }
    _reportTelemetry(command, id, duration) {
        if (!command.extension) {
            return;
        }
        this.#telemetry.$publicLog2('Extension:ActionExecuted', {
            extensionId: command.extension.identifier.value,
            id: new TelemetryTrustedValue(id),
            duration: duration,
        });
    }
    $executeContributedCommand(id, ...args) {
        this._logService.trace('ExtHostCommands#$executeContributedCommand', id);
        const cmdHandler = this._commands.get(id);
        if (!cmdHandler) {
            return Promise.reject(new Error(`Contributed command '${id}' does not exist.`));
        }
        else {
            args = args.map(arg => this._argumentProcessors.reduce((r, p) => p.processArgument(r, cmdHandler.extension), arg));
            return this._executeContributedCommand(id, args, true);
        }
    }
    getCommands(filterUnderscoreCommands = false) {
        this._logService.trace('ExtHostCommands#getCommands', filterUnderscoreCommands);
        return this.#proxy.$getCommands().then(result => {
            if (filterUnderscoreCommands) {
                result = result.filter(command => command[0] !== '_');
            }
            return result;
        });
    }
    $getContributedCommandMetadata() {
        const result = Object.create(null);
        for (const [id, command] of this._commands) {
            const { metadata } = command;
            if (metadata) {
                result[id] = metadata;
            }
        }
        return Promise.resolve(result);
    }
};
ExtHostCommands = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, ILogService),
    __param(2, IExtHostTelemetry)
], ExtHostCommands);
export { ExtHostCommands };
export const IExtHostCommands = createDecorator('IExtHostCommands');
export class CommandsConverter {
    // --- conversion between internal and api commands
    constructor(_commands, _lookupApiCommand, _logService) {
        this._commands = _commands;
        this._lookupApiCommand = _lookupApiCommand;
        this._logService = _logService;
        this.delegatingCommandId = `__vsc${generateUuid()}`;
        this._cache = new Map();
        this._cachIdPool = 0;
        this._commands.registerCommand(true, this.delegatingCommandId, this._executeConvertedCommand, this);
    }
    toInternal(command, disposables) {
        if (!command) {
            return undefined;
        }
        const result = {
            $ident: undefined,
            id: command.command,
            title: command.title,
            tooltip: command.tooltip
        };
        if (!command.command) {
            // falsy command id -> return converted command but don't attempt any
            // argument or API-command dance since this command won't run anyways
            return result;
        }
        const apiCommand = this._lookupApiCommand(command.command);
        if (apiCommand) {
            // API command with return-value can be converted inplace
            result.id = apiCommand.internalId;
            result.arguments = apiCommand.args.map((arg, i) => arg.convert(command.arguments && command.arguments[i]));
        }
        else if (isNonEmptyArray(command.arguments)) {
            // we have a contributed command with arguments. that
            // means we don't want to send the arguments around
            const id = `${command.command} /${++this._cachIdPool}`;
            this._cache.set(id, command);
            disposables.add(toDisposable(() => {
                this._cache.delete(id);
                this._logService.trace('CommandsConverter#DISPOSE', id);
            }));
            result.$ident = id;
            result.id = this.delegatingCommandId;
            result.arguments = [id];
            this._logService.trace('CommandsConverter#CREATE', command.command, id);
        }
        return result;
    }
    fromInternal(command) {
        if (typeof command.$ident === 'string') {
            return this._cache.get(command.$ident);
        }
        else {
            return {
                command: command.id,
                title: command.title,
                arguments: command.arguments
            };
        }
    }
    getActualCommand(...args) {
        return this._cache.get(args[0]);
    }
    _executeConvertedCommand(...args) {
        const actualCmd = this.getActualCommand(...args);
        this._logService.trace('CommandsConverter#EXECUTE', args[0], actualCmd ? actualCmd.command : 'MISSING');
        if (!actualCmd) {
            return Promise.reject(`Actual command not found, wanted to execute ${args[0]}`);
        }
        return this._commands.executeCommand(actualCmd.command, ...(actualCmd.arguments || []));
    }
}
export class ApiCommandArgument {
    static { this.Uri = new ApiCommandArgument('uri', 'Uri of a text document', v => URI.isUri(v), v => v); }
    static { this.Position = new ApiCommandArgument('position', 'A position in a text document', v => extHostTypes.Position.isPosition(v), extHostTypeConverter.Position.from); }
    static { this.Range = new ApiCommandArgument('range', 'A range in a text document', v => extHostTypes.Range.isRange(v), extHostTypeConverter.Range.from); }
    static { this.Selection = new ApiCommandArgument('selection', 'A selection in a text document', v => extHostTypes.Selection.isSelection(v), extHostTypeConverter.Selection.from); }
    static { this.Number = new ApiCommandArgument('number', '', v => typeof v === 'number', v => v); }
    static { this.String = new ApiCommandArgument('string', '', v => typeof v === 'string', v => v); }
    static Arr(element) {
        return new ApiCommandArgument(`${element.name}_array`, `Array of ${element.name}, ${element.description}`, (v) => Array.isArray(v) && v.every(e => element.validate(e)), (v) => v.map(e => element.convert(e)));
    }
    static { this.CallHierarchyItem = new ApiCommandArgument('item', 'A call hierarchy item', v => v instanceof extHostTypes.CallHierarchyItem, extHostTypeConverter.CallHierarchyItem.from); }
    static { this.TypeHierarchyItem = new ApiCommandArgument('item', 'A type hierarchy item', v => v instanceof extHostTypes.TypeHierarchyItem, extHostTypeConverter.TypeHierarchyItem.from); }
    static { this.TestItem = new ApiCommandArgument('testItem', 'A VS Code TestItem', v => v instanceof TestItemImpl, extHostTypeConverter.TestItem.from); }
    static { this.TestProfile = new ApiCommandArgument('testProfile', 'A VS Code test profile', v => v instanceof extHostTypes.TestRunProfileBase, extHostTypeConverter.TestRunProfile.from); }
    constructor(name, description, validate, convert) {
        this.name = name;
        this.description = description;
        this.validate = validate;
        this.convert = convert;
    }
    optional() {
        return new ApiCommandArgument(this.name, `(optional) ${this.description}`, value => value === undefined || value === null || this.validate(value), value => value === undefined ? undefined : value === null ? null : this.convert(value));
    }
    with(name, description) {
        return new ApiCommandArgument(name ?? this.name, description ?? this.description, this.validate, this.convert);
    }
}
export class ApiCommandResult {
    static { this.Void = new ApiCommandResult('no result', v => v); }
    constructor(description, convert) {
        this.description = description;
        this.convert = convert;
    }
}
export class ApiCommand {
    constructor(id, internalId, description, args, result) {
        this.id = id;
        this.internalId = internalId;
        this.description = description;
        this.args = args;
        this.result = result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vRDovRGV2ZWxvcGVyL0FwcGxpY2F0aW9uL0NvZGVFZGl0b3JMYW5kL0xhbmQvRGVwZW5kZW5jeS9NaWNyb3NvZnQvRGVwZW5kZW5jeS9FZGl0b3Ivc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdENvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLGlEQUFpRDtBQUVqRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUVuRSxPQUFPLEtBQUssWUFBWSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sS0FBSyxvQkFBb0IsTUFBTSw0QkFBNEIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDakUsT0FBTyxFQUFFLFdBQVcsRUFBNkcsTUFBTSx1QkFBdUIsQ0FBQztBQUMvSixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFHakUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RCxPQUFPLEVBQVUsS0FBSyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDckUsT0FBTyxFQUFhLFFBQVEsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNsRCxPQUFPLEVBQW1CLFlBQVksRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUMxRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUU1RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0s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