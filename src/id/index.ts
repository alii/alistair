/**
 * Generates an ID
 * @param length The length of the ID to generate
 * @param alphabet The alphabet to choose characters from. Does not dedupe multiples!
 */
export function id(
	length = 20,
	alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
) {
	return [...new Array(length)].reduce<string>(
		str => str + alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
		'',
	);
}
