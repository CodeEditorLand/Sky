/*---------------------------------------------------------------------------------------------
 * Cocoon Sky IPC Router 
 * --------------------------------------------------------------------------------------------
 * This module is responsible for handling IPC messages that originate from the Sky
 * frontend, are proxied through Mountain, and finally arrive in Cocoon via the
 * Vine IPC layer with specially formatted method names (e.g., "ipc:send:channelName",

 * "ipc:invoke:channelName").
 *
 * It listens for these messages and attempts to:
 *  - For "send" type messages: Emit them on an internal event bus (`skyToCocoonMessageBus`)
 *    so that shims or extensions in Cocoon providing `vscode.ipcRenderer.on()` can react.
 *  - For "invoke" type messages: Find a registered handler for the original channel and
 *    execute it, returning the result. (Handler registration for this is a TODO).
 *--------------------------------------------------------------------------------------------*/

import { EventEmitter } from "events";
// For logging
import type { ILogService } from "vs/platform/log/common/log";

// Assuming skyToCocoonMessageBus is exported
import { ipcApiInstance, skyToCocoonMessageBus } from "./cocoon-ipc";

// For invoke, we need a way to register and find handlers.
// This is a simplified placeholder. A real system might use a dedicated service.
const invokeHandlers = new Map<
	string,
	(...args: any[]) => Promise<any> | any
>();

let localLogService: ILogService | undefined;

const LOG_PREFIX = "[SkyIpcRouter]";

/**
 * Initializes the Sky IPC Router, connecting it to the main Vine IPC.
 * This should be called once during Cocoon's startup in index.ts.
 */
export function initializeSkyIpcRouter(logService?: ILogService): void {
	localLogService = logService;

	logService?.info(LOG_PREFIX, "Initializing Sky IPC Router...");

	// Listen for generic messages from Mountain on the Vine IPC layer
	ipcApiInstance.onMessageFromMountain((vineMessage) => {
		if (!vineMessage || !vineMessage.method) {
			return;
		}

		// Handle forwarded 'send' from Sky
		if (
			vineMessage.msg_type === 6 /* Notification */ &&
			vineMessage.method.startsWith("ipc:send:")
		) {
			const originalChannel = vineMessage.method.substring(
				"ipc:send:".length,
			);

			// Expected to be an array
			const originalArgument = vineMessage.Parameter;

			logService?.debug(
				LOG_PREFIX,

				`Received forwarded 'send' for original channel '${originalChannel}'. Argument:`,

				originalArgument,
			);

			// Construct a mock event object
			const mockIpcEvent = {
				sender: {
					id: "sky-forwarder",

					send: (channel: string, ...args: any[]) => {
						logService?.warn(
							LOG_PREFIX,

							`Mock event.sender.send called for channel '${channel}'. This is a NOP from Sky-forwarded event.`,
						);
					},
				},

				// If MessagePorts were supported
				// ports: [],
			};

			try {
				skyToCocoonMessageBus.emit(
					originalChannel,

					mockIpcEvent,

					...(Array.isArray(originalArgument)
						? originalArgument
						: [originalArgument]),
				);
			} catch (error) {
				logService?.error(
					LOG_PREFIX,

					`Error emitting forwarded 'send' on skyToCocoonMessageBus for channel '${originalChannel}':`,

					error,
				);
			}
		}

		// Handle forwarded 'invoke' from Sky
		else if (
			vineMessage.msg_type === 1 /* Request */ &&
			vineMessage.method.startsWith("ipc:invoke:")
		) {
			const originalChannel = vineMessage.method.substring(
				"ipc:invoke:".length,
			);

			// Expected to be an array
			const originalArgument = vineMessage.Parameter;

			const requestIdFromMountain = vineMessage.id!;

			logService?.debug(
				LOG_PREFIX,

				`Received forwarded 'invoke' for channel '${originalChannel}' (MountainReqID: ${requestIdFromMountain}). Argument:`,

				originalArgument,
			);

			const handler = invokeHandlers.get(originalChannel);

			if (handler) {
				Promise.resolve(
					handler(
						...(Array.isArray(originalArgument)
							? originalArgument
							: [originalArgument]),
					),
				)
					.then((result) => {
						ipcApiInstance.sendResponseToMountain(
							requestIdFromMountain,

							result,

							null,
						);
					})
					.catch((err) => {
						logService?.error(
							LOG_PREFIX,

							`Error executing invoke handler for '${originalChannel}':`,

							err,
						);

						const errorForMountain =
							err instanceof Error
								? {
										message: err.message,

										name: err.name,

										stack: err.stack,
									}
								: { message: String(err) };

						ipcApiInstance.sendResponseToMountain(
							requestIdFromMountain,

							null,

							errorForMountain,
						);
					});
			} else {
				const errorMsg = `No handler registered in Cocoon for invoke channel: '${originalChannel}' (forwarded from Sky).`;

				logService?.error(LOG_PREFIX, errorMsg);

				ipcApiInstance.sendResponseToMountain(
					requestIdFromMountain,

					null,

					{ message: errorMsg, name: "NoInvokeHandlerError" },
				);
			}
		}
	});

	logService?.info(
		LOG_PREFIX,

		"Sky IPC Router initialized and listening for forwarded messages.",
	);
}

/**
 * (For internal Cocoon use or extensions if an API is provided)
 * Registers a handler for an 'invoke' channel that can be called from Sky.
 * @param channel The channel name.
 * @param handler The asynchronous handler function.
 */
export function registerSkyInvokeHandler(
	channel: string,

	handler: (...args: any[]) => Promise<any> | any,
): void {
	if (invokeHandlers.has(channel)) {
		localLogService?.warn(
			LOG_PREFIX,

			`Overwriting existing invoke handler for channel '${channel}'.`,
		);
	}

	invokeHandlers.set(channel, handler);

	localLogService?.debug(
		LOG_PREFIX,

		`Registered invoke handler for Sky-forwarded channel '${channel}'.`,
	);
}

/**
 * (For internal Cocoon use or extensions if an API is provided)
 * Unregisters an 'invoke' handler.
 * @param channel The channel name.
 */
export function unregisterSkyInvokeHandler(channel: string): void {
	if (invokeHandlers.delete(channel)) {
		localLogService?.debug(
			LOG_PREFIX,

			`Unregistered invoke handler for Sky-forwarded channel '${channel}'.`,
		);
	}
}
