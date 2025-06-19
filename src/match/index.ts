export type KeysWhereValueIsPropertyKey<T> = keyof {
	[Key in keyof T as T[Key] extends PropertyKey ? Key : never]: Key;
};

/**
 * Matches a value based on a discriminator key
 *
 * @param value - The value to match
 * @param key - The discriminator key
 * @param options - The options to match against
 * @returns The result of the match
 */
export function simple<
	T,
	K extends keyof T,
	Options extends {
		[Key in Extract<T[K], PropertyKey>]: (value: Extract<T, {[_ in K]: Key}>) => any;
	},
>(value: T, key: K, options: Options) {
	const discriminator = value[key];

	return options[discriminator as Extract<T[K], PropertyKey>](value as never) as ReturnType<
		Options[Extract<T[K], PropertyKey>]
	>;
}
