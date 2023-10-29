import {useEffect, useState} from 'react';
import {useThrottle} from '@hooks/use-throttle';

/**
 * Utilize the device size throughout your application. This function provides the device's width and height and can be throttled to control size change.
 * @param {number} throttle - The number in milliseconds to throttle size change. Defaults to 0.
 * @returns {object} An object containing the device's width and height.
 * @example
 * ```jsx
 * import { useDeviceSize } from 'alistair/hooks';
 *
 * function App() {
 *     const { width, height } = useDeviceSize(100);
 *
 *     return (
 *         <>
 *             <div>Device Size: {width}x{height}</div>
 *         </>
 *     );
 * }
 * ```
 */

export function useDeviceSize(throttle?: number): {width: number; height: number} {
	const [Size, setSize] = useState<[number, number]>([0, 0]);
	const ThrottledSize = useThrottle(Size, throttle ?? 0);

	useEffect(() => {
		const handleResize = (e: Event) => {
			const {innerWidth, innerHeight} = e.target as Window;
			setSize([innerWidth, innerHeight]);
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return {width: ThrottledSize.at(0) ?? 0, height: ThrottledSize.at(1) ?? 0};
}
