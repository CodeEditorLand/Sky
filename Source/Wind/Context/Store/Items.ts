import type Item from "@Context/Store/Item";
import type Into from "../../Interface/Create.js";

import { createSignal } from "solid-js";

export default createSignal(
	new Map<Into, Item>(),
) satisfies Interface;

import type Interface from "../../Interface/Items.js";
