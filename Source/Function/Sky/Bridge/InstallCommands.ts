/**
 * Command bridge: routes the three `sky://command/{execute,register,
 * unregister}` channels into the workbench's `ICommandService`
 * (execute) and `CommandsRegistry` (register/unregister).
 *
 * Register accepts either a single command object `{ id, commandId,
 * kind }` (legacy runtime path) or a batch `{ commands: [...] }` (the
 * extension-boot path - 100+ extensions each register ~10 commands;
 * the per-command emit was saturating Tauri's shared WKWebView IPC
 * channel and keystrokes queued behind 1000+ register events).
 *
 * `CommandsRegistry.registerCommand` passes a `ServicesAccessor` as
 * the first argument; we strip it because extensions running in
 * Cocoon can't consume the workbench-internal accessor, then forward
 * the remaining positional args via `ResolveUIRequest` so the
 * extension's `$executeContributedCommand` round-trip resolves.
 */
type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

type ResolveUiRequest = (RequestId: string, Result: unknown) => unknown;

interface CommandsService {
	executeCommand(Id: string, ...Args: unknown[]): Promise<unknown>;
}

interface CommandRegistry {
	registerCommand(
		Id: string,

		Handler: (...Args: unknown[]) => unknown,
	): { dispose(): void };
}

interface ServicesProbe {
	Commands?: CommandsService;

	CommandRegistry?: CommandRegistry;
}

export default async (Dependencies: {
	Register: (
		Channel: string,

		Handler: (Payload: any) => void,
	) => Promise<void>;
	GetServices: () => ServicesProbe | null;
	Invoke: Invoke;
	ResolveUiRequest: ResolveUiRequest;
}): Promise<void> => {
	const { Register, GetServices, Invoke, ResolveUiRequest } = Dependencies;

	const RegisteredCommands = new Map<string, { dispose(): void }>();

	await Register("sky://command/execute", async (RawPayload: any) => {
		const Services = GetServices();
		if (!Services?.Commands) return;
		const RequestIdentifier = RawPayload?.RequestIdentifier;
		const Payload = RawPayload?.Payload ?? RawPayload;
		const Id = String(Payload?.id ?? Payload?.commandId ?? "");
		const Arguments = Array.isArray(Payload?.args) ? Payload.args : [];
		try {
			const Result = await Services.Commands.executeCommand(
				Id,
				...Arguments,
			);
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, Result ?? null);
			}
		} catch (Error) {
			console.warn("[SkyBridge] command execute failed", Id, Error);
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, null);
			}
		}
	});

	const RegisterOneCommand = (Entry: any): void => {
		const Services = GetServices();

		if (!Services?.CommandRegistry) return;

		const Id = String(Entry?.id ?? Entry?.commandId ?? "");

		if (!Id) return;

		if (RegisteredCommands.has(Id)) return;

		try {
			const Disposable = Services.CommandRegistry.registerCommand(
				Id,

				(...AllArguments: unknown[]) => {
					const CallerArguments = AllArguments.slice(1);
					return Invoke("ResolveUIRequest", {
						RequestID: `command:${Id}`,
						Result: { cid: Id, args: CallerArguments },
					}).catch(() => undefined);
				},
			);

			RegisteredCommands.set(Id, Disposable);
		} catch (Error) {
			console.warn("[SkyBridge] command register failed", Id, Error);
		}
	};

	await Register("sky://command/register", (Payload: any) => {
		if (Array.isArray(Payload?.commands)) {
			for (const Entry of Payload.commands) RegisterOneCommand(Entry);
		} else {
			RegisterOneCommand(Payload);
		}
	});

	await Register("sky://command/unregister", (Payload: any) => {
		const Id = String(Payload?.id ?? Payload?.commandId ?? "");
		if (!Id) return;
		const Disposable = RegisteredCommands.get(Id);
		if (Disposable) {
			try {
				Disposable.dispose();
			} catch {
				/* swallow */
			}
			RegisteredCommands.delete(Id);
		}
	});
};
