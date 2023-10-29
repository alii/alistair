import {useSyncExternalStore} from 'react';

/**
 * Detects if the browser is currently online
 * @returns If the client is currently only. Returns false on the server
 */
export function useIsOnline() {
	return useSyncExternalStore(
		notify => {
			window.addEventListener('online', notify);
			window.addEventListener('offline', notify);

			return () => {
				window.removeEventListener('online', notify);
				window.removeEventListener('offline', notify);
			};
		},
		() => navigator.onLine,
		() => false,
	);
}
