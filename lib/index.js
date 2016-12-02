'use babel';

import {allowUnsafeNewFunction} from 'loophole';
import CloudVariablesView from './view';
import {registerCommands, unregisterCommands} from './commands';
import {libraryAddCommand} from './library_add';
import {libraryMigrateCommand} from './library_migrate';
import {libraryInitCommand} from './library_init';
import {libraryContributeCommand} from './library_contribute';
import {libraryPublishCommand} from './library_publish';
import {packageName, getProjectDirectory} from './util/package-helper';

let particleDev;

function librariesOpenPane() {
  if (particleDev) {
    var cloudVariablesView = new CloudVariablesView(particleDev);

    particleDev.openPane(cloudVariablesView.getPath());
  }
}

function activate() {
	allowUnsafeNewFunction(()=> {
		require('atom-package-deps').install('particle-dev-libraries', true);
		const main = require('./index_loophole');
		main.activate();

    atom.packages.activatePackage('particle-dev').then((dev) => {
      particleDev = dev.mainModule;
    });
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

function consumeToolBar(getToolBar) {
	let toolBar = getToolBar('particle-dev-libraries');

  toolBar.addSpacer();

  toolBar.addButton({
    icon: 'bookmark',
    callback: librariesOpenPane,
    tooltip: 'Libraries'
  });

  toolBar.addButton({
    icon: 'bookmark',
    callback: libraryAddCommand,
    tooltip: 'Library add'
  });

  toolBar.addButton({
    icon: 'bookmark',
    callback: libraryMigrateCommand.bind(this, atom, getProjectDirectory(atom)),
    tooltip: 'Library migrate'
  });

  toolBar.addButton({
    icon: 'star',
    callback: libraryInitCommand.bind(this, atom, getProjectDirectory(atom)),
    tooltip: 'Library init - test'
  });

  toolBar.addButton({
    icon: 'bookmark',
    callback: libraryContributeCommand.bind(this, atom, getProjectDirectory(atom)),
    tooltip: 'Library contribute'
  });

  toolBar.addButton({
    icon: 'bookmark',
    callback: libraryPublishCommand.bind(this, atom, getProjectDirectory(atom)),
    tooltip: 'Library publish'
  });

  toolBar.onDidDestroy(() => {
    this.toolBar = null;
  });
}

export {
	activate,
	consumeProfiles,
	profileManager,
	onDidSetProfileManager,
	consumeToolBar
};
