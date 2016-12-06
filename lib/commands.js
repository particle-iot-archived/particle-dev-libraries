'use babel';

import {CompositeDisposable} from 'event-kit';
import {packageName, getProjectDirectory} from './util/package-helper';
import {toolBar} from './index';


let disposables = null;
let toolBarButtons = {};

export function makeCmdName(name) {
	return `${packageName()}:${name}`;
}

export function registerCommands(atom,
	{libraryAddCommand, libraryMigrateCommand, libraryInitCommand, libraryContributeCommand, libraryPublishCommand}) {
	disposables = new CompositeDisposable();

	const commands = {};
	let addCallback = () => libraryAddCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('add')] = addCallback;
	toolBarButtons[makeCmdName('add')] = toolBar().addButton({
		icon: 'bookmark-plus',
		iconset: 'mdi',
		callback: addCallback,
		tooltip: 'Add a library to current project'
	});

	let migrateCallback = () => libraryMigrateCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('migrate')] = migrateCallback;
	toolBarButtons[makeCmdName('migrate')] = toolBar().addButton({
		icon: 'wand',
		iconset: 'ion',
		callback: migrateCallback,
		tooltip: 'Migrate legacy library to new format'
	});

	//commands[makeCmdName('init')] = () => libraryInitCommand(atom, getProjectDirectory(atom));
	//
	let contributeCallback = () => libraryContributeCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('upload')] = contributeCallback;
	toolBarButtons[makeCmdName('upload')] = toolBar().addButton({
		icon: 'package-up',
		iconset: 'mdi',
		callback: contributeCallback,
		tooltip: 'Upload your library as a private version'
	});

	let publishCallback = () => libraryPublishCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('publish')] = publishCallback;
	toolBarButtons[makeCmdName('publish')] = toolBar().addButton({
		icon: 'rocket',
		callback: publishCallback,
		tooltip: 'Publish your library for public consumption'
	});

	disposables.add(atom.commands.add('atom-workspace', commands));
}

export function unregisterCommands(atom) {
	disposables.dispose();
	disposables = null;
}
