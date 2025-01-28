import {
	DependencyList,
	useCallback,
	useEffect,
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
 * The selector function can be unstable, but the value it returns should be stable. This means you could do something like this
 * `const totalMessages = useSelectAtomValue(chatAtom, chat => chat.messages.length);`
 *
 * Or this is also okay, because you're not computing a new value, just selecting a value from the atom:
 * `const message = useSelectAtomValue(chatAtom, chat => chat.messages);`
 *
 * But NOT this, because we make a new array every time the selector is called (which will trigger a re-render):
 * `const totalMessages = useSelectAtomValue(chatAtom, chat => [...chat.messages, "hello"]);`
 *
 * If you need this kind of behaviour, you should use this in combination with `useMemo`:
 *
 * ```ts
 * const messages = useSelectAtomValue(chatAtom, chat => chat.messages);
 * const mappedMessages = useMemo(() => [...messages, "hello"], [messages]);
 * ```
 *
 * @param atom The atom to select a value from-inherited from the atom
 * @param selector The selector function
 * @returns The selected value
 *
 * @example
 * ```ts
 * const messages = useSelectAtomValue(chatAtom, chat => chat.messages);
 * console.log('messages', messages);
 * ```
 */
export function useSelectAtomValue<T, W, U>(
	atom: Atom<T, W>,
	selector: (atom: T) => U,
	dependencies: DependencyList = [],
): U {
	const subscribe = useCallback(
		(notify: () => void) => atom.subscribe(notify),
		[atom, ...dependencies],
	);

	const getSnapshot = () => selector(atom.get());
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
