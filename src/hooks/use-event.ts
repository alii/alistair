import {useCallback, useLayoutEffect, useRef} from 'react';

// RFC Implentation:
// https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
// However, do note that this is not quite perfect, as noted in the RFC:
// > A high-fidelty polyfill for useEvent is not possible because there is no
// > lifecycle or Hook in React that we can use to switch .current at the right
// > timing. Although [this hook] is “close enough” for many cases, it doesn't
// > throw during rendering, and the timing isn’t quite right. We don’t recommend
// > to broadly adopt this pattern until there is a version of React that
// > includes a built -in useEvent implementation.

/**
 * Stabilise a function - useful to use as an event listener callback or similar
 * @param fn A function to completely stabilise
 * @returns A stable reference to the function, it will never change
 */
export function useEvent<Args extends unknown[], R>(
	fn: (...args: Args) => R,
): (...args: Args) => R {
	const ref = useRef(fn);

	useLayoutEffect(() => {
		ref.current = fn;
	}, [fn]);

	return useCallback((...args: Args) => ref.current(...args), []);
}
