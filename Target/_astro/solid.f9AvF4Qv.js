let taskIdCounter = 1,
	isCallbackScheduled = !1,
	isPerformingWork = !1,
	taskQueue = [],
	currentTask = null,
	shouldYieldToHost = null,
	yieldInterval = 5,
	deadline = 0,
	maxYieldInterval = 300,
	scheduleCallback = null,
	scheduledCallback = null;
const maxSigned31BitInt = 1073741823;
function setupScheduler() {
	const e = new MessageChannel(),
		n = e.port2;
	if (
		((scheduleCallback = () => n.postMessage(null)),
		(e.port1.onmessage = () => {
			if (null !== scheduledCallback) {
				const e = performance.now();
				deadline = e + yieldInterval;
				const t = !0;
				try {
					scheduledCallback(t, e)
						? n.postMessage(null)
						: (scheduledCallback = null);
				} catch (e) {
					throw (n.postMessage(null), e);
				}
			}
		}),
		navigator &&
			navigator.scheduling &&
			navigator.scheduling.isInputPending)
	) {
		const e = navigator.scheduling;
		shouldYieldToHost = () => {
			const n = performance.now();
			return (
				n >= deadline && (!!e.isInputPending() || n >= maxYieldInterval)
			);
		};
	} else shouldYieldToHost = () => performance.now() >= deadline;
}
function enqueue(e, n) {
	e.splice(
		(function () {
			let t = 0,
				r = e.length - 1;
			for (; t <= r; ) {
				const o = (r + t) >> 1,
					s = n.expirationTime - e[o].expirationTime;
				if (s > 0) t = o + 1;
				else {
					if (!(s < 0)) return o;
					r = o - 1;
				}
			}
			return t;
		})(),
		0,
		n,
	);
}
function requestCallback(e, n) {
	scheduleCallback || setupScheduler();
	let t = performance.now(),
		r = maxSigned31BitInt;
	n && n.timeout && (r = n.timeout);
	const o = {
		id: taskIdCounter++,
		fn: e,
		startTime: t,
		expirationTime: t + r,
	};
	return (
		enqueue(taskQueue, o),
		isCallbackScheduled ||
			isPerformingWork ||
			((isCallbackScheduled = !0),
			(scheduledCallback = flushWork),
			scheduleCallback()),
		o
	);
}
function cancelCallback(e) {
	e.fn = null;
}
function flushWork(e, n) {
	(isCallbackScheduled = !1), (isPerformingWork = !0);
	try {
		return workLoop(e, n);
	} finally {
		(currentTask = null), (isPerformingWork = !1);
	}
}
function workLoop(e, n) {
	let t = n;
	for (
		currentTask = taskQueue[0] || null;
		null !== currentTask &&
		(!(currentTask.expirationTime > t) || (e && !shouldYieldToHost()));

	) {
		const e = currentTask.fn;
		if (null !== e) {
			currentTask.fn = null;
			e(currentTask.expirationTime <= t),
				(t = performance.now()),
				currentTask === taskQueue[0] && taskQueue.shift();
		} else taskQueue.shift();
		currentTask = taskQueue[0] || null;
	}
	return null !== currentTask;
}
const sharedConfig = { context: void 0, registry: void 0 };
function setHydrateContext(e) {
	sharedConfig.context = e;
}
function nextHydrateContext() {
	return {
		...sharedConfig.context,
		id: `${sharedConfig.context.id}${sharedConfig.context.count++}-`,
		count: 0,
	};
}
const equalFn = (e, n) => e === n,
	$PROXY = Symbol("solid-proxy"),
	$TRACK = Symbol("solid-track"),
	$DEVCOMP = Symbol("solid-dev-component"),
	signalOptions = { equals: equalFn };
let ERROR = null,
	runEffects = runQueue;
const STALE = 1,
	PENDING = 2,
	UNOWNED = { owned: null, cleanups: null, context: null, owner: null },
	NO_INIT = {};
var Owner = null;
let Transition = null,
	Scheduler = null,
	ExternalSourceConfig = null,
	Listener = null,
	Updates = null,
	Effects = null,
	ExecCount = 0;
function createRoot(e, n) {
	const t = Listener,
		r = Owner,
		o = 0 === e.length,
		s = void 0 === n ? r : n,
		i = o
			? UNOWNED
			: {
					owned: null,
					cleanups: null,
					context: s ? s.context : null,
					owner: s,
				},
		a = o ? e : () => e(() => untrack(() => cleanNode(i)));
	(Owner = i), (Listener = null);
	try {
		return runUpdates(a, !0);
	} finally {
		(Listener = t), (Owner = r);
	}
}
function createSignal(e, n) {
	const t = {
		value: e,
		observers: null,
		observerSlots: null,
		comparator:
			(n = n ? Object.assign({}, signalOptions, n) : signalOptions)
				.equals || void 0,
	};
	return [
		readSignal.bind(t),
		(e) => (
			"function" == typeof e &&
				(e =
					Transition &&
					Transition.running &&
					Transition.sources.has(t)
						? e(t.tValue)
						: e(t.value)),
			writeSignal(t, e)
		),
	];
}
function createComputed(e, n, t) {
	const r = createComputation(e, n, !0, STALE);
	Scheduler && Transition && Transition.running
		? Updates.push(r)
		: updateComputation(r);
}
function createRenderEffect(e, n, t) {
	const r = createComputation(e, n, !1, STALE);
	Scheduler && Transition && Transition.running
		? Updates.push(r)
		: updateComputation(r);
}
function createEffect(e, n, t) {
	runEffects = runUserEffects;
	const r = createComputation(e, n, !1, STALE),
		o = SuspenseContext && useContext(SuspenseContext);
	o && (r.suspense = o),
		(t && t.render) || (r.user = !0),
		Effects ? Effects.push(r) : updateComputation(r);
}
function createReaction(e, n) {
	let t;
	const r = createComputation(
			() => {
				t ? t() : untrack(e), (t = void 0);
			},
			void 0,
			!1,
			0,
		),
		o = SuspenseContext && useContext(SuspenseContext);
	return (
		o && (r.suspense = o),
		(r.user = !0),
		(e) => {
			(t = e), updateComputation(r);
		}
	);
}
function createMemo(e, n, t) {
	t = t ? Object.assign({}, signalOptions, t) : signalOptions;
	const r = createComputation(e, n, !0, 0);
	return (
		(r.observers = null),
		(r.observerSlots = null),
		(r.comparator = t.equals || void 0),
		Scheduler && Transition && Transition.running
			? ((r.tState = STALE), Updates.push(r))
			: updateComputation(r),
		readSignal.bind(r)
	);
}
function isPromise(e) {
	return e && "object" == typeof e && "then" in e;
}
function createResource(e, n, t) {
	let r, o, s;
	(2 === arguments.length && "object" == typeof n) || 1 === arguments.length
		? ((r = !0), (o = e), (s = n || {}))
		: ((r = e), (o = n), (s = t || {}));
	let i = null,
		a = NO_INIT,
		u = null,
		c = !1,
		l = !1,
		d = "initialValue" in s,
		f = "function" == typeof r && createMemo(r);
	const p = new Set(),
		[h, g] = (s.storage || createSignal)(s.initialValue),
		[C, w] = createSignal(void 0),
		[T, S] = createSignal(void 0, { equals: !1 }),
		[v, b] = createSignal(d ? "ready" : "unresolved");
	if (sharedConfig.context) {
		let e;
		(u = `${sharedConfig.context.id}${sharedConfig.context.count++}`),
			"initial" === s.ssrLoadFrom
				? (a = s.initialValue)
				: sharedConfig.load && (e = sharedConfig.load(u)) && (a = e);
	}
	function m(e, n, t, r) {
		return (
			i === e &&
				((i = null),
				void 0 !== r && (d = !0),
				(e !== a && n !== a) ||
					!s.onHydrated ||
					queueMicrotask(() => s.onHydrated(r, { value: n })),
				(a = NO_INIT),
				Transition && e && c
					? (Transition.promises.delete(e),
						(c = !1),
						runUpdates(() => {
							(Transition.running = !0), E(n, t);
						}, !1))
					: E(n, t)),
			n
		);
	}
	function E(e, n) {
		runUpdates(() => {
			void 0 === n && g(() => e),
				b(void 0 !== n ? "errored" : d ? "ready" : "unresolved"),
				w(n);
			for (const e of p.keys()) e.decrement();
			p.clear();
		}, !1);
	}
	function x() {
		const e = SuspenseContext && useContext(SuspenseContext),
			n = h(),
			t = C();
		if (void 0 !== t && !i) throw t;
		return (
			Listener &&
				!Listener.user &&
				e &&
				createComputed(() => {
					T(),
						i &&
							(e.resolved && Transition && c
								? Transition.promises.add(i)
								: p.has(e) || (e.increment(), p.add(e)));
				}),
			n
		);
	}
	function k(e = !0) {
		if (!1 !== e && l) return;
		l = !1;
		const n = f ? f() : r;
		if (((c = Transition && Transition.running), null == n || !1 === n))
			return void m(i, untrack(h));
		Transition && i && Transition.promises.delete(i);
		const t =
			a !== NO_INIT
				? a
				: untrack(() => o(n, { value: h(), refetching: e }));
		return isPromise(t)
			? ((i = t),
				"value" in t
					? ("success" === t.status
							? m(i, t.value, void 0, n)
							: m(i, void 0, castError(t.value), n),
						t)
					: ((l = !0),
						queueMicrotask(() => (l = !1)),
						runUpdates(() => {
							b(d ? "refreshing" : "pending"), S();
						}, !1),
						t.then(
							(e) => m(t, e, void 0, n),
							(e) => m(t, void 0, castError(e), n),
						)))
			: (m(i, t, void 0, n), t);
	}
	return (
		Object.defineProperties(x, {
			state: { get: () => v() },
			error: { get: () => C() },
			loading: {
				get() {
					const e = v();
					return "pending" === e || "refreshing" === e;
				},
			},
			latest: {
				get() {
					if (!d) return x();
					const e = C();
					if (e && !i) throw e;
					return h();
				},
			},
		}),
		f ? createComputed(() => k(!1)) : k(!1),
		[x, { refetch: k, mutate: g }]
	);
}
function createDeferred(e, n) {
	let t,
		r = n ? n.timeoutMs : void 0;
	const o = createComputation(
			() => (
				(t && t.fn) ||
					(t = requestCallback(
						() => i(() => o.value),
						void 0 !== r ? { timeout: r } : void 0,
					)),
				e()
			),
			void 0,
			!0,
		),
		[s, i] = createSignal(
			Transition && Transition.running && Transition.sources.has(o)
				? o.tValue
				: o.value,
			n,
		);
	return (
		updateComputation(o),
		i(() =>
			Transition && Transition.running && Transition.sources.has(o)
				? o.tValue
				: o.value,
		),
		s
	);
}
function createSelector(e, n = equalFn, t) {
	const r = new Map(),
		o = createComputation(
			(t) => {
				const o = e();
				for (const [e, s] of r.entries())
					if (n(e, o) !== n(e, t))
						for (const e of s.values())
							(e.state = STALE),
								e.pure ? Updates.push(e) : Effects.push(e);
				return o;
			},
			void 0,
			!0,
			STALE,
		);
	return (
		updateComputation(o),
		(e) => {
			const t = Listener;
			if (t) {
				let n;
				(n = r.get(e)) ? n.add(t) : r.set(e, (n = new Set([t]))),
					onCleanup(() => {
						n.delete(t), !n.size && r.delete(e);
					});
			}
			return n(
				e,
				Transition && Transition.running && Transition.sources.has(o)
					? o.tValue
					: o.value,
			);
		}
	);
}
function batch(e) {
	return runUpdates(e, !1);
}
function untrack(e) {
	if (!ExternalSourceConfig && null === Listener) return e();
	const n = Listener;
	Listener = null;
	try {
		return ExternalSourceConfig ? ExternalSourceConfig.untrack(e) : e();
	} finally {
		Listener = n;
	}
}
function on(e, n, t) {
	const r = Array.isArray(e);
	let o,
		s = t && t.defer;
	return (t) => {
		let i;
		if (r) {
			i = Array(e.length);
			for (let n = 0; n < e.length; n++) i[n] = e[n]();
		} else i = e();
		if (s) return (s = !1), t;
		const a = untrack(() => n(i, o, t));
		return (o = i), a;
	};
}
function onMount(e) {
	createEffect(() => untrack(e));
}
function onCleanup(e) {
	return (
		null === Owner ||
			(null === Owner.cleanups
				? (Owner.cleanups = [e])
				: Owner.cleanups.push(e)),
		e
	);
}
function catchError(e, n) {
	ERROR || (ERROR = Symbol("error")),
		((Owner = createComputation(void 0, void 0, !0)).context = {
			...Owner.context,
			[ERROR]: [n],
		}),
		Transition && Transition.running && Transition.sources.add(Owner);
	try {
		return e();
	} catch (e) {
		handleError(e);
	} finally {
		Owner = Owner.owner;
	}
}
function getListener() {
	return Listener;
}
function getOwner() {
	return Owner;
}
function runWithOwner(e, n) {
	const t = Owner,
		r = Listener;
	(Owner = e), (Listener = null);
	try {
		return runUpdates(n, !0);
	} catch (e) {
		handleError(e);
	} finally {
		(Owner = t), (Listener = r);
	}
}
function enableScheduling(e = requestCallback) {
	Scheduler = e;
}
function startTransition(e) {
	if (Transition && Transition.running) return e(), Transition.done;
	const n = Listener,
		t = Owner;
	return Promise.resolve().then(() => {
		let r;
		return (
			(Listener = n),
			(Owner = t),
			(Scheduler || SuspenseContext) &&
				((r =
					Transition ||
					(Transition = {
						sources: new Set(),
						effects: [],
						promises: new Set(),
						disposed: new Set(),
						queue: new Set(),
						running: !0,
					})),
				r.done || (r.done = new Promise((e) => (r.resolve = e))),
				(r.running = !0)),
			runUpdates(e, !1),
			(Listener = Owner = null),
			r ? r.done : void 0
		);
	});
}
const [transPending, setTransPending] = createSignal(!1);
function useTransition() {
	return [transPending, startTransition];
}
function resumeEffects(e) {
	Effects.push.apply(Effects, e), (e.length = 0);
}
function createContext(e, n) {
	const t = Symbol("context");
	return { id: t, Provider: createProvider(t), defaultValue: e };
}
function useContext(e) {
	return Owner && Owner.context && void 0 !== Owner.context[e.id]
		? Owner.context[e.id]
		: e.defaultValue;
}
function children(e) {
	const n = createMemo(e),
		t = createMemo(() => resolveChildren(n()));
	return (
		(t.toArray = () => {
			const e = t();
			return Array.isArray(e) ? e : null != e ? [e] : [];
		}),
		t
	);
}
let SuspenseContext;
function getSuspenseContext() {
	return SuspenseContext || (SuspenseContext = createContext());
}
function enableExternalSource(e, n = (e) => e()) {
	if (ExternalSourceConfig) {
		const { factory: t, untrack: r } = ExternalSourceConfig;
		ExternalSourceConfig = {
			factory: (n, r) => {
				const o = t(n, r),
					s = e((e) => o.track(e), r);
				return {
					track: (e) => s.track(e),
					dispose() {
						s.dispose(), o.dispose();
					},
				};
			},
			untrack: (e) => r(() => n(e)),
		};
	} else ExternalSourceConfig = { factory: e, untrack: n };
}
function readSignal() {
	const e = Transition && Transition.running;
	if (this.sources && (e ? this.tState : this.state))
		if ((e ? this.tState : this.state) === STALE) updateComputation(this);
		else {
			const e = Updates;
			(Updates = null),
				runUpdates(() => lookUpstream(this), !1),
				(Updates = e);
		}
	if (Listener) {
		const e = this.observers ? this.observers.length : 0;
		Listener.sources
			? (Listener.sources.push(this), Listener.sourceSlots.push(e))
			: ((Listener.sources = [this]), (Listener.sourceSlots = [e])),
			this.observers
				? (this.observers.push(Listener),
					this.observerSlots.push(Listener.sources.length - 1))
				: ((this.observers = [Listener]),
					(this.observerSlots = [Listener.sources.length - 1]));
	}
	return e && Transition.sources.has(this) ? this.tValue : this.value;
}
function writeSignal(e, n, t) {
	let r =
		Transition && Transition.running && Transition.sources.has(e)
			? e.tValue
			: e.value;
	if (!e.comparator || !e.comparator(r, n)) {
		if (Transition) {
			const r = Transition.running;
			(r || (!t && Transition.sources.has(e))) &&
				(Transition.sources.add(e), (e.tValue = n)),
				r || (e.value = n);
		} else e.value = n;
		e.observers &&
			e.observers.length &&
			runUpdates(() => {
				for (let n = 0; n < e.observers.length; n += 1) {
					const t = e.observers[n],
						r = Transition && Transition.running;
					(r && Transition.disposed.has(t)) ||
						((r ? t.tState : t.state) ||
							(t.pure ? Updates.push(t) : Effects.push(t),
							t.observers && markDownstream(t)),
						r ? (t.tState = STALE) : (t.state = STALE));
				}
				if (Updates.length > 1e6) throw ((Updates = []), new Error());
			}, !1);
	}
	return n;
}
function updateComputation(e) {
	if (!e.fn) return;
	cleanNode(e);
	const n = ExecCount;
	runComputation(
		e,
		Transition && Transition.running && Transition.sources.has(e)
			? e.tValue
			: e.value,
		n,
	),
		Transition &&
			!Transition.running &&
			Transition.sources.has(e) &&
			queueMicrotask(() => {
				runUpdates(() => {
					Transition && (Transition.running = !0),
						(Listener = Owner = e),
						runComputation(e, e.tValue, n),
						(Listener = Owner = null);
				}, !1);
			});
}
function runComputation(e, n, t) {
	let r;
	const o = Owner,
		s = Listener;
	Listener = Owner = e;
	try {
		r = e.fn(n);
	} catch (n) {
		return (
			e.pure &&
				(Transition && Transition.running
					? ((e.tState = STALE),
						e.tOwned && e.tOwned.forEach(cleanNode),
						(e.tOwned = void 0))
					: ((e.state = STALE),
						e.owned && e.owned.forEach(cleanNode),
						(e.owned = null))),
			(e.updatedAt = t + 1),
			handleError(n)
		);
	} finally {
		(Listener = s), (Owner = o);
	}
	(!e.updatedAt || e.updatedAt <= t) &&
		(null != e.updatedAt && "observers" in e
			? writeSignal(e, r, !0)
			: Transition && Transition.running && e.pure
				? (Transition.sources.add(e), (e.tValue = r))
				: (e.value = r),
		(e.updatedAt = t));
}
function createComputation(e, n, t, r = STALE, o) {
	const s = {
		fn: e,
		state: r,
		updatedAt: null,
		owned: null,
		sources: null,
		sourceSlots: null,
		cleanups: null,
		value: n,
		owner: Owner,
		context: Owner ? Owner.context : null,
		pure: t,
	};
	if (
		(Transition && Transition.running && ((s.state = 0), (s.tState = r)),
		null === Owner ||
			(Owner !== UNOWNED &&
				(Transition && Transition.running && Owner.pure
					? Owner.tOwned
						? Owner.tOwned.push(s)
						: (Owner.tOwned = [s])
					: Owner.owned
						? Owner.owned.push(s)
						: (Owner.owned = [s]))),
		ExternalSourceConfig && s.fn)
	) {
		const [e, n] = createSignal(void 0, { equals: !1 }),
			t = ExternalSourceConfig.factory(s.fn, n);
		onCleanup(() => t.dispose());
		const r = () => startTransition(n).then(() => o.dispose()),
			o = ExternalSourceConfig.factory(s.fn, r);
		s.fn = (n) => (
			e(), Transition && Transition.running ? o.track(n) : t.track(n)
		);
	}
	return s;
}
function runTop(e) {
	const n = Transition && Transition.running;
	if (0 === (n ? e.tState : e.state)) return;
	if ((n ? e.tState : e.state) === PENDING) return lookUpstream(e);
	if (e.suspense && untrack(e.suspense.inFallback))
		return e.suspense.effects.push(e);
	const t = [e];
	for (; (e = e.owner) && (!e.updatedAt || e.updatedAt < ExecCount); ) {
		if (n && Transition.disposed.has(e)) return;
		(n ? e.tState : e.state) && t.push(e);
	}
	for (let r = t.length - 1; r >= 0; r--) {
		if (((e = t[r]), n)) {
			let n = e,
				o = t[r + 1];
			for (; (n = n.owner) && n !== o; )
				if (Transition.disposed.has(n)) return;
		}
		if ((n ? e.tState : e.state) === STALE) updateComputation(e);
		else if ((n ? e.tState : e.state) === PENDING) {
			const n = Updates;
			(Updates = null),
				runUpdates(() => lookUpstream(e, t[0]), !1),
				(Updates = n);
		}
	}
}
function runUpdates(e, n) {
	if (Updates) return e();
	let t = !1;
	n || (Updates = []), Effects ? (t = !0) : (Effects = []), ExecCount++;
	try {
		const n = e();
		return completeUpdates(t), n;
	} catch (e) {
		t || (Effects = null), (Updates = null), handleError(e);
	}
}
function completeUpdates(e) {
	if (
		(Updates &&
			(Scheduler && Transition && Transition.running
				? scheduleQueue(Updates)
				: runQueue(Updates),
			(Updates = null)),
		e)
	)
		return;
	let n;
	if (Transition)
		if (Transition.promises.size || Transition.queue.size) {
			if (Transition.running)
				return (
					(Transition.running = !1),
					Transition.effects.push.apply(Transition.effects, Effects),
					(Effects = null),
					void setTransPending(!0)
				);
		} else {
			const e = Transition.sources,
				t = Transition.disposed;
			Effects.push.apply(Effects, Transition.effects),
				(n = Transition.resolve);
			for (const e of Effects)
				"tState" in e && (e.state = e.tState), delete e.tState;
			(Transition = null),
				runUpdates(() => {
					for (const e of t) cleanNode(e);
					for (const n of e) {
						if (((n.value = n.tValue), n.owned))
							for (let e = 0, t = n.owned.length; e < t; e++)
								cleanNode(n.owned[e]);
						n.tOwned && (n.owned = n.tOwned),
							delete n.tValue,
							delete n.tOwned,
							(n.tState = 0);
					}
					setTransPending(!1);
				}, !1);
		}
	const t = Effects;
	(Effects = null), t.length && runUpdates(() => runEffects(t), !1), n && n();
}
function runQueue(e) {
	for (let n = 0; n < e.length; n++) runTop(e[n]);
}
function scheduleQueue(e) {
	for (let n = 0; n < e.length; n++) {
		const t = e[n],
			r = Transition.queue;
		r.has(t) ||
			(r.add(t),
			Scheduler(() => {
				r.delete(t),
					runUpdates(() => {
						(Transition.running = !0), runTop(t);
					}, !1),
					Transition && (Transition.running = !1);
			}));
	}
}
function runUserEffects(e) {
	let n,
		t = 0;
	for (n = 0; n < e.length; n++) {
		const r = e[n];
		r.user ? (e[t++] = r) : runTop(r);
	}
	if (sharedConfig.context) {
		if (sharedConfig.count)
			return (
				sharedConfig.effects || (sharedConfig.effects = []),
				void sharedConfig.effects.push(...e.slice(0, t))
			);
		sharedConfig.effects &&
			((e = [...sharedConfig.effects, ...e]),
			(t += sharedConfig.effects.length),
			delete sharedConfig.effects),
			setHydrateContext();
	}
	for (n = 0; n < t; n++) runTop(e[n]);
}
function lookUpstream(e, n) {
	const t = Transition && Transition.running;
	t ? (e.tState = 0) : (e.state = 0);
	for (let r = 0; r < e.sources.length; r += 1) {
		const o = e.sources[r];
		if (o.sources) {
			const e = t ? o.tState : o.state;
			e === STALE
				? o !== n &&
					(!o.updatedAt || o.updatedAt < ExecCount) &&
					runTop(o)
				: e === PENDING && lookUpstream(o, n);
		}
	}
}
function markDownstream(e) {
	const n = Transition && Transition.running;
	for (let t = 0; t < e.observers.length; t += 1) {
		const r = e.observers[t];
		(n ? r.tState : r.state) ||
			(n ? (r.tState = PENDING) : (r.state = PENDING),
			r.pure ? Updates.push(r) : Effects.push(r),
			r.observers && markDownstream(r));
	}
}
function cleanNode(e) {
	let n;
	if (e.sources)
		for (; e.sources.length; ) {
			const n = e.sources.pop(),
				t = e.sourceSlots.pop(),
				r = n.observers;
			if (r && r.length) {
				const e = r.pop(),
					o = n.observerSlots.pop();
				t < r.length &&
					((e.sourceSlots[o] = t),
					(r[t] = e),
					(n.observerSlots[t] = o));
			}
		}
	if (Transition && Transition.running && e.pure) {
		if (e.tOwned) {
			for (n = e.tOwned.length - 1; n >= 0; n--) cleanNode(e.tOwned[n]);
			delete e.tOwned;
		}
		reset(e, !0);
	} else if (e.owned) {
		for (n = e.owned.length - 1; n >= 0; n--) cleanNode(e.owned[n]);
		e.owned = null;
	}
	if (e.cleanups) {
		for (n = e.cleanups.length - 1; n >= 0; n--) e.cleanups[n]();
		e.cleanups = null;
	}
	Transition && Transition.running ? (e.tState = 0) : (e.state = 0);
}
function reset(e, n) {
	if ((n || ((e.tState = 0), Transition.disposed.add(e)), e.owned))
		for (let n = 0; n < e.owned.length; n++) reset(e.owned[n]);
}
function castError(e) {
	return e instanceof Error
		? e
		: new Error("string" == typeof e ? e : "Unknown error", { cause: e });
}
function runErrors(e, n, t) {
	try {
		for (const t of n) t(e);
	} catch (e) {
		handleError(e, (t && t.owner) || null);
	}
}
function handleError(e, n = Owner) {
	const t = ERROR && n && n.context && n.context[ERROR],
		r = castError(e);
	if (!t) throw r;
	Effects
		? Effects.push({
				fn() {
					runErrors(r, t, n);
				},
				state: STALE,
			})
		: runErrors(r, t, n);
}
function resolveChildren(e) {
	if ("function" == typeof e && !e.length) return resolveChildren(e());
	if (Array.isArray(e)) {
		const n = [];
		for (let t = 0; t < e.length; t++) {
			const r = resolveChildren(e[t]);
			Array.isArray(r) ? n.push.apply(n, r) : n.push(r);
		}
		return n;
	}
	return e;
}
function createProvider(e, n) {
	return function (n) {
		let t;
		return (
			createRenderEffect(
				() =>
					(t = untrack(
						() => (
							(Owner.context = {
								...Owner.context,
								[e]: n.value,
							}),
							children(() => n.children)
						),
					)),
				void 0,
			),
			t
		);
	};
}
function onError(e) {
	ERROR || (ERROR = Symbol("error")),
		null === Owner ||
			(null !== Owner.context && Owner.context[ERROR]
				? Owner.context[ERROR].push(e)
				: ((Owner.context = { ...Owner.context, [ERROR]: [e] }),
					mutateContext(Owner, ERROR, [e])));
}
function mutateContext(e, n, t) {
	if (e.owned)
		for (let r = 0; r < e.owned.length; r++)
			e.owned[r].context === e.context && mutateContext(e.owned[r], n, t),
				e.owned[r].context
					? e.owned[r].context[n] ||
						((e.owned[r].context[n] = t),
						mutateContext(e.owned[r], n, t))
					: ((e.owned[r].context = e.context),
						mutateContext(e.owned[r], n, t));
}
function observable(e) {
	return {
		subscribe(n) {
			if (!(n instanceof Object) || null == n)
				throw new TypeError("Expected the observer to be an object.");
			const t = "function" == typeof n ? n : n.next && n.next.bind(n);
			if (!t) return { unsubscribe() {} };
			const r = createRoot(
				(n) => (
					createEffect(() => {
						const n = e();
						untrack(() => t(n));
					}),
					n
				),
			);
			return (
				getOwner() && onCleanup(r),
				{
					unsubscribe() {
						r();
					},
				}
			);
		},
		[Symbol.observable || "@@observable"]() {
			return this;
		},
	};
}
function from(e) {
	const [n, t] = createSignal(void 0, { equals: !1 });
	if ("subscribe" in e) {
		const n = e.subscribe((e) => t(() => e));
		onCleanup(() => ("unsubscribe" in n ? n.unsubscribe() : n()));
	} else {
		onCleanup(e(t));
	}
	return n;
}
const FALLBACK = Symbol("fallback");
function dispose(e) {
	for (let n = 0; n < e.length; n++) e[n]();
}
function mapArray(e, n, t = {}) {
	let r = [],
		o = [],
		s = [],
		i = 0,
		a = n.length > 1 ? [] : null;
	return (
		onCleanup(() => dispose(s)),
		() => {
			let u,
				c,
				l = e() || [];
			return (
				l[$TRACK],
				untrack(() => {
					let e,
						n,
						f,
						p,
						h,
						g,
						C,
						w,
						T,
						S = l.length;
					if (0 === S)
						0 !== i &&
							(dispose(s),
							(s = []),
							(r = []),
							(o = []),
							(i = 0),
							a && (a = [])),
							t.fallback &&
								((r = [FALLBACK]),
								(o[0] = createRoot(
									(e) => ((s[0] = e), t.fallback()),
								)),
								(i = 1));
					else if (0 === i) {
						for (o = new Array(S), c = 0; c < S; c++)
							(r[c] = l[c]), (o[c] = createRoot(d));
						i = S;
					} else {
						for (
							f = new Array(S),
								p = new Array(S),
								a && (h = new Array(S)),
								g = 0,
								C = Math.min(i, S);
							g < C && r[g] === l[g];
							g++
						);
						for (
							C = i - 1, w = S - 1;
							C >= g && w >= g && r[C] === l[w];
							C--, w--
						)
							(f[w] = o[C]), (p[w] = s[C]), a && (h[w] = a[C]);
						for (
							e = new Map(), n = new Array(w + 1), c = w;
							c >= g;
							c--
						)
							(T = l[c]),
								(u = e.get(T)),
								(n[c] = void 0 === u ? -1 : u),
								e.set(T, c);
						for (u = g; u <= C; u++)
							(T = r[u]),
								(c = e.get(T)),
								void 0 !== c && -1 !== c
									? ((f[c] = o[u]),
										(p[c] = s[u]),
										a && (h[c] = a[u]),
										(c = n[c]),
										e.set(T, c))
									: s[u]();
						for (c = g; c < S; c++)
							c in f
								? ((o[c] = f[c]),
									(s[c] = p[c]),
									a && ((a[c] = h[c]), a[c](c)))
								: (o[c] = createRoot(d));
						(o = o.slice(0, (i = S))), (r = l.slice(0));
					}
					return o;
				})
			);
			function d(e) {
				if (((s[c] = e), a)) {
					const [e, t] = createSignal(c);
					return (a[c] = t), n(l[c], e);
				}
				return n(l[c]);
			}
		}
	);
}
function indexArray(e, n, t = {}) {
	let r,
		o = [],
		s = [],
		i = [],
		a = [],
		u = 0;
	return (
		onCleanup(() => dispose(i)),
		() => {
			const c = e() || [];
			return (
				c[$TRACK],
				untrack(() => {
					if (0 === c.length)
						return (
							0 !== u &&
								(dispose(i),
								(i = []),
								(o = []),
								(s = []),
								(u = 0),
								(a = [])),
							t.fallback &&
								((o = [FALLBACK]),
								(s[0] = createRoot(
									(e) => ((i[0] = e), t.fallback()),
								)),
								(u = 1)),
							s
						);
					for (
						o[0] === FALLBACK &&
							(i[0](), (i = []), (o = []), (s = []), (u = 0)),
							r = 0;
						r < c.length;
						r++
					)
						r < o.length && o[r] !== c[r]
							? a[r](() => c[r])
							: r >= o.length && (s[r] = createRoot(l));
					for (; r < o.length; r++) i[r]();
					return (
						(u = a.length = i.length = c.length),
						(o = c.slice(0)),
						(s = s.slice(0, u))
					);
				})
			);
			function l(e) {
				i[r] = e;
				const [t, o] = createSignal(c[r]);
				return (a[r] = o), n(t, r);
			}
		}
	);
}
let hydrationEnabled = !1;
function enableHydration() {
	hydrationEnabled = !0;
}
function createComponent(e, n) {
	if (hydrationEnabled && sharedConfig.context) {
		const t = sharedConfig.context;
		setHydrateContext(nextHydrateContext());
		const r = untrack(() => e(n || {}));
		return setHydrateContext(t), r;
	}
	return untrack(() => e(n || {}));
}
function trueFn() {
	return !0;
}
const propTraps = {
	get: (e, n, t) => (n === $PROXY ? t : e.get(n)),
	has: (e, n) => n === $PROXY || e.has(n),
	set: trueFn,
	deleteProperty: trueFn,
	getOwnPropertyDescriptor: (e, n) => ({
		configurable: !0,
		enumerable: !0,
		get: () => e.get(n),
		set: trueFn,
		deleteProperty: trueFn,
	}),
	ownKeys: (e) => e.keys(),
};
function resolveSource(e) {
	return (e = "function" == typeof e ? e() : e) ? e : {};
}
function resolveSources() {
	for (let e = 0, n = this.length; e < n; ++e) {
		const n = this[e]();
		if (void 0 !== n) return n;
	}
}
function mergeProps(...e) {
	let n = !1;
	for (let t = 0; t < e.length; t++) {
		const r = e[t];
		(n = n || (!!r && $PROXY in r)),
			(e[t] = "function" == typeof r ? ((n = !0), createMemo(r)) : r);
	}
	if (n)
		return new Proxy(
			{
				get(n) {
					for (let t = e.length - 1; t >= 0; t--) {
						const r = resolveSource(e[t])[n];
						if (void 0 !== r) return r;
					}
				},
				has(n) {
					for (let t = e.length - 1; t >= 0; t--)
						if (n in resolveSource(e[t])) return !0;
					return !1;
				},
				keys() {
					const n = [];
					for (let t = 0; t < e.length; t++)
						n.push(...Object.keys(resolveSource(e[t])));
					return [...new Set(n)];
				},
			},
			propTraps,
		);
	const t = {},
		r = Object.create(null);
	for (let n = e.length - 1; n >= 0; n--) {
		const o = e[n];
		if (!o) continue;
		const s = Object.getOwnPropertyNames(o);
		for (let e = s.length - 1; e >= 0; e--) {
			const n = s[e];
			if ("__proto__" === n || "constructor" === n) continue;
			const i = Object.getOwnPropertyDescriptor(o, n);
			if (r[n]) {
				const e = t[n];
				e &&
					(i.get
						? e.push(i.get.bind(o))
						: void 0 !== i.value && e.push(() => i.value));
			} else
				r[n] = i.get
					? {
							enumerable: !0,
							configurable: !0,
							get: resolveSources.bind((t[n] = [i.get.bind(o)])),
						}
					: void 0 !== i.value
						? i
						: void 0;
		}
	}
	const o = {},
		s = Object.keys(r);
	for (let e = s.length - 1; e >= 0; e--) {
		const n = s[e],
			t = r[n];
		t && t.get
			? Object.defineProperty(o, n, t)
			: (o[n] = t ? t.value : void 0);
	}
	return o;
}
function splitProps(e, ...n) {
	if ($PROXY in e) {
		const t = new Set(n.length > 1 ? n.flat() : n[0]),
			r = n.map(
				(n) =>
					new Proxy(
						{
							get: (t) => (n.includes(t) ? e[t] : void 0),
							has: (t) => n.includes(t) && t in e,
							keys: () => n.filter((n) => n in e),
						},
						propTraps,
					),
			);
		return (
			r.push(
				new Proxy(
					{
						get: (n) => (t.has(n) ? void 0 : e[n]),
						has: (n) => !t.has(n) && n in e,
						keys: () => Object.keys(e).filter((e) => !t.has(e)),
					},
					propTraps,
				),
			),
			r
		);
	}
	const t = {},
		r = n.map(() => ({}));
	for (const o of Object.getOwnPropertyNames(e)) {
		const s = Object.getOwnPropertyDescriptor(e, o),
			i =
				!s.get &&
				!s.set &&
				s.enumerable &&
				s.writable &&
				s.configurable;
		let a = !1,
			u = 0;
		for (const e of n)
			e.includes(o) &&
				((a = !0),
				i ? (r[u][o] = s.value) : Object.defineProperty(r[u], o, s)),
				++u;
		a || (i ? (t[o] = s.value) : Object.defineProperty(t, o, s));
	}
	return [...r, t];
}
function lazy(e) {
	let n, t;
	const r = (r) => {
		const o = sharedConfig.context;
		if (o) {
			const [r, s] = createSignal();
			sharedConfig.count || (sharedConfig.count = 0),
				sharedConfig.count++,
				(t || (t = e())).then((e) => {
					setHydrateContext(o),
						sharedConfig.count--,
						s(() => e.default),
						setHydrateContext();
				}),
				(n = r);
		} else if (!n) {
			const [r] = createResource(() =>
				(t || (t = e())).then((e) => e.default),
			);
			n = r;
		}
		let s;
		return createMemo(
			() =>
				(s = n()) &&
				untrack(() => {
					if (!o) return s(r);
					const e = sharedConfig.context;
					setHydrateContext(o);
					const n = s(r);
					return setHydrateContext(e), n;
				}),
		);
	};
	return (
		(r.preload = () =>
			t || ((t = e()).then((e) => (n = () => e.default)), t)),
		r
	);
}
let counter = 0;
function createUniqueId() {
	const e = sharedConfig.context;
	return e ? `${e.id}${e.count++}` : "cl-" + counter++;
}
const narrowedError = (e) => `Stale read from <${e}>.`;
function For(e) {
	const n = "fallback" in e && { fallback: () => e.fallback };
	return createMemo(mapArray(() => e.each, e.children, n || void 0));
}
function Index(e) {
	const n = "fallback" in e && { fallback: () => e.fallback };
	return createMemo(indexArray(() => e.each, e.children, n || void 0));
}
function Show(e) {
	const n = e.keyed,
		t = createMemo(() => e.when, void 0, {
			equals: (e, t) => (n ? e === t : !e == !t),
		});
	return createMemo(
		() => {
			const r = t();
			if (r) {
				const o = e.children;
				return "function" == typeof o && o.length > 0
					? untrack(() =>
							o(
								n
									? r
									: () => {
											if (!untrack(t))
												throw narrowedError("Show");
											return e.when;
										},
							),
						)
					: o;
			}
			return e.fallback;
		},
		void 0,
		void 0,
	);
}
function Switch(e) {
	let n = !1;
	const t = children(() => e.children),
		r = createMemo(
			() => {
				let e = t();
				Array.isArray(e) || (e = [e]);
				for (let t = 0; t < e.length; t++) {
					const r = e[t].when;
					if (r) return (n = !!e[t].keyed), [t, r, e[t]];
				}
				return [-1];
			},
			void 0,
			{
				equals: (e, t) =>
					(n ? e[1] === t[1] : !e[1] == !t[1]) && e[2] === t[2],
			},
		);
	return createMemo(
		() => {
			const [t, o, s] = r();
			if (t < 0) return e.fallback;
			const i = s.children;
			return "function" == typeof i && i.length > 0
				? untrack(() =>
						i(
							n
								? o
								: () => {
										if (untrack(r)[0] !== t)
											throw narrowedError("Match");
										return s.when;
									},
						),
					)
				: i;
		},
		void 0,
		void 0,
	);
}
function Match(e) {
	return e;
}
let Errors;
function resetErrorBoundaries() {
	Errors && [...Errors].forEach((e) => e());
}
function ErrorBoundary(e) {
	let n;
	sharedConfig.context &&
		sharedConfig.load &&
		(n = sharedConfig.load(
			sharedConfig.context.id + sharedConfig.context.count,
		));
	const [t, r] = createSignal(n, void 0);
	return (
		Errors || (Errors = new Set()),
		Errors.add(r),
		onCleanup(() => Errors.delete(r)),
		createMemo(
			() => {
				let n;
				if ((n = t())) {
					const t = e.fallback;
					return "function" == typeof t && t.length
						? untrack(() => t(n, () => r()))
						: t;
				}
				return catchError(() => e.children, r);
			},
			void 0,
			void 0,
		)
	);
}
const suspenseListEquals = (e, n) =>
		e.showContent === n.showContent && e.showFallback === n.showFallback,
	SuspenseListContext = createContext();
function SuspenseList(e) {
	let n,
		[t, r] = createSignal(() => ({ inFallback: !1 }));
	const o = useContext(SuspenseListContext),
		[s, i] = createSignal([]);
	o && (n = o.register(createMemo(() => t()().inFallback)));
	const a = createMemo(
		(t) => {
			const r = e.revealOrder,
				o = e.tail,
				{ showContent: i = !0, showFallback: a = !0 } = n ? n() : {},
				u = s(),
				c = "backwards" === r;
			if ("together" === r) {
				const e = u.every((e) => !e()),
					n = u.map(() => ({ showContent: e && i, showFallback: a }));
				return (n.inFallback = !e), n;
			}
			let l = !1,
				d = t.inFallback;
			const f = [];
			for (let e = 0, n = u.length; e < n; e++) {
				const t = c ? n - e - 1 : e,
					r = u[t]();
				if (l || r) {
					const e = !l;
					e && (d = !0),
						(f[t] = {
							showContent: e,
							showFallback:
								!(o && (!e || "collapsed" !== o)) && a,
						}),
						(l = !0);
				} else f[t] = { showContent: i, showFallback: a };
			}
			return l || (d = !1), (f.inFallback = d), f;
		},
		{ inFallback: !1 },
	);
	return (
		r(() => a),
		createComponent(SuspenseListContext.Provider, {
			value: {
				register: (e) => {
					let n;
					return (
						i((t) => ((n = t.length), [...t, e])),
						createMemo(() => a()[n], void 0, {
							equals: suspenseListEquals,
						})
					);
				},
			},
			get children() {
				return e.children;
			},
		})
	);
}
function Suspense(e) {
	let n,
		t,
		r,
		o,
		s,
		i = 0;
	const [a, u] = createSignal(!1),
		c = getSuspenseContext(),
		l = {
			increment: () => {
				1 == ++i && u(!0);
			},
			decrement: () => {
				0 == --i && u(!1);
			},
			inFallback: a,
			effects: [],
			resolved: !1,
		},
		d = getOwner();
	if (sharedConfig.context && sharedConfig.load) {
		const e = sharedConfig.context.id + sharedConfig.context.count;
		let n = sharedConfig.load(e);
		if (
			(n &&
				("object" != typeof n || "success" !== n.status
					? (r = n)
					: sharedConfig.gather(e)),
			r && "$$f" !== r)
		) {
			const [n, i] = createSignal(void 0, { equals: !1 });
			(o = n),
				r.then(
					() => {
						if (sharedConfig.done) return i();
						sharedConfig.gather(e),
							setHydrateContext(t),
							i(),
							setHydrateContext();
					},
					(e) => {
						(s = e), i();
					},
				);
		}
	}
	const f = useContext(SuspenseListContext);
	let p;
	return (
		f && (n = f.register(l.inFallback)),
		onCleanup(() => p && p()),
		createComponent(c.Provider, {
			value: l,
			get children() {
				return createMemo(() => {
					if (s) throw s;
					if (((t = sharedConfig.context), o))
						return o(), (o = void 0);
					t && "$$f" === r && setHydrateContext();
					const i = createMemo(() => e.children);
					return createMemo((o) => {
						const s = l.inFallback(),
							{ showContent: a = !0, showFallback: u = !0 } = n
								? n()
								: {};
						return (!s || (r && "$$f" !== r)) && a
							? ((l.resolved = !0),
								p && p(),
								(p = t = r = void 0),
								resumeEffects(l.effects),
								i())
							: u
								? p
									? o
									: createRoot(
											(n) => (
												(p = n),
												t &&
													(setHydrateContext({
														id: t.id + "f",
														count: 0,
													}),
													(t = void 0)),
												e.fallback
											),
											d,
										)
								: void 0;
					});
				});
			},
		})
	);
}
const DEV = void 0;
export {
	$DEVCOMP,
	$PROXY,
	$TRACK,
	DEV,
	ErrorBoundary,
	For,
	Index,
	Match,
	Show,
	Suspense,
	SuspenseList,
	Switch,
	batch,
	cancelCallback,
	catchError,
	children,
	createComponent,
	createComputed,
	createContext,
	createDeferred,
	createEffect,
	createMemo,
	createReaction,
	createRenderEffect,
	createResource,
	createRoot,
	createSelector,
	createSignal,
	createUniqueId,
	enableExternalSource,
	enableHydration,
	enableScheduling,
	equalFn,
	from,
	getListener,
	getOwner,
	indexArray,
	lazy,
	mapArray,
	mergeProps,
	observable,
	on,
	onCleanup,
	onError,
	onMount,
	requestCallback,
	resetErrorBoundaries,
	runWithOwner,
	sharedConfig,
	splitProps,
	startTransition,
	untrack,
	useContext,
	useTransition,
};
