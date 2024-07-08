/**
 * @module Editor
 *
 */
export default ({ Type }: { Type: Editor["Type"] } = { Type: "HTML" }) => {
	const [Edit, { Form, Field }] = createForm<Type>();

	const Identifier = crypto.randomUUID();

	createEffect(
		on(
			Action.Editors[0],
			(Editors) => {
				setValue(
					Edit,
					"Content",
					Editors.get(Identifier)?.Content ?? "",
					{
						shouldFocus: false,
						shouldTouched: false,
					},
				);

				validate(Edit);
			},
			{ defer: false },
		),
	);

	const Content = createSignal(Return(Type));

	createEffect(
		on(
			Connection.Messages[0],
			(Messages) =>
				Messages?.get("Type") && Content[1](Messages?.get("Type")),
			{
				defer: false,
			},
		),
	);

	let Code!: HTMLElement;

	let Instance!: Monaco.IStandaloneCodeEditor;

	Action.Editors[0]().set(Identifier, {
		Type,
		Hidden: Action.Editors[0]().size > 0 ? true : false,
		Content: Content[0](),
	});

	onMount(() => {
		if (Code instanceof HTMLElement) {
			Instance = Monaco.create(Code, {
				value: Content[0](),
				language: Type.toLowerCase(),
				automaticLayout: true,
				lineNumbers: "off",
				"semanticHighlighting.enabled": "configuredByTheme",
				autoClosingBrackets: "always",
				autoIndent: "full",
				tabSize: 4,
				detectIndentation: false,
				useTabStops: true,
				minimap: {
					enabled: false,
				},
				scrollbar: {
					useShadows: true,
					horizontal: "hidden",
					verticalScrollbarSize: 10,
					verticalSliderSize: 4,
					alwaysConsumeMouseWheel: false,
				},
				folding: false,
				theme: window.matchMedia("(prefers-color-scheme: dark)").matches
					? "Dark"
					: "Light",
				wrappingStrategy: "advanced",
				word: "on",
				bracketPairColorization: {
					enabled: true,
					independentColorPoolPerBracketType: true,
				},
				padding: {
					top: 12,
					bottom: 12,
				},
				fixedOverflowWidgets: true,
				tabCompletion: "on",
				acceptSuggestionOnEnter: "on",
				cursorWidth: 5,
				roundedSelection: true,
				matchBrackets: "always",
				autoSurround: "languageDefined",
				screenReaderAnnounceInlineSuggestion: false,
				renderFinalNewline: "on",
				selectOnLineNumbers: false,
				formatOnType: true,
				formatOnPaste: true,
				fontFamily: "'Source Code Pro'",
				fontWeight: "400",
				fontLigatures: true,
				links: false,
				fontSize: 16,
			});

			Instance.getModel()?.setEOL(Monaco.EndOfLineSequence.LF);

			Instance.onKeyDown((Event) => {
				if (Event.ctrlKey && Event.code === "KeyS") {
					Event.preventDefault();

					validate(Edit);

					Edit.element?.submit();
				}
			});

			Instance.getModel()?.onDidChangeContent(() => {
				Action.Editors[1](
					Merge(
						Action.Editors[0](),
						new Map([
							[
								Identifier,
								{
									Content:
										Instance.getModel()?.getValue() ?? "",
									Hidden:
										Action.Editors[0]()?.get(Identifier)
											?.Hidden ?? true,
									Type,
								},
							],
						]),
					),
				);
			});

			Instance.onDidChangeModelLanguageConfiguration(() =>
				Instance.getAction("editor.action.formatDocument")?.run(),
			);

			Instance.onDidLayoutChange(() =>
				Instance.getAction("editor.action.formatDocument")?.run(),
			);

			window.addEventListener("load", () =>
				Instance.getAction("editor.action.formatDocument")?.run(),
			);

			setTimeout(
				() => Instance.getAction("editor.action.formatDocument")?.run(),
				1000,
			);

			createEffect(
				on(
					Content[0],
					(Content) => Instance.getModel()?.setValue(Content),
					{
						defer: false,
					},
				),
			);

			Connection.Socket[0]()?.send(
				JSON.stringify({
					Key: Store.Items[0]()?.get("Key")?.[0](),
					Identifier: Store.Items[0]()?.get("Identifier")?.[0](),
					From: "Content",
					View: Type,
				}),
			);
		}
	});

	return (
		<div
			class={
				!Action.Editors[0]()?.get(Identifier)?.Hidden &&
				Session.Data[0]()?.get("Name")
					? ""
					: "hidden"
			}>
			<p>
				Edit your{" "}
				<For each={Array.from(Action.Editors[0]().entries())}>
					{(Editor, _Index) => (
						<>
							<Anchor
								Action={() => {
									Action.Editors[0]().forEach(
										(_Editor, Identifier) => {
											_Editor.Hidden =
												Editor[0] === Identifier
													? false
													: true;

											Action.Editors[1](
												Merge(
													Action.Editors[0](),
													new Map([
														[Identifier, _Editor],
													]),
												),
											);
										},
									);

									setTimeout(() => {
										Instance.setScrollPosition({
											scrollTop: -50,
										});
									}, 1000);
								}}>
								{Editor[1].Type}
							</Anchor>

							{_Index() === Action.Editors[0]().size - 1
								? ""
								: " / "}
						</>
					)}
				</For>{" "}
				here:
			</p>

			<br />

			<Form method="post" onSubmit={Update}>
				<Field
					name="Content"
					validate={[required(`Please enter some ${Type}.`)]}>
					{(Field, Property) => (
						<div class="w-full">
							<div class="Editor">
								<code ref={Code} class="Monaco" />

								{Field.error && (
									<>
										{/* biome-ignore lint/a11y/useKeyWithClickEvents: */}
										<div
											class="Error"
											onClick={() => {
												clearError(Edit, "Content");
												Instance.focus();
											}}>
											<span>
												&nbsp;&nbsp;&nbsp;
												{Field.error}
											</span>
										</div>
									</>
								)}

								<input
									{...Property}
									value={
										Action.Editors[0]()?.get(Identifier)
											?.Content ?? ""
									}
									type="hidden"
									required={true}
								/>
							</div>
						</div>
					)}
				</Field>

				<Field name="Field">
					{(_Field, Property) => (
						<input type="hidden" {...Property} value={Type} />
					)}
				</Field>
			</Form>
		</div>
	);
};

export type Type = {
	Field: Editor["Type"];
	Content: string;
};

export const Return = (Type: Editor["Type"]) => {
	switch (Type) {
		case "CSS":
			return `
/* Example CSS Code */
body {

}			
`;

		case "HTML":
			return `
<!-- Example HTML Code -->
<!doctype html>
<html lang="en">
	<body>
	</body>
</html>
`;

		case "TypeScript":
			return `
/**
 * Example TypeScript Code
 */
export default () => ({});
`;

		default:
			return "";
	}
};

// TODO: If a user logs out then logs in again, the keys are persisted in local storage, however the Access Token is no longer valid, they will either roll keys or renew. If they renew no problem. If they roll keys, their HTML gets reset.
export const Update: SubmitHandler<Type> = ({ Content, Field }, Event) => {
	if (Event) {
		Event.preventDefault();

		Connection.Socket[0]()?.send(
			JSON.stringify({
				Key: Store.Items[0]()?.get("Key")?.[0](),
				Identifier: Store.Items[0]()?.get("Identifier")?.[0](),
				To: Field,
				Input: Content,
			}),
		);
	}
};

export const { default: Action } = await import("@Context/Action/Context");
export const { default: Connection } = await import(
	"@Context/Connection/Context"
);
export const { default: Session } = await import("@Context/Session/Context");
export const { default: Store } = await import("@Context/Store/Context");
export const { default: Anchor } = await import("@Element/Anchor");
export const { default: Button } = await import("@Element/Button");
export const { default: Tip, Fn: Copy } = await import("@Element/Tip/Copy");
export const { default: Merge } = await import("@Function/Merge.js");

import {
	clearError,
	createForm,
	required,
	setValue,
	validate,
} from "@modular-forms/solid";

import { editor as Monaco } from "monaco-editor";
import { onMount } from "solid-js";

import { For, createEffect, createSignal, on } from "solid-js";

import type Editor from "@Context/Action/Editor";

import type { SubmitHandler } from "@modular-forms/solid";

import "@Stylesheet/Element/Action.scss";
import "@Stylesheet/Element/Editor.scss";
