import type States from "../Type/States.js";

import type { Signal } from "solid-js";

import State from "@Context/Connection/State";
import _States from "@Context/Connection/States";

import { createSignal } from "solid-js";

export type Type = Signal<Value<States>>;

import type Value from "@playform/build/Target/Type/Value.js";

export default createSignal(_States[State()]) satisfies Type;
