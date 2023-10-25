# alistair

A collection of utility functions to share across projects.

## Installation

```
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

A collection of pure utility React hooks that may be useful in your projects. There is no documentation for these right now, but they should all have JSDoc, so if you want to learn more, you can find the file [here](https://github.com/alii/alistair/tree/master/src/hooks).

```ts
export function useLocalStorage<T>(key: string, init: () => T): [value: T, set: (action: React.SetStateAction<T>) => void];

export function useThrottle<T>(value: T, ms?: number): T;

export function useToggle(
	initialState?: boolean,
) [
	enabled: boolean,
	control: {on: () => void; off: () => void; toggle: () => void; reset: () => void},
];

export function useIsTabFocused(): boolean;

export function useLazyRef<T>(init: () => T): T;

export function useLazyRef<T>(init: () => T): T;

export function useInterval(fn: () => void, interval: number): void;

// Based on https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
export function useEvent<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R;
```

---

### `alistair/prettier`:

Opinionated prettier config I use across my applications. You can use it by making a `.prettierrc` file in your project and including the following content

```prettierrc
"alistair/prettier"
```
