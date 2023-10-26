import {useCallback, useState} from 'react';

export interface ToggleControl {
	on: () => void;
	off: () => void;
	toggle: () => void;
	reset: () => void;
}

/**
 * Store a toggle boolean state with utility methods
 * @param initialState The initial state, optional
 * @returns A tuple containing the value and controls to update it
 * @example
 * const [isOpen, {toggle}] = useToggle();
 * return <button onClick={toggle}>Toggle Something</button>;
 */
export function useToggle(initialState = false): [enabled: boolean, control: ToggleControl] {
	const [state, setState] = useState(initialState);

	const handlers: ToggleControl = {
		on: useCallback(() => setState(true), []),
		off: useCallback(() => setState(false), []),
		toggle: useCallback(() => setState(state => !state), []),
		reset: useCallback(() => setState(initialState), [initialState]),
	};

	return [state, handlers];
}
