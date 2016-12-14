'use babel';

import {registerCommands, unregisterCommands} from './commands';
import {libraryAddCommand} from './library_add';
import {libraryMigrateCommand} from './library_migrate';
import {libraryInitCommand} from './library_init';
import {libraryContributeCommand} from './library_contribute';
import {libraryPublishCommand} from './library_publish';
import {toolBar} from './index';


function activate() {
	registerCommands(atom, toolBar(), {
		libraryAddCommand,
		libraryMigrateCommand,
		libraryInitCommand,
		libraryContributeCommand,
		libraryPublishCommand
	});
}

function deactivate() {
	unregisterCommands(atom);
}

function serialize() {
}

export {
	activate,
	deactivate,
	serialize
};
