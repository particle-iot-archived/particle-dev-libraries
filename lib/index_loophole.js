'use babel';

import {registerCommands, unregisterCommands} from './commands';
import {libraryAddCommand} from './library_add';
import {libraryMigrateCommand} from './library_migrate';
import {libraryInitCommand} from './library_init';


function activate() {
	registerCommands(atom, {libraryAddCommand, libraryMigrateCommand, libraryInitCommand});
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
