export type Listener<P extends Record<string, readonly unknown[]>, Key extends keyof P> = (
	...args: P[Key]
) => unknown;

export class EventBus<Payloads extends Record<string, readonly unknown[]> = {}> {
	private readonly listeners: Map<keyof Payloads, Array<Listener<Payloads, keyof Payloads>>>;

	public constructor() {
		this.listeners = new Map();
	}

	public on<K extends keyof Payloads>(key: K, listener: Listener<Payloads, K>) {
		const existing = this.listeners.get(key) ?? [];
		const merged = [...existing, listener] as Array<Listener<Payloads, keyof Payloads>>;
		this.listeners.set(key, merged);

		return () => {
			this.off(key, listener);
		};
	}

	public off<K extends keyof Payloads>(key: K, listener: Listener<Payloads, K>) {
		const list = this.listeners.get(key);

		if (!list) {
			// Silently ignore I guess?
			return;
		}

		const index = list.indexOf(listener as Listener<Payloads, keyof Payloads>);

		if (index === -1) {
			return;
		}

		const filtered = list.filter(item => item !== listener);

		if (filtered.length === 0) {
			this.listeners.delete(key);
		} else {
			this.listeners.set(key, filtered);
		}
	}

	public emit<K extends keyof Payloads>(key: K, ...args: Payloads[K]) {
		const listeners = this.listeners.get(key);

		if (!listeners) {
			return;
		}

		for (const listener of listeners) {
			listener(...args);
		}
	}
}
