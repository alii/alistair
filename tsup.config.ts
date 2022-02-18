import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['src/id/index.ts', 'src/prettier/index.json', 'src/index.ts'],
	splitting: true,
	clean: true,
	format: ['cjs', 'esm'],
	dts: true,

	banner: {
		js: '// Copyright Alistair Smith https://github.com/alii/alistair',
	},
});
