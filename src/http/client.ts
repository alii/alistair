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

export interface Lifecycle {
	before: (request: Request) => Promise<Request>;
	failure: (
		count: number,
		request: Request,
		response: Response,
	) => Promise<Request | void | undefined>;
}

export interface CompleteOptions<Transform> {
	base: string;
	transform: (response: Response) => Promise<Transform>;
	lifecycle: Lifecycle;
}

export interface UserOptions<Transform> {
	base: string;
	transform?: CompleteOptions<Transform>['transform'];
	lifecycle?: Partial<Lifecycle>;
}

export type RequestConfig = Omit<RequestInit, 'method' | 'body'> & {body?: unknown};

export function createHTTPClient<Transform = unknown>(userOptions: UserOptions<Transform>) {
	const defaultLifecycle: Lifecycle = {
		before: async req => req,
		failure: async (count, request, response) => {
			throw new HTTPClientError(count, request, response);
		},
	};

	const options: CompleteOptions<Transform> = {
		transform: res => res.json(),
		...userOptions,
		lifecycle: {
			...defaultLifecycle,
			...userOptions.lifecycle,
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
			path: `/${string}`,
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
				} else if (isBodyInit(userBody)) {
					init.body = userBody;
				} else {
					throw new Error(
						'Cannot serialize body when a Content-Type header was set. Maybe you forgot to stringify?',
					);
				}
			}

			const defaultRequest = new Request(join(options.base, path), init);

			const actualRequest = await options.lifecycle.before(defaultRequest);

			const response = await run(1, actualRequest);

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
