import {useSyncExternalStore} from 'react';

/**
 * A hook to detect if the current tab is focused or not
 * @returns A boolean if the current tab is focused
 */
export function useIsTabFocused() {
	return useSyncExternalStore(
		notify => {
			const listener = () => {
				notify();
			};

			document.addEventListener('visibilitychange', listener);

			return () => {
				document.removeEventListener('visibilitychange', listener);
			};
		},
		() => document.visibilityState === 'visible',
		() => false,
	);
}

/**
 * @deprecated this has been renamed to `useIsTabFocused`
 */
export const useTabFocused = useIsTabFocused;
