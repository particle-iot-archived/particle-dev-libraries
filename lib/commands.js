'use babel';

import {CompositeDisposable} from 'event-kit';
import {packageName, getProjectDir} from './util/package-helper';


let disposables = null;


export function makeCmdName(name) {
	return packageName()+':'+name;
}

export function registerCommands(atom,
	{libraryAddCommand, libraryMigrateCommand, libraryInitCommand}) {
	disposables = new CompositeDisposable();

	const commands = {};
	commands[makeCmdName('add')] = () => libraryAddCommand(atom, getProjectDir(atom));
	commands[makeCmdName('migrate')] = () => libraryMigrateCommand(atom, getProjectDir(atom));
	commands[makeCmdName('init')] = () => libraryInitCommand(atom, getProjectDir(atom));
	disposables.add(atom.commands.add('atom-workspace', commands));
}

export function unregisterCommands(atom) {
	disposables.dispose();
	disposables = null;
}
