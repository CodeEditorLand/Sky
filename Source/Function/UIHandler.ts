/**
 * @module UIHandler
 * @description
 * Handles UI requests from Mountain backend for QuickPick and InputBox dialogs.
 * 
 * This module listens for Tauri events from Mountain and displays appropriate
 * native browser dialogs, then resolves the request via the ResolveUIRequest command.
 * 
 * RESPONSIBILITIES:
 * - Show quick pick selection lists
 * - Show input boxes for text entry
 * - Resolve UI requests with user selections
 * 
 * ARCHITECTURE:
 * Mountain UserInterfaceProvider → Sky UI Handler → User Interaction → ResolveUIRequest
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * QuickPick item interface
 */
interface QuickPickItem {
	label: string;
	description?: string;
	detail?: string;
	picked?: boolean;
}

/**
 * QuickPick options interface
 */
interface QuickPickOptions {
	placeHolder?: string;
	matchOnDescription?: boolean;
	matchOnDetail?: boolean;
	ignoreFocusLost?: boolean;
	canPickMany?: boolean;
}

/**
 * InputBox options interface
 */
interface InputBoxOptions {
	title?: string;
	value?: string;
	valueSelection?: [number, number];
	prompt?: string;
	placeHolder?: string;
	password?: boolean;
	ignoreFocusLost?: boolean;
}

/**
 * UI Request payload interface
 */
interface UIRequestPayload<Payload = unknown> {
	RequestIdentifier: string;
	Payload: Payload;
}

/**
 * QuickPick request payload
 */
interface QuickPickRequestPayload {
	Items: QuickPickItem[];
	Options?: QuickPickOptions;
}

/**
 * InputBox request payload
 */
interface InputBoxRequestPayload extends InputBoxOptions {}

/**
 * Resolves a UI request with the result
 */
async function resolveUIRequest(requestIdentifier: string, result: unknown) {
	try {
		await invoke('ResolveUIRequest', {
			requestIdentifier,
			result,
		});
		console.log(`[UIHandler] Resolved UI request: ${requestIdentifier}`);
	} catch (error) {
		console.error(`[UIHandler] Failed to resolve UI request:`, error);
	}
}

/**
 * Shows a native HTML quick pick dialog
 */
function showNativeQuickPick(
	items: QuickPickItem[],
	options?: QuickPickOptions,
): Promise<string[] | null> {
	return new Promise((resolve) => {
		// Create modal dialog container
		const dialog = document.createElement('div');
		dialog.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10000;
			font-family: var(--vscode-font-family);
			font-size: 13px;
			color: var(--vscode-foreground);
		`;

		// Create dialog content
		const content = document.createElement('div');
		content.style.cssText = `
			background: var(--vscode-editor-background);
			border: 1px solid var(--vscode-panel-border);
			border-radius: 4px;
			max-width: 500px;
			max-height: 400px;
			width: 100%;
			margin: 20px;
			display: flex;
			flex-direction: column;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		`;

		// Create header with placeholder
		const header = document.createElement('div');
		header.style.cssText = `
			padding: 12px;
			border-bottom: 1px solid var(--vscode-panel-border);
			font-weight: 600;
		`;
		header.textContent = options?.placeHolder || 'Select an item';
		content.appendChild(header);

		// Create list container
		const listContainer = document.createElement('div');
		listContainer.style.cssText = `
			overflow-y: auto;
			flex: 1;
		`;
		content.appendChild(listContainer);

		// Create list items
		items.forEach((item, index) => {
			const listItem = document.createElement('div');
			listItem.style.cssText = `
				padding: 8px 12px;
				cursor: pointer;
				border-bottom: 1px solid var(--vscode-widget-border);
				transition: background 0.1s;
			`;
			
			const label = document.createElement('div');
			label.textContent = item.label;
			listItem.appendChild(label);

			if (item.description) {
				const description = document.createElement('div');
				description.style.cssText = `
					font-size: 11px;
					color: var(--vscode-descriptionForeground);
					margin-top: 2px;
				`;
				description.textContent = item.description;
				listItem.appendChild(description);
			}

			if (item.detail) {
				const detail = document.createElement('div');
				detail.style.cssText = `
					font-size: 11px;
					color: var(--vscode-descriptionForeground);
					margin-top: 2px;
				`;
				detail.textContent = item.detail;
				listItem.appendChild(detail);
			}

			listItem.addEventListener('mouseenter', () => {
				listItem.style.background = 'var(--vscode-list-hoverBackground)';
			});

			listItem.addEventListener('mouseleave', () => {
				listItem.style.background = '';
			});

			listItem.addEventListener('click', () => {
				resolve(options?.canPickMany && item.picked ? [] : [item.label]);
				dialog.remove();
			});

			listContainer.appendChild(listItem);
		});

		// Create footer with cancel button
		const footer = document.createElement('div');
		footer.style.cssText = `
			padding: 12px;
			border-top: 1px solid var(--vscode-panel-border);
			display: flex;
			justify-content: flex-end;
		`;

		const cancelButton = document.createElement('button');
		cancelButton.textContent = 'Cancel';
		cancelButton.style.cssText = `
			padding: 6px 12px;
			background: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
			border: none;
			border-radius: 2px;
			cursor: pointer;
			font-family: inherit;
			font-size: 13px;
		`;

		cancelButton.addEventListener('click', () => {
			resolve(null);
			dialog.remove();
		});

		footer.appendChild(cancelButton);
		content.appendChild(footer);
		dialog.appendChild(content);

		// Handle escape key
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				resolve(null);
				dialog.remove();
				document.removeEventListener('keydown', handleEscape);
			}
		};
		document.addEventListener('keydown', handleEscape);

		document.body.appendChild(dialog);

		// Focus first item
		const firstItem = listContainer.firstElementChild as HTMLElement;
		firstItem?.focus();
	});
}

/**
 * Shows a native HTML input box dialog
 */
function showNativeInputBox(options?: InputBoxOptions): Promise<string | null> {
	return new Promise((resolve) => {
		// Create modal dialog container
		const dialog = document.createElement('div');
		dialog.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10000;
			font-family: var(--vscode-font-family);
			font-size: 13px;
			color: var(--vscode-foreground);
		`;

		// Create dialog content
		const content = document.createElement('div');
		content.style.cssText = `
			background: var(--vscode-editor-background);
			border: 1px solid var(--vscode-panel-border);
			border-radius: 4px;
			max-width: 400px;
			width: 100%;
			margin: 20px;
			padding: 16px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		`;

		// Create title
		if (options?.title) {
			const title = document.createElement('h3');
			title.style.cssText = `
				margin: 0 0 12px 0;
				font-size: 16px;
				font-weight: 600;
			`;
			title.textContent = options.title;
			content.appendChild(title);
		}

		// Create prompt
		if (options?.prompt) {
			const prompt = document.createElement('label');
			prompt.style.cssText = `
				display: block;
				margin-bottom: 8px;
				color: var(--vscode-foreground);
			`;
			prompt.textContent = options.prompt;
			content.appendChild(prompt);
		}

		// Create input field
		const input = document.createElement('input');
		input.type = options?.password ? 'password' : 'text';
		input.value = options?.value || '';
		input.placeholder = options?.placeHolder || '';
		input.style.cssText = `
			width: 100%;
			padding: 8px;
			margin-bottom: 16px;
			background: var(--vscode-input-background);
			border: 1px solid var(--vscode-input-border);
			color: var(--vscode-input-foreground);
			border-radius: 2px;
			font-family: inherit;
			font-size: 13px;
			box-sizing: border-box;
		`;

		// Set default selection if specified
		if (options?.valueSelection) {
			input.setSelectionRange(options.valueSelection[0], options.valueSelection[1]);
		}

		content.appendChild(input);

		// Create buttons
		const buttons = document.createElement('div');
		buttons.style.cssText = `
			display: flex;
			justify-content: flex-end;
			gap: 8px;
		`;

		const cancelButton = document.createElement('button');
		cancelButton.textContent = 'Cancel';
		cancelButton.style.cssText = `
			padding: 6px 16px;
			background: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
			border: none;
			border-radius: 2px;
			cursor: pointer;
			font-family: inherit;
			font-size: 13px;
		`;

		const confirmButton = document.createElement('button');
		confirmButton.textContent = 'OK';
		confirmButton.style.cssText = `
			padding: 6px 16px;
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 2px;
			cursor: pointer;
			font-family: inherit;
			font-size: 13px;
		`;

		cancelButton.addEventListener('click', () => {
			resolve(null);
			dialog.remove();
		});

		confirmButton.addEventListener('click', () => {
			resolve(input.value || null);
			dialog.remove();
		});

		buttons.appendChild(cancelButton);
		buttons.appendChild(confirmButton);
		content.appendChild(buttons);
		dialog.appendChild(content);

		// Handle enter key
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				resolve(input.value || null);
				dialog.remove();
			} else if (e.key === 'Escape') {
				resolve(null);
				dialog.remove();
			}
		});

		document.body.appendChild(dialog);
		input.focus();
	});
}

/**
 * Sets up UI request handlers
 */
export async function setupUIHandlers() {
	console.log('[UIHandler] Setting up UI request handlers...');

	// Listen for QuickPick requests
	if (typeof window !== 'undefined' && (window as any).__TAURI__?.event?.listen) {
		const { listen } = await import('@tauri-apps/api/event');

		const unlistenQuickPick = await listen<UIRequestPayload<QuickPickRequestPayload>>(
			'sky://ui/show-quick-pick-request',
			async (event) => {
				const { RequestIdentifier, Payload } = event.payload;
				console.log('[UIHandler] QuickPick request received:', RequestIdentifier);

				try {
					const result = await showNativeQuickPick(Payload.Items, Payload.Options);
					await resolveUIRequest(RequestIdentifier, result);
				} catch (error) {
					console.error('[UIHandler] QuickPick error:', error);
					await resolveUIRequest(RequestIdentifier, null);
				}
			},
		);

		// Listen for InputBox requests
		const unlistenInputBox = await listen<UIRequestPayload<InputBoxRequestPayload>>(
			'sky://ui/show-input-box-request',
			async (event) => {
				const { RequestIdentifier, Payload } = event.payload;
				console.log('[UIHandler] InputBox request received:', RequestIdentifier);

				try {
					const result = await showNativeInputBox(Payload);
					await resolveUIRequest(RequestIdentifier, result);
				} catch (error) {
					console.error('[UIHandler] InputBox error:', error);
					await resolveUIRequest(RequestIdentifier, null);
				}
			},
		);

		console.log('[UIHandler] UI handlers registered successfully');

		// Return cleanup function
		return () => {
			unlistenQuickPick();
			unlistenInputBox();
		};
	} else {
		console.warn('[UIHandler] Tauri event API not available, UI handlers not registered');
		return () => {};
	}
}

/**
 * Auto-initialize on module load (for environments like Astro that load modules)
 */
if (typeof window !== 'undefined') {
	setupUIHandlers().catch((error) => {
		console.error('[UIHandler] Failed to setup UI handlers:', error);
	});
}
