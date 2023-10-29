import {defineConfig} from 'tsup';

const year = new Date().getFullYear();

export default defineConfig({
	entry: ['./src/index.ts', './src/id/index.ts', './src/hooks/index.ts', './src/http/index.ts'],
	splitting: true,
	clean: true,
	silent: true,
	format: ['esm', 'cjs'],
	dts: true,
	treeshake: 'smallest',
	banner: {
		js: `// Copyright ${year} Alistair Smith https://github.com/alii/alistair`,
		css: `/* Copyright ${year} Alistair Smith https://github.com/alii/alistair */`,
	},
	onSuccess: async () => {
		console.log('🌟 Build Success');
	},
});
