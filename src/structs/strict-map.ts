/**
 * A strict variant of the native `Map` class that enforces explicit handling of missing keys.
 * Unlike the standard Map, this implementation requires specifying default value behavior
 * when accessing potentially missing keys.
 *
 * @template K - The key type
 * @template V - The value type
 *
 * @example
 * ```typescript
 * const map = new StrictMap<string, number>();
 *
 * // Inserting a value if it doesn't exist
 * const value = map.getOr('key', () => 42); // 42
 *
 * // Subsequent access returns the stored value
 * const sameValue = map.getOr('key', () => 100); // 42
 *
 * // Using getElse for optional access
 * const optional = map.getElse('missing', () => null); // null
 * ```
 */
export class StrictMap<K, V> {
	/**
	 * Internal Map instance used for storage
	 * @private
	 */
	private readonly map = new Map<K, V>();

	/**
	 * Returns the number of key/value pairs in the StrictMap
	 */
	public get size() {
		return this.map.size;
	}

	/**
	 * Customizes the string tag for the StrictMap instance
	 * Used in Object.prototype.toString.call(strictMap)
	 */
	public get [Symbol.toStringTag]() {
		return 'StrictMap';
	}

	/**
	 * Removes all key/value pairs from the StrictMap
	 */
	public clear(): void {
		this.map.clear();
	}

	/**
	 * Removes the specified key and its associated value
	 * @param key - The key to remove
	 * @returns `true` if the key existed and was removed, `false` otherwise
	 */
	public delete(key: K): boolean {
		return this.map.delete(key);
	}

	/**
	 * Executes the provided callback for each key/value pair
	 * @param callbackfn - Function to execute for each entry
	 * @param thisArg - Value to use as `this` when executing the callback
	 */
	public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
		this.map.forEach(callbackfn, thisArg);
	}

	/**
	 * Retrieves the value for a key, or inserts and returns a new value if the key doesn't exist.
	 * This is the primary method for accessing values, as it ensures all keys have an associated value.
	 *
	 * @param key - The key to lookup
	 * @param or - Factory function that produces the default value if the key doesn't exist
	 * @returns The existing value or the newly inserted default value
	 *
	 * @example
	 * ```typescript
	 * const map = new StrictMap<string, string[]>();
	 * const value = map.getOr('users', () => []); // Creates new array if 'users' doesn't exist
	 * value.push('user1'); // Safe to use, we know it's an array
	 * ```
	 */
	public getOr(key: K, or: () => V): V {
		const value = this.map.get(key);

		if (value !== undefined) {
			return value;
		}

		const newValue = or();
		this.map.set(key, newValue);

		return newValue;
	}

	/**
	 * Similar to `getOr`, but allows returning a different type when the key doesn't exist.
	 * This is useful for optional access patterns where you don't want to insert a default value.
	 *
	 * @param key - The key to lookup
	 * @param or - Factory function that produces the alternative value if the key doesn't exist
	 * @returns The existing value of type V, or the alternative value of type N
	 *
	 * @example
	 * ```typescript
	 * const map = new StrictMap<string, number>();
	 * const value = map.getElse('count', () => null); // Returns null if key doesn't exist
	 * ```
	 */
	public getElse<N>(key: K, or: () => N): V | N {
		const value = this.map.get(key);
		return value ?? or();
	}

	/**
	 * Checks if the specified key exists
	 * @param key - The key to check
	 * @returns `true` if the key exists, `false` otherwise
	 */
	public has(key: K): boolean {
		return this.map.has(key);
	}

	/**
	 * Sets a key/value pair in the map
	 * @param key - The key to set
	 * @param value - The value to associate with the key
	 * @returns The StrictMap instance for method chaining
	 */
	public set(key: K, value: V): this {
		this.map.set(key, value);
		return this;
	}

	/**
	 * Returns an iterator of key/value pairs
	 * @returns An iterator containing [key, value] pairs
	 */
	public entries(): IterableIterator<[K, V]> {
		return this.map.entries();
	}

	/**
	 * Returns an iterator of keys
	 * @returns An iterator containing the keys
	 */
	public keys(): IterableIterator<K> {
		return this.map.keys();
	}

	/**
	 * Returns an iterator of values
	 * @returns An iterator containing the values
	 */
	public values(): IterableIterator<V> {
		return this.map.values();
	}

	/**
	 * Implements the iterable protocol, allowing the StrictMap to be used with for...of loops
	 * @returns An iterator containing [key, value] pairs
	 */
	public [Symbol.iterator](): IterableIterator<[K, V]> {
		return this.map[Symbol.iterator]();
	}
}
