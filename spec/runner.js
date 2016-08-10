'use babel'

import {createRunner} from 'atom-mocha-test-runner';

module.exports = createRunner({
	globalAtom: false,
	htmlTitle: "atom-mocha-test-runner tests",
	testSuffixes: ['spec.js'],
});