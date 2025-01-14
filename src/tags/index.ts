/**
 * Tagged template literal function to strip indent from a string
 * @param strings - The strings to strip indent from
 * @param values - The values to replace in the strings
 * @returns The string with the indent stripped relative to the first non-empty line
 */
export function stripIndent(strings: TemplateStringsArray, ...values: unknown[]): string {
	const result = strings.reduce((acc, str, i) => {
		return acc + str + (values[i] ?? '');
	}, '');

	const lines = result.split('\n').filter((line, i, arr) => {
		if (i === 0 || i === arr.length - 1) {
			return line.trim() !== '';
		}

		return true;
	});

	const minIndent = lines
		.filter(line => line.trim().length > 0)
		.reduce((min, line) => {
			const indent = line.match(/^[ \t]*/)?.[0].length ?? 0;
			return indent < min ? indent : min;
		}, Infinity);

	return lines.map(line => line.slice(minIndent)).join('\n');
}
