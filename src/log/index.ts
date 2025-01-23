import * as c from 'colorette';
import {inspect} from 'node:util';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LoggerOptions {
	backend?: Record<LogLevel, (text: string) => void>;
	indentString?: string;
}

// Update this if you add a wider prefix name
const widestPrefix = 9;
const widestPrefixAsIndent = ' '.repeat(widestPrefix);

/**
 * Create a new logger
 * @param options Logger options
 * @returns a logger instance
 */
export function logger({
	backend = console,
	indentString = widestPrefixAsIndent,
}: LoggerOptions = {}) {
	let indentLevel = 0;

	const getIntentText = (lastChar?: string) => {
		let result = '';

		for (let i = 0; i < indentLevel; i++) {
			const isLast = i === indentLevel - 1;

			if (isLast && lastChar) {
				result += indentString + lastChar;
			} else {
				result += indentString + '│ ';
			}
		}

		return c.gray(result);
	};

	function make(level: LogLevel, prefix: string) {
		return (...args: unknown[]) => {
			const indent = getIntentText();

			const resultArgs: string[] = [];

			for (let i = 0; i < args.length; i++) {
				const arg = args[i];

				if (typeof arg === 'string') {
					resultArgs.push(arg);
					continue;
				}

				const inspected = inspect(arg, {
					colors: c.isColorSupported,
					depth: 10,
				});

				const isError = arg instanceof Error;

				if (isError) {
					const colored = inspected
						.split('\n')
						.map((line, index) => {
							if (index === 0) {
								return line;
							}

							return c.gray(line.trim());
						})
						.join('\n');

					resultArgs.push(colored);
				} else {
					resultArgs.push(inspected);
				}
			}

			const string = resultArgs.join(' ');

			let result: string[] = [];
			const split = string.split('\n');

			for (let i = 0; i < split.length; i++) {
				const line = split[i];
				if (i === 0) {
					result.push(indent + ' ' + prefix + ' ' + line);
				} else {
					result.push(indent + ' ' + widestPrefixAsIndent + ' ' + line);
				}
			}

			backend[level](result.join('\n'));
		};
	}

	return {
		indent: (fn: () => void) => {
			indentLevel += 1;
			backend.info(getIntentText('┌─'));
			fn();
			backend.info(getIntentText('└─'));
			indentLevel -= 1;
		},

		/**
		 * Print an info message
		 */
		info: make('info', c.blue('info'.padStart(widestPrefix))),

		/**
		 * Print a success message
		 */
		success: make('info', c.greenBright('success'.padStart(widestPrefix))),

		/**
		 * Print a listening message
		 */
		listening: make('info', c.cyan('listening'.padStart(widestPrefix))),

		/**
		 * Print a debug message
		 */
		debug: make('debug', c.cyan(c.bold('debug'.padStart(widestPrefix)))),

		/**
		 * Print a fatal message
		 */
		fatal: make('error', c.red(c.bold('fatal'.padStart(widestPrefix)))),

		/**
		 * Print an error message
		 */
		error: make('error', c.red(c.bold('error'.padStart(widestPrefix)))),

		/**
		 * Print a warning message
		 */
		warn: make('warn', c.yellow(c.bold('warn'.padStart(widestPrefix)))),
	};
}

/**
 * The default logger
 *
 * @example
 * ```ts
 * log.info('Started server')
 * log.listening('on 3000')
 * log.fatal(new Error('Failed to start server'))
 * log.indent(() => {
 * 	log.info('Listening for requests')
 * 	log.success('Request received')
 * 	log.error('Request failed', new Error('Failed to process request'))
 * })
 * log.warn('Server is not responding')
 * log.debug('Server is responding')
 * ```
 */
export const log = logger();
