import {createHTTPClient} from '../src/http/index.ts';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const http = createHTTPClient({
	// The base property is required
	base: 'https://httpbin.org',

	// Specifying a transform is optional, but the default does the same as below
	transform: async (response: Response) => response.json(),

	// Lifecycle, and any lifecycle functions are all optional, however do note that
	// in the case of a failure, the client will immediately error by default. It will
	// not retry by default.
	lifecycle: {
		before: async (request: Request) => {
			request.headers.set('Authorization', 'Bearer example');

			console.log('Sending', request.method, 'request to', request.url);

			return request;
		},

		failure: async (count, request, response) => {
			if (response.status === 429) {
				const timeout = response.headers.get('X-Retry-After');
				const seconds = timeout ? Number(timeout) : 60;

				await sleep(seconds * 1000);

				// Return a request to trigger a retry
				// You can return a new request as well, if you wanted:
				// ```ts
				// const req = `new Request(request)`
				// req.headers.set('hello', 'world');
				// return req;
				// ```
				return request;
			}

			// Don't retry if we have tried more than 5 times
			if (count >= 5) {
				// ---------------------------------------------------------------- //
				// We just don't return anything, and the request will reject/throw //
				// and it will be the caller's responsibility to handle.            //
				// In this case, an HTTPClientError will be thrown, and you will    //
				// have to handle it in your own application code!                  //
				// ---------------------------------------------------------------- //
				return;
			}

			const wait = Math.pow(2, count) * 1000;

			// Utility function to get a "sane" error message
			console.log(
				'Request failed with status',
				response.status,
				response.statusText,
				'will retry after',
				wait,
				'ms',
			);

			// Implement backoff
			await sleep(wait);

			return request;
		},
	},
});

const result1 = await http.post('/post', {
	body: {
		name: 'alistair',
	},
	headers: {
		// This will NOT be set, because it gets overwritten by the `before` lifecycle
		Authorization: 'This will not overwrite',
	},
});

console.log(result1);

// This request will fail after 30s, because the endpoint is a 404
// and we have a backoff algorithm to retry requests after increasing
// amount of seconds, which is in total 30s
const result2 = await http.post('/will-fail-after-30s', {
	body: {
		name: 'alistair',
	},
});

console.log(result2);
