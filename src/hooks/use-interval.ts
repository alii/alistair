import {useEffect, useRef} from 'react';

/**
 * A completely reactive hook to run a function on an interval
 * @param callback A callback to run on a set interval
 * @param delay The interval between each tick
 */
export function useInterval(
	callback: () => void,
	delay: number | null,
	options?: {
		runImmediately?: boolean;
	},
) {
	const runImmediately = options?.runImmediately ?? false;
	const savedCallback = useRef(callback);

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		if (delay === null) {
			return;
		}

		const tick = () => {
			savedCallback.current();
		};

		const id = setInterval(tick, delay);

		if (runImmediately) {
			tick();
		}

		return () => {
			clearInterval(id);
		};
	}, [delay]);
}
