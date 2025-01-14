export class StrictMap<K, V> {
	private readonly map = new Map<K, V>();

	get size() {
		return this.map.size;
	}

	get [Symbol.toStringTag]() {
		return 'StrictMap';
	}

	clear(): void {
		this.map.clear();
	}

	delete(key: K): boolean {
		return this.map.delete(key);
	}

	forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
		this.map.forEach(callbackfn, thisArg);
	}

	getOr(key: K, or: () => V): V {
		const value = this.map.get(key);

		if (value !== undefined) {
			return value;
		}

		const newValue = or();
		this.map.set(key, newValue);

		return newValue;
	}

	getElse<N>(key: K, or: () => N): V | N {
		const value = this.map.get(key);
		return value ?? or();
	}

	has(key: K): boolean {
		return this.map.has(key);
	}

	set(key: K, value: V): this {
		this.map.set(key, value);
		return this;
	}

	entries(): IterableIterator<[K, V]> {
		return this.map.entries();
	}

	keys(): IterableIterator<K> {
		return this.map.keys();
	}

	values(): IterableIterator<V> {
		return this.map.values();
	}

	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.map[Symbol.iterator]();
	}
}
