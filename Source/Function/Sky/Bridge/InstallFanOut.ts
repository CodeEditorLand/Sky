/**
 * Generic fan-out installer for the long tail of `sky://*` channels
 * that all map to a `cel:<prefix>:<action>` DOM CustomEvent.
 * Channels come from Wind's `SkyEvent` table - the single source of
 * truth that mirrors Mountain's Rust enum, so a renamed variant
 * either compiles or breaks type-check, never silently fails at
 * runtime.
 *
 * Each arm wraps dispatch + the optional `cel-dispatch` consumer-
 * presence log in defensive `try/catch` so one bad payload doesn't
 * silence the rest of the fan-out (same philosophy as VS Code's
 * per-listener `safeStringify` / Emitter try/catch).
 */
type Handler = (Payload: any) => void;

type Tracking = {

	HasConsumer: (DomEvent: string) => boolean;

	Log: (DomEvent: string, HasConsumer: boolean) => void;
};

const ChannelToDomEvent = (Channel: string): string =>
	Channel.replace(/^sky:\/\//, "cel:").replace(/\//g, ":");

export default async (Dependencies: {
	Register: (Channel: string, Handler: Handler) => Promise<void>;

	Channels: readonly string[];

	Tracking: Tracking;
}): Promise<void> => {
	const { Register, Channels, Tracking } = Dependencies;

	for (const Channel of Channels) {
		await Register(Channel, (Payload: any) => {
			let DomEvent = "";

			try {
				DomEvent = ChannelToDomEvent(Channel);

				document.dispatchEvent(
					new CustomEvent(DomEvent, { detail: Payload }),
				);
			} catch (DispatchError) {
				try {
					invoke("MountainIPCInvoke", {
						method: "diagnostic:log",
						params: [
							"sky-bridge",
							"[SkyBridge] FanOut dispatch failed for ${Channel}:",
						],
					}).catch(() => {});
				} catch {
					/* swallow - console may be replaced */
				}

				return;
			}

			try {
				Tracking.Log(DomEvent, Tracking.HasConsumer(DomEvent));
			} catch {
				/* dispatch-log failure must not propagate; the event
				 * itself already fired above */
			}
		});
	}
};
