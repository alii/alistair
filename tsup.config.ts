import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['src/id/index.ts', 'src/prettier/index.json', 'src/index.ts'],
	splitting: true,
	clean: true,
	format: ['cjs', 'esm'],
	dts: true,
});
