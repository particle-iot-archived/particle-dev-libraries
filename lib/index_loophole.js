'use babel';

import {registerCommands, unregisterCommands} from './commands';
import {libraryAddCommand} from './library_add';
import {libraryMigrateCommand} from './library_migrate';
import {libraryInitCommand} from './library_init';
import {libraryContributeCommand} from './library_contribute';
import {libraryPublishCommand} from './library_publish';


function activate() {
	registerCommands(atom, {
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
