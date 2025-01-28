# alistair

A collection of utility functions to share across projects.

## Installation

```bash
yarn add alistair
```

## Packages:

---

### `alistair/id`:

ID package for generating stable IDs at runtime. Cryptographically **insecure** and no collision protection so really made for things that are not meant to be unique or when you need a quick
id (e.g. an application invite code).

#### Declarations:

```ts
declare function id(length?: number, alphabet?: string): string;
```

#### Example usage:

```ts
import {id} from 'alistair/id';

const randomId = id();
const randomHex = id(6, 'abcdefg01234567890');
const randomCode = id(10);
```

---

### `alistair/hooks`:

A collection of pure utility React hooks for common use cases.

#### Available Hooks:

##### `useLocalStorage<T>`

Store and sync state with localStorage.

```ts
function useLocalStorage<T>(
	key: string,
	init: () => T,
): [value: T, set: (action: React.SetStateAction<T>) => void];
```

##### `useThrottle<T>`

Throttle a value's updates.

```ts
function useThrottle<T>(value: T, ms?: number): T;
```

##### `useToggle`

Manage boolean toggle state with convenient controls.

```ts
function useToggle(initialState?: boolean): [
	enabled: boolean,
	control: {
		on: () => void;
		off: () => void;
		toggle: () => void;
		reset: () => void;
	},
];
```

##### `useIsTabFocused`

Track if the current browser tab is focused.

```ts
function useIsTabFocused(): boolean;
```

##### `useIsOnline`

Monitor the browser's online/offline status.

```ts
function useIsOnline(): boolean;
```

##### `useLazyRef<T>`

Create a ref with lazy initialization.

```ts
function useLazyRef<T>(init: () => T): T;
```

##### `useInterval`

Set up an interval that's properly cleaned up.

```ts
function useInterval(fn: () => void, interval: number): void;
```

##### `useEvent<A, R>`

Create a stable event handler that never changes identity.

```ts
function useEvent<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R;
```

##### `useAsyncFunction<A, R>`

Manage async function state with loading and error handling.

```ts
function useAsyncFunction<A extends unknown[], R>(
	execute: (...args: A) => Promise<R>,
): [
	state: {
		loading: boolean;
		result: {type: 'initial'} | {type: 'success'; data: R} | {type: 'error'; error: unknown};
	},
	run: (...args: A) => Promise<{type: 'success'; data: R} | {type: 'error'; error: unknown}>,
	reset: () => void,
];
```

---

### `alistair/http`:

A powerful HTTP client with lifecycle hooks, retries, and type-safe responses.

```ts
import {createHTTPClient} from 'alistair/http';

const client = createHTTPClient({
	base: 'https://api.example.com',
	transform: res => res.json(), // Optional response transformer
	lifecycle: {
		// Optional lifecycle hooks
		before: async request => {
			// Modify request before sending
			request.headers.set('Authorization', 'Bearer token');
			return request;
		},
		failure: async (count, request, response) => {
			// Handle failures, implement retries
			if (count < 3 && response.status === 429) {
				await new Promise(resolve => setTimeout(resolve, 1000));
				return request; // Retry the request
			}
		},
	},
});

// Available methods: get, post, put, patch, delete, head, options
const data = await client.get('/users');
const response = await client.post('/users', {
	body: {name: 'John'}, // Assumes JSON by default, specify Content-Type header to change
});
```

---

### `alistair/structs`:

Type-safe data structures for JavaScript/TypeScript.

#### StrictMap<K, V>

A strict variant of Map that enforces explicit handling of missing keys.

```ts
import {StrictMap} from 'alistair/structs';

const map = new StrictMap<string, number>();

// Get with default value if key doesn't exist
const value = map.getOr('key', () => 42);

// Get with alternative return type if key doesn't exist
const optional = map.getElse('missing', () => null);
```

#### ImmutableMap<K, V>

An immutable Map implementation.

```ts
import {ImmutableMap} from 'alistair/structs';

const map = new ImmutableMap<string, number>([['key', 1]]);
const newMap = map.set('key2', 2); // Returns new instance
```

#### ImmutableSet<T>

An immutable Set implementation.

```ts
import {ImmutableSet} from 'alistair/structs';

const set = new ImmutableSet<string>(['a', 'b']);
const newSet = set.add('c'); // Returns new instance
```

---

### `alistair/log`:

A structured logging utility with indentation support and colorized output.

```ts
import {log} from 'alistair/log';

log.info('Started server');
log.listening('on 3000');
log.success('Request received');
log.error('Request failed', new Error('Failed to process'));
log.warn('Server is not responding');
log.debug('Debug information');
log.fatal(new Error('Critical error'));

// Indented logging
log.indent(() => {
	log.info('Nested information');
	log.success('Nested success');
});
```

---

### `alistair/atoms`:

A lightweight state management solution with React bindings.

```ts
import {atom, useAtom, useAtomValue} from 'alistair/atoms';

// Create an atom
const countAtom = atom(0);

// Use in React components
function Counter() {
	const [count, setCount] = useAtom(countAtom);
	// Or read-only: const count = useAtomValue(countAtom);

	return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
```

---

### `alistair/react`:

React utilities including context creators and store management.

```ts
import {createStrictContext, createStoreContext} from 'alistair/react';

// Create a type-safe context
const UserContext = createStrictContext<{name: string}>();

// Use in components
function App() {
	return (
		<UserContext.Provider value={{name: 'John'}}>
			<Child />
		</UserContext.Provider>
	);
}

function Child() {
	const user = UserContext.useContext();
	return <div>{user.name}</div>;
}
```

---

### `alistair/prettier`:

Opinionated prettier config. Use it by creating a `.prettierrc` file with:

```json
"alistair/prettier"
```

---

### `alistair/bus`:

A type-safe event bus implementation for handling pub/sub patterns.

```ts
import {EventBus} from 'alistair/bus';

// Define event types
type Events = {
	userJoined: [userId: string, timestamp: number];
	userLeft: [userId: string];
};

// Create a type-safe event bus
const bus = new EventBus<Events>();

// Subscribe to events
const unsubscribe = bus.on('userJoined', (userId, timestamp) => {
	console.log(`User ${userId} joined at ${timestamp}`);
});

// Emit events
bus.emit('userJoined', 'user123', Date.now());

// Unsubscribe when done
unsubscribe();

// Or manually unsubscribe
bus.off('userJoined', listener);
```

---

### `alistair/tags`:

Template literal utilities for string manipulation.

#### `stripIndent`

Removes leading indentation from multi-line strings while preserving relative indentation.

```ts
import {stripIndent} from 'alistair/tags';

const sql = stripIndent`
	SELECT *
	FROM users
	WHERE id = ${userId}
		AND status = 'active'
`;

// Result:
// SELECT *
// FROM users
// WHERE id = 123
//	AND status = 'active'
```
