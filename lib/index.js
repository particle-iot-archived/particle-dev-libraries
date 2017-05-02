'use babel';

import { allowUnsafeNewFunction } from 'loophole';
import when from 'when';

let main;
let _core;
let coreDefer = when.defer();
let _profileManager;
let profilesDefer = when.defer();
let _toolBar;
let toolBarDefer = when.defer();

function activate() {
	allowUnsafeNewFunction(()=> {
		require('atom-package-deps').install('particle-dev-libraries', true);
		main = require('./index_loophole');

		Promise.all([
			coreDefer.promise,
			profilesDefer.promise,
			toolBarDefer.promise
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

function consumeCore(core) {
	_core = core;
	coreDefer.resolve(_core);
}

function core() {
	return _core;
}

function consumeProfiles(pm) {
	_profileManager = pm;
	profilesDefer.resolve(_profileManager);
}

function profileManager() {
	return _profileManager;
}

function consumeToolBar(getToolBar) {
	_toolBar = getToolBar('particle-dev-libraries');
	toolBarDefer.resolve(_toolBar);
}

function toolBar() {
	return _toolBar;
}

export {
	activate,
	deactivate,
	consumeCore,
	core,
	consumeProfiles,
	profileManager,
	consumeToolBar,
	toolBar
};
