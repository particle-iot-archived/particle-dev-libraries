'use babel';

import {registerCommands, unregisterCommands} from './commands';
import {libraryAddCommand} from './library_add';
import {libraryMigrateCommand} from './library_migrate';
import {libraryInitCommand} from './library_init';
import {libraryContributeCommand} from './library_contribute';


function activate() {
	registerCommands(atom, {libraryAddCommand, libraryMigrateCommand, libraryInitCommand, libraryContributeCommand});
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
