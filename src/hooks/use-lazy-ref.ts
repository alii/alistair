import {useRef} from 'react';

// Opaque type that is not null
// (we want to be able to pass null as an init)
const SENTINEL = {};

/**
 * Creates a ref that can be initalized with a callback (lazily).
 * This is useful so we don't have to construct a class or call a function every time we
 * call this hook in a component as that could be costly.
 *
 * Inspiration is from https://github.com/facebook/react/issues/14490
 *
 * @param init Initial value
 * @returns A React ref that was initalized with `init`
 *
 * @example
 * const ref = useLazyRef(() => new MyExpensiveClass());
 * ref.current.doSomething();
 */
export function useLazyRef<T>(init: () => T) {
	const ref = useRef<T | typeof SENTINEL>(SENTINEL);

	if (ref.current === SENTINEL) {
		ref.current = init();
	}

	// Guarenteed to be a non-sentinel value
	// so the cast is safe :)
	return ref as React.MutableRefObject<T>;
}
