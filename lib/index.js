'use babel';

import {allowUnsafeNewFunction} from 'loophole';
import when from 'when';

let main;
let _profileManager;
let profilesPromise = when.defer();
let _toolBar;
let toolBarPromise = when.defer();

function activate() {
	allowUnsafeNewFunction(()=> {
		require('atom-package-deps').install('particle-dev-libraries', true);
		main = require('./index_loophole');

		Promise.all([
			profilesPromise,
			toolBarPromise
		]).then(() => {
			main.activate();
		});
	});
}

function deactivate() {
	main.deactivate();

	if (_toolBar) {
		_toolBar.removeItems();
		_toolBar = null;
	}
}

function consumeProfiles(pm) {
	_profileManager = pm;
	profilesPromise.resolve(_profileManager);
}

function profileManager() {
	return _profileManager;
}

function consumeToolBar(getToolBar) {
	_toolBar = getToolBar('particle-dev-libraries');
	toolBarPromise.resolve(_toolBar);
}

function toolBar() {
	return _toolBar;
}

export {
	activate,
	deactivate,
	consumeProfiles,
	profileManager,
	consumeToolBar,
	toolBar
};
