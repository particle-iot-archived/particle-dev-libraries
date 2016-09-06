'use babel';

import {createRunner} from 'atom-mocha-test-runner';

module.exports = createRunner({
	globalAtom: false,
	reporter: 'spec',
	htmlTitle: 'atom-mocha-test-runner tests',
	testSuffixes: ['spec.js'],
});
