import {StrictMap} from '../structs/strict-map.ts';

export type Listener<P extends Record<string, readonly unknown[]>, Key extends keyof P> = (
	...args: P[Key]
) => unknown;

export class EventBus<Payloads extends Record<string, readonly unknown[]> = {}> {
	private readonly listeners: StrictMap<keyof Payloads, Set<Listener<Payloads, keyof Payloads>>>;

	public constructor() {
		this.listeners = new StrictMap();
	}

	public on<K extends keyof Payloads>(key: K, listener: Listener<Payloads, K>) {
		const list = this.listeners.getOr(key, () => new Set());

		list.add(listener as Listener<Payloads, keyof Payloads>);

		return () => {
			this.off(key, listener);
		};
	}

	public off<K extends keyof Payloads>(key: K, listener: Listener<Payloads, K>) {
		const list = this.listeners.getElse(key, () => null);

		if (!list) {
			// Silently ignore I guess?
			return;
		}

		list.delete(listener as Listener<Payloads, keyof Payloads>);

		if (list.size === 0) {
			this.listeners.delete(key);
		}
	}

	public emit<K extends keyof Payloads>(key: K, ...args: Payloads[K]) {
		const listeners = this.listeners.getElse(key, () => null);

		if (!listeners) {
			return;
		}

		for (const listener of listeners) {
			listener(...args);
		}
	}
}
