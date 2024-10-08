import * as react from 'react';
import {useEvent, useLazyRef} from '../hooks';

export function createStrictContext<T>(defaultValue: T | null = null) {
	const context = react.createContext<T | null>(defaultValue);

	function Provider({value, children}: react.PropsWithChildren<{value: T}>) {
		return <context.Provider value={value}>{children}</context.Provider>;
	}

	function useContext() {
		const value = react.useContext(context);

		if (value === null) {
			throw new Error('useContext() must be used within a <Provider />');
		}

		return value;
	}

	return {
		useContext,
		Provider,
	};
}

/**
 * @beta This API is in beta and may change at any time
 * @private
 */
export interface StoreContextValue<T> {
	set: (next: T) => void;
	get: () => T;
	subscribe: (listener: () => void) => () => void;
}

/**
 * @beta This API is in beta and may change at any time
 * @private
 */
export function createStoreContext<T>() {
	const context = createStrictContext<StoreContextValue<T>>();

	const identity = (value: T): T => value;

	function Provider({value, children}: react.PropsWithChildren<{value: T}>) {
		const store = useLazyRef(() => {
			let val = value;

			const listeners = new Set<() => void>();

			const notify = () => {
				for (const listener of listeners) {
					listener();
				}
			};

			const set = (next: T) => {
				val = next;
				notify();
			};

			const subscribe = (listener: () => void) => {
				listeners.add(listener);

				return () => {
					listeners.delete(listener);
				};
			};

			const get = () => val;

			return {
				subscribe,
				set,
				get,
			};
		});

		react.useEffect(() => {
			store.current.set(value);
		}, [value]);

		return <context.Provider value={store.current}>{children}</context.Provider>;
	}

	function useSelectContext<Next = T>(
		selector: (value: T) => Next = identity as never,
		dependencies: react.DependencyList = [],
	) {
		const store = context.useContext();

		const cache = react.useMemo<react.MutableRefObject<[state: T, result: Next] | null>>(
			() => ({current: null}),
			dependencies,
		);

		const subscribe = react.useCallback(
			(listener: () => void) => store.subscribe(listener),
			dependencies,
		);

		const getSnapshot = () => {
			const state = store.get();

			if (cache.current && cache.current[0] === state) {
				return cache.current[1];
			}

			const next = selector(state);
			cache.current = [state as Exclude<T, WeakKey>, next];

			return next;
		};

		const slice = react.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

		react.useDebugValue(slice);

		return slice;
	}

	return {
		Provider,
		useSelectContext,
	};
}

export function useCacheSelector() {
	const cache = useLazyRef(() => new WeakMap<{}, {} | null>());

	return <Prev extends {}, Out extends {} | null>(compute: (prev: Prev) => Out) => {
		const stable = useEvent(compute);

		return react.useCallback(
			(prev: Prev): Out => {
				const cached = cache.current.get(prev) as Out | undefined;

				if (cached !== undefined) {
					return cached;
				}

				const next = stable(prev);
				cache.current.set(prev, next);

				return next;
			},
			[stable],
		);
	};
}
