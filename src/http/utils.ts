export function join<Base extends string, Path extends string>(base: Base, path: Path) {
	const finalBase = base.charCodeAt(base.length - 1) === 47 ? base : base + '/';
	const finalPath = path.charCodeAt(0) === 47 ? path.substring(1) : path;

	return finalBase + finalPath;
}

export type RequireOnly<T, K extends keyof T> = Pick<T, K> & Partial<Pick<T, Exclude<keyof T, K>>>;

export function isBodyInit(body: unknown): body is Exclude<BodyInit, ArrayBufferView> {
	return (
		body instanceof ReadableStream ||
		body instanceof Blob ||
		body instanceof FormData ||
		body instanceof URLSearchParams ||
		body instanceof ArrayBuffer ||
		typeof body === 'string'
	);
}

export function streamToBody<T>(stream: ReadableStream<T> | null) {
	return new Response(stream).text();
}
