import {expect, test} from 'bun:test';
import {simple} from '.';

type O =
	| {
			type: 'a';
			foo: string;
	  }
	| {
			type: 'b';
			bar: number;
	  };

test('simple', () => {
	const o: O = {
		type: 'a',
		foo: 'hello',
	} as any;

	const result = simple(o, 'type', {
		a: o => o.foo,
		b: o => o.bar,
	});

	expect(result).toBe('hello');
});
