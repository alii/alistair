import {useState, useEffect} from 'react';

/**
 * A hook to detect if the current tab is focused or not
 * @returns A boolean if the current tab is focused
 */
export function useTabFocused() {
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		// We're SSR!
		if (typeof document === 'undefined') {
			return;
		}

		setFocused(document.visibilityState === 'visible');

		const listener = () => {
			setFocused(document.visibilityState === 'visible');
		};

		document.addEventListener('visibilitychange', listener);

		return () => {
			document.removeEventListener('visibilitychange', listener);
		};
	}, []);

	return focused;
}
