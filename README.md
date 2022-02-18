# Website repository moved! [github.com/alii/website](https://github.com/alii/website)

# alistair

A collection of utility functions to share across projects.

## Installation

```
yarn add alistair
```

## Packages:

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
```

### `alistair/prettier`:

Opinionated prettier config I use across my applications. You can use it by making a `.prettierrc` file in your project and including the following content

```prettierrc
"alistair/prettier"
```
