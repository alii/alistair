/**
 * Generates an ID
 * @param length The length of the ID to generate
 * @param alphabet The alphabet to choose characters from. Does not dedupe multiples!
 */
export function id(
	length = 20,
	alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
): string {
	return [...new Array<never>(length)].reduce(
		str => str + alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
		'',
	);
}
