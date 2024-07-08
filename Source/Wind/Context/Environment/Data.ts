import type { _Function } from "@Library/Environment";

import type { Signal } from "solid-js";

import Create from "@Library/Create";
import Persist from "@Library/Persist";

import { createSignal } from "solid-js";
import type { z } from "zod";

export type Type = Signal<z.infer<Exclude<typeof _Function, boolean>>>;

export default Create(
	Persist([
		createSignal({
			API: "",
			Socket: "",
		}),
		"Environment",
	]),
) satisfies Type;
