/**
 * An immutable variant of the native `Map` class where all mutating operations
 * return new instances instead of modifying the original map.
 *
 * @template K - The type of keys in the map
 * @template V - The type of values in the map
 *
 * @example
 * ```typescript
 * const map1 = new ImmutableMap([['a', 1], ['b', 2]]);
 * const map2 = map1.set('c', 3);
 *
 * console.log(map1.get('c')); // undefined
 * console.log(map2.get('c')); // 3
 * ```
 */
export class ImmutableMap<K, V> {
	/**
	 * Internal Map instance used for storage
	 * @private
	 */
	private readonly map = new Map<K, V>();

	/**
	 * A shared empty immutable map instance. Using `never` type ensures
	 * it can be safely cast to ImmutableMap<K, V> for any K and V.
	 *
	 * @example
	 * ```typescript
	 * const emptyStringMap = ImmutableMap.Empty as ImmutableMap<string, number>;
	 * const emptyUserMap = ImmutableMap.Empty as ImmutableMap<UserId, User>;
	 * ```
	 */
	public static readonly Empty = new ImmutableMap<never, never>();

	/**
	 * Creates a new ImmutableMap instance, optionally from an iterable
	 *
	 * This is perfect for usage with `useState` as React calls the `.from()` function
	 * when initializing the state, but TypeScript lets us set the generic types
	 * inline.
	 *
	 * @example
	 * ```typescript
	 * const [map, setMap] = useState(ImmutableMap.from<string, number>);
	 * ```
	 *
	 * @param iterable - Optional iterable of initial [key, value] pairs
	 * @returns A new ImmutableMap instance
	 */
	public static from = <K, V>(iterable?: Iterable<[K, V]>) => new ImmutableMap(iterable);

	/**
	 * Returns the number of key/value pairs in the map
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap([['a', 1], ['b', 2]]);
	 * console.log(map.size); // 2
	 * ```
	 */
	public get size() {
		return this.map.size;
	}

	/**
	 * Creates a new ImmutableMap instance
	 *
	 * @param iterable - Optional iterable of initial [key, value] pairs
	 *
	 * @example
	 * ```typescript
	 * const map1 = new ImmutableMap([['a', 1], ['b', 2]]);
	 * const map2 = new ImmutableMap(new Map([['x', 10], ['y', 20]]));
	 * const empty = new ImmutableMap<string, number>();
	 * ```
	 */
	public constructor(iterable?: Iterable<[K, V]>) {
		this.map = new Map(iterable);
	}

	/**
	 * Creates a new map with the specified key/value pair added or updated
	 *
	 * @param key - The key to set
	 * @param value - The value to associate with the key
	 * @returns A new ImmutableMap containing the new key/value pair
	 *
	 * @example
	 * ```typescript
	 * const map1 = new ImmutableMap([['a', 1]]);
	 * const map2 = map1.set('b', 2);
	 * const map3 = map2.set('a', 10); // Updates existing key
	 *
	 * console.log(map1.get('b')); // undefined
	 * console.log(map2.get('b')); // 2
	 * console.log(map3.get('a')); // 10
	 * ```
	 */
	public set(key: K, value: V): ImmutableMap<K, V> {
		return this.mutate(map => {
			map.set(key, value);
		});
	}

	/**
	 * Retrieves the value associated with a key
	 *
	 * @param key - The key to look up
	 * @returns The value associated with the key, or undefined if the key doesn't exist
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap([['a', 1], ['b', 2]]);
	 * console.log(map.get('a')); // 1
	 * console.log(map.get('x')); // undefined
	 * ```
	 */
	public get(key: K): V | undefined {
		return this.map.get(key);
	}

	/**
	 * Checks if a key exists in the map
	 *
	 * @param key - The key to check
	 * @returns `true` if the key exists, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap([['a', 1], ['b', 2]]);
	 * console.log(map.has('a')); // true
	 * console.log(map.has('x')); // false
	 * ```
	 */
	public has(key: K): boolean {
		return this.map.has(key);
	}

	/**
	 * Creates a new map with the specified key removed
	 *
	 * @param key - The key to remove
	 * @returns A new ImmutableMap with the key/value pair removed
	 *
	 * @example
	 * ```typescript
	 * const map1 = new ImmutableMap([['a', 1], ['b', 2]]);
	 * const map2 = map1.delete('a');
	 *
	 * console.log(map1.has('a')); // true
	 * console.log(map2.has('a')); // false
	 * ```
	 */
	public delete(key: K): ImmutableMap<K, V> {
		return this.mutate(map => {
			map.delete(key);
		});
	}

	/**
	 * Creates a new empty map
	 *
	 * @returns A new empty ImmutableMap
	 *
	 * @example
	 * ```typescript
	 * const map1 = new ImmutableMap([['a', 1], ['b', 2]]);
	 * const map2 = map1.clear();
	 *
	 * console.log(map1.size); // 2
	 * console.log(map2.size); // 0
	 * ```
	 */
	public clear(): ImmutableMap<K, V> {
		return ImmutableMap.Empty;
	}

	/**
	 * Executes a callback for each key/value pair in the map
	 *
	 * @param callbackfn - Function to execute for each entry
	 * @param thisArg - Value to use as `this` when executing the callback
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap([['a', 1], ['b', 2]]);
	 * const results: string[] = [];
	 * map.forEach((value, key) => {
	 *   results.push(`${key}=${value}`);
	 * });
	 * console.log(results); // ['a=1', 'b=2']
	 * ```
	 */
	public forEach(callbackfn: (value: V, key: K) => void, thisArg?: any): void {
		this.map.forEach(callbackfn, thisArg);
	}

	/**
	 * Returns an iterator of the map's keys
	 *
	 * @returns An iterator containing the keys
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap([['a', 1], ['b', 2]]);
	 * const keys = [...map.keys()];
	 * console.log(keys); // ['a', 'b']
	 * ```
	 */
	public keys(): IterableIterator<K> {
		return this.map.keys();
	}

	/**
	 * Returns an iterator of the map's values
	 *
	 * @returns An iterator containing the values
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap([['a', 1], ['b', 2]]);
	 * const values = [...map.values()];
	 * console.log(values); // [1, 2]
	 * ```
	 */
	public values(): IterableIterator<V> {
		return this.map.values();
	}

	/**
	 * Returns an iterator of the map's entries
	 *
	 * @returns An iterator containing [key, value] pairs
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap([['a', 1], ['b', 2]]);
	 * for (const [key, value] of map.entries()) {
	 *   console.log(`${key}=${value}`); // Logs: 'a=1', then 'b=2'
	 * }
	 * ```
	 */
	public entries(): IterableIterator<[K, V]> {
		return this.map.entries();
	}

	/**
	 * Implements the iterable protocol, allowing the map to be used with for...of loops
	 *
	 * @returns An iterator containing [key, value] pairs
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap([['a', 1], ['b', 2]]);
	 * for (const [key, value] of map) {
	 *   console.log(`${key}=${value}`); // Logs: 'a=1', then 'b=2'
	 * }
	 * ```
	 */
	public [Symbol.iterator](): IterableIterator<[K, V]> {
		return this.map[Symbol.iterator]();
	}

	/**
	 * Customizes the string tag for the ImmutableMap instance
	 * Used in Object.prototype.toString.call(immutableMap)
	 *
	 * @example
	 * ```typescript
	 * const map = new ImmutableMap();
	 * console.log(Object.prototype.toString.call(map)); // '[object ImmutableMap]'
	 * ```
	 */
	public get [Symbol.toStringTag]() {
		return 'ImmutableMap';
	}

	/**
	 * Internal helper method for creating new instances when performing
	 * mutations. This ensures immutability while allowing reuse of logic.
	 *
	 * @param fn - Function that performs the mutation on the cloned map
	 * @returns A new ImmutableMap instance with the mutation applied
	 * @private
	 */
	private mutate(fn: (map: Map<K, V>) => void) {
		const clone = new ImmutableMap(this.map);
		fn(clone.map);
		return clone;
	}
}
