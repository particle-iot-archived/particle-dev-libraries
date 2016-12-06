'use babel';

import {allowUnsafeNewFunction} from 'loophole';
import when from 'when';

let _profileManager;
let profilesPromise = when.defer();

function activate() {
	allowUnsafeNewFunction(()=> {
		require('atom-package-deps').install('particle-dev-libraries', true);
		const main = require('./index_loophole');

		Promise.all([
			profilesPromise
		]).then(() => {
			main.activate();
		});
	});
}

function consumeProfiles(pm) {
	_profileManager = pm;
	profilesPromise.resolve(_profileManager);
}

function profileManager() {
	return _profileManager;
}

export {
	activate,
	consumeProfiles,
	profileManager
};
