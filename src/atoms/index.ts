import {
	DependencyList,
	MutableRefObject,
	useCallback,
	useEffect,
	useMemo,
	useSyncExternalStore,
	type Dispatch,
	type SetStateAction,
} from 'react';
import {useEvent} from '../hooks/use-event';

export interface Atom<out T, in out W> {
	/**
	 * Gets a value from the atom
	 * @returns The current value of the atom
	 */
	get: () => T;

	/**
	 * The setter function for the atom
	 */
	set: Dispatch<W>;

	/**
	 * Subscribes to the atom, and fires a callback when the atom changes
	 * @param notify A callback that will be fired when the atom changes, passes the new value
	 * @returns A function to unsubscribe from the atom
	 */
	subscribe: (notify: (value: T) => void) => () => void;
}

export function atom<T>(initialValue?: T): Atom<T, SetStateAction<T>> {
	let state: {initialized: false} | {initialized: true; value: T} =
		initialValue === undefined ? {initialized: false} : {initialized: true, value: initialValue};

	const subscriptions = new Set<(value: T) => void>();

	const get = (): T => {
		if (!state.initialized) {
			throw new Error('Cannot read an atom that is uninitialized');
		}

		return state.value;
	};

	const notify = (value: T) => {
		for (const notify of subscriptions) {
			notify(value);
		}
	};

	const set = (next: SetStateAction<T>) => {
		const current = get();
		const resolved = next instanceof Function ? next(current) : next;

		if (Object.is(resolved, current)) {
			return;
		}

		state = {initialized: true, value: resolved};

		notify(resolved);
	};

	return {
		get,
		set,

		subscribe: (callback: (value: T) => void) => {
			subscriptions.add(callback);

			return () => {
				subscriptions.delete(callback);
			};
		},
	};
}

/**
 * Creates an atom with a writable interface. This is a more of an advanced API, and should only be reached for
 * if you need logic that is more complex than what `atom` provides.
 * @param init A value to initialize the atom with
 * @param toAction A function that takes the next value and returns the next state or a function that takes the previous state and returns the next state
 * @returns An atom with a writable interface
 *
 * @example
 * ```ts
 * function atomWithUpdatedAt<T>(initialValue: T) {
 * 	// First generic is the value when read, second is the value to be set
 * 	return writable<{value: T; updatedAt: number}, T>(
 * 		// Initial value:
 * 		{value: initialValue, updatedAt: Date.now()},
 *
 * 		// Calculate the next state
 * 		next => ({value: next, updatedAt: Date.now()}),
 * 	);
 * }
 *
 * const atom = atomWithUpdatedAt(0);
 *
 * atom.get(); // {value: 0, updatedAt: <timestamp>}
 *
 * ```
 *
 * You can even take this a futher and write a reducer pattern, since the reducer has to return a `SetStateAction` (allowing you to access previous state).
 *
 * ```ts
 * type Action = {type: 'increment'} | {type: 'decrement'} | {type: 'set'; value: number};
 *
 * function reducer(state: number, action: Action): number {
 * 	switch (action.type) {
 * 		case 'increment':
 * 			return state + 1;
 * 		case 'decrement':
 * 			return state - 1;
 * 		case 'set':
 * 			return action.value;
 * 	}
 * }
 *
 * // Must pass `<number, Action>` type arguments
 * const atom = writable<number, Action>(0, next => old => reducer(old, next));
 *
 * atom.set({type: 'increment'});
 * atom.get(); // 1
 *
 * atom.set({type: 'set', value: 5});
 * atom.get(); // 5
 *
 * atom.set({type: 'decrement'});
 * atom.get(); // 4
 * ```
 */
export function writable<T, W = T>(init: T, toAction: (value: W) => SetStateAction<T>): Atom<T, W> {
	const a = atom<T>(init);

	return {
		get: a.get,
		set: next => {
			a.set(toAction(next));
		},
		subscribe: a.subscribe,
	};
}

/**
 * Hook to get the current value of an atom
 * @param atom The atom to consume
 * @returns The current value of the atom
 */
export function useAtomValue<T, W>(atom: Atom<T, W>): T {
	return useSyncExternalStore(atom.subscribe, atom.get, atom.get);
}

/**
 * Use the value of an atom
 * @param atom The atom to consume
 * @returns The current state of the atom, as well as a stable writer
 */
export function useAtom<T, W>(atom: Atom<T, W>): [value: T, write: Dispatch<W>] {
	return [useAtomValue(atom), atom.set];
}

/**
 * Get immediately notified when an atom's value changes
 * @param atom The atom to listen to
 * @param callback A callback that will be fired when the atom changes.
 */
export function useAtomDidChange<T, W>(atom: Atom<T, W>, callback: (value: T) => void) {
	const stable = useEvent(callback);

	useEffect(() => atom.subscribe(value => stable(value)), [atom]);
}

/**
 * Selects/computes a value from an atom, and re-renders the component when the selected value changes
 *
 * The selector function can be unstable, but the value it returns must be stable. This means you could do something like this
 * `const totalMessages = useSelectAtomValue(chatAtom, chat => chat.messages.length);`
 *
 * Or this is also okay, because you're not computing a new value, just selecting a value from the atom:
 * `const message = useSelectAtomValue(chatAtom, chat => chat.messages);`
 *
 * But NOT this, because the message array will be "new" every time the selector is called:
 * `const totalMessages = useSelectAtomValue(chatAtom, chat => [...chat.messages, "hello"]);`
 *
 * If you need to do something like that, you should use the `useSelectAtomValueAndMap` hook, which allows you to map the selected value to a new value and memoize it.
 *
 * @param atom The atom to select a value from-inherited from the atom
 * @param selector The selector function
 * @returns The selected value
 */
export function useSelectAtomValue<T, W, U>(
	atom: Atom<T, W>,
	selector: (atom: T) => U,
	dependencies: DependencyList = [],
): U {
	const cache = useMemo<MutableRefObject<[state: T, result: U] | null>>(
		() => ({current: null}),
		[atom, ...dependencies],
	);

	const subscribe = useCallback(
		(listener: () => void) => atom.subscribe(listener),
		[atom, ...dependencies],
	);

	const getSnapshot = () => {
		const state = atom.get();

		if (cache.current && cache.current[0] === state) {
			return cache.current[1];
		}

		const next = selector(state);
		cache.current = [state as Exclude<T, WeakKey>, next];

		return next;
	};

	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Selects a value from an atom, and maps it to a new value
 *
 * Warning: You shouldn't use this if your mapped value is a primitive as this hook is more expensive to
 * use than `useSelectAtomValue`. Returning a primitive is safe to do  with `useSelectAtomValue` because
 * primitives are always stable.
 *
 * @deprecated It's now recommended to use `useSelectAtomValue` instead
 *
 * @param atom The atom to select a value from
 * @param selector The selector function
 * @param mapper The mapper function
 * @returns The mapped value
 *
 * @example
 * ```ts
 * // This will only trigger a rerender when `chat.messages` changes. When it does change,
 * // the mapped value will be re-computed, and then returned. It will stay stable and not change
 * // on subsequent renders until `chat.messages` changes again. This means it is safe
 * // to use in a `useMemo` or `useEffect` dependency array.
 * const messagesWithHello = useSelectAtomValueAndMap(
 * 	chatAtom,
 *
 * 	// Only rerender when `chat.messages` changes...
 * 	chat => chat.messages,
 *
 * 	// ...and when it does, map the messages to include "hello" at the end
 * 	messages => [...messages, "hello"],
 * );
 * ```
 */
export function useSelectAtomValueAndMap<A, T, O, M>(
	atom: Atom<A, T>,
	selector: (atom: A) => O,
	mapper: (selected: O) => M,
) {
	const selected = useSelectAtomValue(atom, selector);
	const stableMapper = useEvent(mapper);

	return useMemo(() => stableMapper(selected), [selected]);
}
