import Create from "@Library/Create";
import Persist from "@Library/Persist";

import { createSignal } from "solid-js";

export default Create(
	Persist([createSignal(new Map([])), "Session"]),
) satisfies Interface;

import type Interface from "../../Interface/Create.js";
