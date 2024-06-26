import {useCallback, useRef, useState} from 'react';
import {useEvent} from './use-event';

export type UseAsyncFunctionState<R> = {
	loading: boolean;
	result: {type: 'initial'} | {type: 'success'; data: R} | {type: 'error'; error: unknown};
};

/**
 * Wraps an async function to provide state. Useful for mutations and form submissions.
 * Does NOT allow concurrent runs. You must wait for the previous run to finish before starting a new one.
 *
 * @param execute The async function to run and have state for
 * @returns The state of the last run, as well as a function to start new runs. The run function cannot be called if a previous run is in flight. The run function will return the result of the async function.
 *
 * @example
 * ```tsx
 * const [state, run] = useAsyncFunction(async (a: number, b: number) => {
 *     const result = await addingApi.add(a, b);
 *     return result;
 * });
 *
 * return (
 *     <>
 *         <button disabled={state.loading} onClick={() => run(1, 2)}>Run</button>
 *         {state.loading && <p>Loading...</p>}
 *         {state.type === 'success' && <p>Result: {state.data}</p>}
 *         {state.type === 'error' && <p>Error: {JSON.stringify(state.error)}</p>}
 *     </>
 * )
 * ```
 */
export function useAsyncFunction<A extends unknown[], R>(
	execute: (...args: A) => Promise<R>,
): [
	state: UseAsyncFunctionState<R>,
	run: (...args: A) => Promise<UseAsyncFunctionState<R>['result']>,
	reset: () => void,
] {
	const [state, setState] = useState<UseAsyncFunctionState<R>>({
		loading: false,
		result: {type: 'initial'},
	});

	const isInFlight = useRef(false);

	const run = useEvent(async (...args: A) => {
		if (isInFlight.current) {
			throw new Error('Cannot execute while currently in flight');
		}

		setState(old => ({...old, loading: true}));
		isInFlight.current = true;

		try {
			const data = await execute(...args);

			setState({
				loading: false,
				result: {
					type: 'success',
					data,
				},
			});

			return {
				type: 'success' as const,
				data,
			};
		} catch (error) {
			setState({
				loading: false,
				result: {
					type: 'error',
					error,
				},
			});

			return {
				type: 'error' as const,
				error,
			};
		} finally {
			// finally clause runs before try/catch return
			// See: https://www.typescriptlang.org/play/?#code/MYewdgzgLgBAhjAvDAFASiQPhgbwFAyExQBOAnrgUdQJYBmqAsnFABYB0JcYAJiALboY2AAzsArBnzUZRNiRAB3GGACmygKIkFJFAHIAMgBsQRvWgDcVWQF881mSVVQAriTAwARKTKer1GxhgFmBWSllCJ1d3L2CoUL8HQLoaMDgjIwppCNBIU1V2EwBzFE8AMVT0zJguME9LJLw7PFyIfMKQErh0SyA
			isInFlight.current = false;
		}
	});

	const reset = useCallback(() => {
		setState({
			loading: false,
			result: {type: 'initial'},
		});
	}, []);

	return [state, run, reset];
}
