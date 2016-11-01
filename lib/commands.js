'use babel';

import {CompositeDisposable} from 'event-kit';
import {packageName, getProjectDirectory} from './util/package-helper';


let disposables = null;


export function makeCmdName(name) {
	return `${packageName()}:${name}`;
}

export function registerCommands(atom,
	{libraryAddCommand, libraryMigrateCommand, libraryInitCommand, libraryContributeCommand, libraryPublishCommand}) {
	disposables = new CompositeDisposable();

	const commands = {};
	commands[makeCmdName('add')] = () => libraryAddCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('migrate')] = () => libraryMigrateCommand(atom, getProjectDirectory(atom));
	//commands[makeCmdName('init')] = () => libraryInitCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('contribute')] = () => libraryContributeCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('publish')] = () => libraryPublishCommand(atom, getProjectDirectory(atom));
	disposables.add(atom.commands.add('atom-workspace', commands));
}

export function unregisterCommands(atom) {
	disposables.dispose();
	disposables = null;
}
