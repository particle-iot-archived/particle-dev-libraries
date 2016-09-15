'use babel';

import {allowUnsafeNewFunction} from 'loophole';

function activate() {
	allowUnsafeNewFunction(()=> {
		require('atom-package-deps').install('particle-dev-profiles', true);
		const main = require('./index_loophole');
		main.activate();
		console.log('package activated');
	});
}

let pm;
let pmCallback;

function consumeProfiles(_pm) {
	pm = _pm;
	if (pmCallback) {
		pmCallback();
	}
}

function onDidSetProfileManager(callback) {
	pmCallback = callback;
	return {dispose: () => {
		pmCallback = undefined;
	}};
}

function profileManager() {
	return pm;
}

export {
	activate,
	consumeProfiles,
	profileManager,
	onDidSetProfileManager
};
