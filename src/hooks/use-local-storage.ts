import {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from 'react';

/**
 * Use a value from local storage, with a setter. Will trigger updates wherever the same key is used around your app, and even works cross tab.
 * @param key The key to store data under
 * @param init An initialiser if the key does not already exist
 * @returns A tuple containing the value from local storage, synced across tabs, as well as a setter to update the value.
 * @example
 * ```tsx
 *  import {useLocalStorage} from 'alistair/hooks';
 *
 *  function useCounter() {
 *      return useLocalStorage('counter', () => 1);
 *  }
 *
 *  function Child() {
 *      const [value] = useCounter();
 *
 *      // This will update no matter where it changes!
 *      // This can include modifying it in dev tools, or changing it in another tab with the hook.
 *      // It will **always** stay in sync
 *      return <div>{value}</div>;
 *  }
 *
 *  function App() {
 *      const [, set] = useCounter();
 *
 *      return (
 *          <>
 *              <button onClick={() => set(old => old + 1)}>click</button>
 *              <Child />
 *              <Child />
 *          </>
 *      );
 *  }
 * ```
 */
export function useLocalStorage<T>(
	key: string,
	init: () => T,
): [value: T, set: Dispatch<SetStateAction<T>>] {
	const stableInit = useRef(init);

	useEffect(() => {
		stableInit.current = init;
	}, [init]);

	const write = useCallback(
		(value: T) => {
			window.localStorage.setItem(key, JSON.stringify(value));
			return value;
		},
		[key],
	);

	const getOrInit = useCallback(() => {
		if (typeof window === 'undefined') {
			return stableInit.current();
		}

		const value = window.localStorage.getItem(key);

		if (value === null) {
			const initialised = stableInit.current();
			return write(initialised);
		}

		return JSON.parse(value) as T;
	}, [key, write]);

	const [value, setValue] = useState<T>(() => getOrInit());

	const notify = useCallback(() => {
		setValue(getOrInit());
	}, []);

	useEffect(() => {
		const listener = (event: StorageEvent) => {
			if (event.key === key) {
				notify();
			}
		};

		window.addEventListener('storage', listener);

		return () => {
			window.removeEventListener('storage', listener);
		};
	}, []);

	const set = useCallback(
		(action: React.SetStateAction<T>) => {
			const current = getOrInit();

			let next;

			if (action instanceof Function) {
				next = write(action(current));
			} else {
				next = write(action);
			}

			window.dispatchEvent(
				new StorageEvent('storage', {
					key,
					oldValue: JSON.stringify(current),
					newValue: JSON.stringify(next),
					storageArea: window.localStorage,
					url: window.location.href,
				}),
			);
		},
		[getOrInit, write],
	);

	return [value, set];
}
