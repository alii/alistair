// tsup inlines the version at build time
import {version} from '../../package.json';
import {IS_BROWSER} from '../constants.ts';
import {isBodyInit, join} from './utils.ts';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

export class HTTPClientError extends Error {
	public static getErrorMessage = (count: number, response: Response) =>
		`Request failed after ${count} tries with status ${response.status}`;

	constructor(
		public readonly count: number,
		public readonly request: Request,
		public readonly response: Response,
	) {
		super(HTTPClientError.getErrorMessage(count, response));
	}
}

/**
 * Lifecycle describes a `.before()` and a `.failure()` function, which allow the developer
 * to write advanced behaviours like backoff retries, automatic authorization header injection,
 * easy rate limiting, etc
 */
export interface Lifecycle {
	/**
	 * Runs before every request, allows you to inject headers, modifiy the request, etc.
	 * It is safe to mutate the request that is passed in, or return a new instance of a Request.
	 *
	 * Note: If you implement retries with `.failure`, then `.before` will NOT be called on each
	 * retry. This is because it's possible to return the same request in the failure handler
	 * which would be a request that has *already had* the `.before()` transform applied (and so)
	 * `.before()` would be changing things that have already been changed.
	 *
	 * @param request The request that is about to be executed
	 * @returns A modified OR entirely new request instance
	 */
	before: (request: Request) => Promise<Request>;

	/**
	 * Called when a request fails (dictated when response.ok = false)
	 *
	 * You can do one of three things inside of this function:
	 * - 1. Return the existing instance, or a new instance of a Request, which will queue up a
	 *      retry with the (and if it fails AGAIN, the count will be incremented for
	 *      the next failure call). You can use this behaviour to implement retries with
	 *      backoff strategies.
	 *
	 *      Be aware that returning a request here will NOT
	 *      pass it through `.before()`, so make sure any transformations are applied beforehand.
	 *
	 *      Also, it is totally okay to wait inside of .failure in the case of a rate limit for example
	 *
	 * - 2. Return undefined, which will throw the default HTTPClientError with the
	 *      request and response that failed. This won't trigger any retries and will cause the original
	 *      call to fail
	 *
	 * - 3. Throw an error, which won't trigger any retries and will also cause the original call to fail
	 *
	 * @param count - The number of times the request has failed
	 * @param request - The request that failed
	 * @param response - The response from the failed request
	 */
	failure: (
		count: number,
		request: Request,
		response: Response,
	) => Promise<Request | void | undefined>;
}

export type RequestTransformer<T> = (response: Response) => Promise<T>;

export interface CompleteOptions<Transform> {
	base: string;
	transform: RequestTransformer<Transform>;
	lifecycle: Lifecycle;
}

export interface RootOptions<Transform> {
	base: string;
	transform?: RequestTransformer<Transform>;
	lifecycle?: Partial<Lifecycle>;
}

export type RequestConfig = Omit<RequestInit, 'method' | 'body'> & {body?: unknown};

/**
 * This type is just what createHTTPClient returns, you can use this if you want to type
 * a class property or a variable or something, rather than doing `ReturnType<typeof createHTTPClient>`
 */
export interface HTTPClient<Transform> {
	get: <T extends Transform = Transform>(
		path: string,
		config?: RequestConfig | undefined,
	) => Promise<T>;
	post: <T extends Transform = Transform>(
		path: string,
		config?: RequestConfig | undefined,
	) => Promise<T>;
	put: <T extends Transform = Transform>(
		path: string,
		config?: RequestConfig | undefined,
	) => Promise<T>;
	patch: <T extends Transform = Transform>(
		path: string,
		config?: RequestConfig | undefined,
	) => Promise<T>;
	delete: <T extends Transform = Transform>(
		path: string,
		config?: RequestConfig | undefined,
	) => Promise<T>;
	head: <T extends Transform = Transform>(
		path: string,
		config?: RequestConfig | undefined,
	) => Promise<T>;
	options: <T extends Transform = Transform>(
		path: string,
		config?: RequestConfig | undefined,
	) => Promise<T>;
}

export function createHTTPClient<Transform = unknown>(
	rootOptions: RootOptions<Transform>,
): HTTPClient<Transform> {
	const defaultLifecycle: Lifecycle = {
		before: async req => req,
		failure: async (count, request, response) => {
			throw new HTTPClientError(count, request, response);
		},
	};

	const options: CompleteOptions<Transform> = {
		transform: res => res.json(),
		...rootOptions,
		lifecycle: {
			...defaultLifecycle,
			...rootOptions.lifecycle,
		},
	};

	// Exists so we can recursively call on failure
	const run = async (count: number, request: Request): Promise<Response> => {
		const response = await fetch(request);

		if (!response.ok) {
			const failure = await options.lifecycle.failure(count, request, response);

			if (failure instanceof Request) {
				return run(count + 1, failure);
			} else {
				throw new HTTPClientError(count, request, response);
			}
		}

		return response;
	};

	const createMethod = (method: Method) => {
		const handler = async <T extends Transform = Transform>(
			path: string,
			config: RequestConfig = {},
		): Promise<T> => {
			const {body: userBody = undefined, headers: userHeaders, ...userInit} = config;

			const headers = new Headers(userHeaders);

			const init: RequestInit = {
				...userInit,
				headers,
				method,
			};

			if (!IS_BROWSER && !headers.has('User-Agent')) {
				headers.set('User-Agent', `alistair-http/${version}`);
			}

			if (userBody !== undefined) {
				// Assume user wants to send JSON by default, they can opt out if they set a custom content-type header
				// which we will then check if the body is valid BodyInit (since we won't do any serialization in this case).
				// If it not valid, we throw an error

				const setContentType = headers.get('Content-Type');

				if (setContentType === null || setContentType === 'application/json') {
					if (setContentType === null) {
						headers.set('Content-Type', 'application/json');
					}

					init.body = JSON.stringify(userBody);
				} else if (userBody === null || isBodyInit(userBody)) {
					init.body = userBody;
				} else {
					throw new Error(
						'Cannot serialize body when a Content-Type header was set. Maybe you forgot to stringify?',
					);
				}
			}

			const request = await options.lifecycle.before(new Request(join(options.base, path), init));
			const response = await run(1, request);

			const transformed = await options.transform(response);

			return transformed as T;
		};

		return handler;
	};

	return {
		get: createMethod('get'),
		post: createMethod('post'),
		put: createMethod('put'),
		patch: createMethod('patch'),
		delete: createMethod('delete'),
		head: createMethod('head'),
		options: createMethod('options'),
	};
}
