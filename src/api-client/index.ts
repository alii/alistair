import {default as urlcat} from 'urlcat';

export type Method = 'post' | 'patch' | 'put' | 'get' | 'delete';
export type InitFetcher = (url: string, method: Method) => RequestInit;

export type GetURLParams<T extends string> =
	T extends `:${infer Param}/${infer Rest}`
		? Param | GetURLParams<Rest>
		: T extends `:${infer Param}`
		? Param
		: T extends `${string}:${infer Rest}`
		? GetURLParams<`:${Rest}`>
		: never;

export interface Config<P extends string, Q extends string[]> {
	path: P;
	query: Q;
	method: Method;
	init?: InitFetcher;
}

export type RunArgs<P extends string, Q extends string[]> = [
	GetURLParams<P> | Q[number],
] extends [never]
	? [init?: RequestInit]
	: [params: Record<GetURLParams<P> | Q[number], string>, init?: RequestInit];

export class Endpoint<P extends string, Q extends string[]> {
	private readonly config: Config<P, Q>;

	constructor(config: Config<P, Q>) {
		this.config = config;
	}

	query<Qs extends string>(query: Qs[]) {
		return new Endpoint({
			...this.config,
			query,
		});
	}

	async run(...[paramsOrInit = {}, init = {}]: RunArgs<P, Q>) {
		const url = urlcat(this.config.path, paramsOrInit ?? {});

		return fetch(url, {
			...init,
			method: this.config.method,
			...(this.config.init?.(this.config.path, this.config.method) ?? {}),
		});
	}
}

export type JSONInterceptor<T, R> = (data: T) => Promise<R> | R;

export class JSONEndpoint<P extends string, Q extends string[], T = unknown> {
	private readonly endpoint: Endpoint<P, Q>;
	private readonly interceptor: JSONInterceptor<T, T>;

	constructor(
		endpoint: Endpoint<P, Q>,
		interceptor: JSONInterceptor<T, T> = value => value as never,
	) {
		this.endpoint = endpoint;
		this.interceptor = interceptor;
	}

	type<NewT>() {
		return new JSONEndpoint<P, Q, NewT>(
			this.endpoint,
			this.interceptor as never,
		);
	}

	modify<NewT>(interceptor?: JSONInterceptor<T, NewT>) {
		return new JSONEndpoint<P, Q, NewT>(this.endpoint, interceptor as never);
	}

	async run(...params: RunArgs<P, Q>) {
		return this.endpoint
			.run(...params)
			.then(async res => res.json() as Promise<T>)
			.then(async value => this.interceptor(value));
	}
}

export function createAPIClient<Base extends string>(
	baseURL: Base,
	init?: InitFetcher,
) {
	function endpoint<P extends string>(path: P, method: Method) {
		return new Endpoint({
			path: urlcat(baseURL, path) as `${Base}${P}`,
			query: [],
			method,
			init,
		});
	}

	function json<P extends string, Q extends string[]>(
		endpoint: Endpoint<P, Q>,
	) {
		return new JSONEndpoint(endpoint);
	}

	return {endpoint, as: {json}};
}

export default createAPIClient;
