import {defineConfig} from 'tsup';

const year = new Date().getFullYear();

export default defineConfig({
	entry: [
		'./src/index.ts',
		'./src/id/index.ts',
		'./src/hooks/index.ts',
		'./src/react/index.ts',
		'./src/http/index.ts',
		'./src/bus/index.ts',
		'./src/atoms/index.ts',
	],
	splitting: true,
	clean: true,
	format: ['esm', 'cjs'],
	dts: true,
	treeshake: 'smallest',
	banner: {
		js: `// Copyright ${year} Alistair Smith https://github.com/alii/alistair`,
		css: `/* Copyright ${year} Alistair Smith https://github.com/alii/alistair */`,
	},
});
