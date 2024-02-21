export function join<Base extends string, Path extends string>(base: Base, path: Path) {
	const finalBase = base.charCodeAt(base.length - 1) === 47 ? base : base + '/';
	const finalPath = path.charCodeAt(0) === 47 ? path.substring(1) : path;

	return finalBase + finalPath;
}

export function isBodyInit(body: unknown): body is BodyInit {
	return (
		typeof body === 'string' ||
		body instanceof ReadableStream ||
		body instanceof Blob ||
		body instanceof FormData ||
		body instanceof URLSearchParams ||
		(typeof ArrayBuffer !== 'undefined' &&
			(ArrayBuffer.isView(body) || body instanceof ArrayBuffer))
	);
}

export function streamToBody<T>(stream: ReadableStream<T>) {
	return new Response(stream).text();
}
