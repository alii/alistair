import {log} from './index.ts';

log.info('Started server');
log.listening('on 3000');
log.fatal(new Error('Failed to start server'));
log.success('Did something cool');
log.error('Failed to do something cool');
log.indent(() => {
	log.info('Listening for requests');
	log.success('Request received');
	log.error('Request failed', new Error('Failed to process request'));
});
log.warn('Server is not responding');
log.debug('Server is responding');

// import {log} from './index.ts';

// log.debug('This is debug');
// log.error('This is error');
// log.fatal('This is fatal');
// log.info('This is info');
// log.listening('This is listening');
// log.success('This is success');
// log.warn('This is warn');

// log.info('Indent:');

// log.indent(() => {
// 	log.debug('This is debug');
// 	log.error('This is error');
// 	log.fatal('This is fatal');
// 	log.info('This is info');
// 	log.listening('This is listening');
// 	log.success('This is success');
// 	log.warn('This is warn');
// });

// log.indent(() => {
// 	log.debug('This is debug');
// 	log.error('This is error');
// 	log.fatal('This is fatal');
// 	log.info('This is info');
// 	log.listening('This is listening');
// 	log.success('This is success');
// 	log.warn('This is warn');

// 	log.indent(() => {
// 		log.debug('This is debug');
// 		log.error('This is error');
// 		log.error(new Error('This is an error'));
// 		log.fatal('This is fatal');
// 		log.info('This is info');
// 		log.listening('This is listening');
// 		log.success('This is success');
// 		log.warn('This is warn');
// 	});
// });

// log.success(new Error('Success error'));
// log.error(new Error('Error error'));
// log.fatal(new Error('Fatal error'));
// log.info(new Error('Info error'));
// log.listening(new Error('Listening error'));
// log.success(new Error('Success error'));
// log.warn(new Error('Warn error'));

// log.success('Uh oh', new Error('Success error'));
// log.error('Uh oh', new Error('Error error'));
// log.fatal('Uh oh', new Error('Fatal error'));
// log.info('Uh oh', new Error('Info error'));
// log.listening('Uh oh', new Error('Listening error'));
// log.success('Uh oh', new Error('Success error'));
// log.warn('Uh oh', new Error('Warn error'));

// class Testing {
// 	constructor() {}
// }

// log.success(new Testing());
// log.error(new Testing());
// log.fatal(new Testing());
// log.info(new Testing());
// log.listening(new Testing());
// log.success(new Testing());
// log.warn(new Testing());

// const number = 10;
// const bool = true;

// log.success(number, bool, {number, bool});
// log.error(number, bool, {number, bool});
// log.fatal(number, bool, {number, bool});
// log.info(number, bool, {number, bool});
// log.listening(number, bool, {number, bool});
// log.success(number, bool, {number, bool});
// log.warn(number, bool, {number, bool});

// const bigObject = {
// 	number,
// 	bool,
// 	object: {number, bool, object: {number, bool, object: {number, bool, object: {number, bool}}}},
// };

// log.success(bigObject);

// log.indent(() => {
// 	log.success(bigObject);

// 	log.indent(() => {
// 		log.success(bigObject);
// 	});

// 	log.info('cool');
// 	log.info('cool');
// 	log.info('cool');
// 	log.info('cool');
// });
