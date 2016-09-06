'use babel';

import {allowUnsafeEval, allowUnsafeNewFunction} from 'loophole';

function activate() {
	allowUnsafeNewFunction(()=> {
		const main = require('./index_loophole');
		require('atom-package-deps').install('particle-dev-profiles', true);
		main.activate();
	});
}

let pm;
function consumeProfiles(_pm) {
	pm = _pm;
}

function profileManager() {
	return pm;
}

export {
	activate,
	consumeProfiles,
	profileManager
};
