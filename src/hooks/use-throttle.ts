import {useEffect, useRef, useState} from 'react';

/**
 * Throttle a value to be updated at a maximum of once per `limit` milliseconds.
 * @param value The value to throttle
 * @param limit Milliseconds to throttle by
 * @returns The value after it has been throttled
 */
export function useThrottle<T>(value: T, limit = 1000) {
	const [throttledValue, setThrottledValue] = useState(value);
	const lastRan = useRef(Date.now());

	useEffect(() => {
		const handler = setTimeout(() => {
			if (Date.now() - lastRan.current >= limit) {
				setThrottledValue(value);
				lastRan.current = Date.now();
			}
		}, limit - (Date.now() - lastRan.current));

		return () => {
			clearTimeout(handler);
		};
	}, [value, limit]);

	return throttledValue;
}
