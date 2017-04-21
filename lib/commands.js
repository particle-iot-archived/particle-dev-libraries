'use babel';

import { CompositeDisposable } from 'event-kit';
import { packageName, getProjectDirectory } from './util/package-helper';

let disposables = null;
let toolBarButtons = {};

export function makeCmdName(name) {
	return `${packageName()}:${name}`;
}

export function makeProjectCmdName(name) {
	return `particle:${name}`;
}


export function registerCommands(atom, toolBar,
	{
		libraryAddCommand, libraryMigrateCommand, libraryInitCommand, libraryContributeCommand, libraryPublishCommand,
		librariesShow, libraryManagementShow, projectInitCommand
	}) {
	disposables = new CompositeDisposable();

	const commands = {};
	let addCallback = () => libraryAddCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('add')] = addCallback;

	const projectInitCallback = () => projectInitCommand(atom);
	commands[makeProjectCmdName('project-init')] = projectInitCallback;
	toolBarButtons[makeProjectCmdName('project-init')] = toolBar.addButton({
		icon: 'file-code',
		callback: projectInitCallback,
		tooltip: 'Start a new project',
		priority: 534
	});

	let librariesShowCallback = () => librariesShow();
	commands[makeCmdName('show-libraries')] = addCallback;
	toolBarButtons[makeCmdName('show-libraries')] = toolBar.addButton({
		icon: 'bookmark',
		iconset: 'ion',
		callback: librariesShowCallback,
		tooltip: 'Browse and manage Particle libraries',
		priority: 535
	});

	let libraryManagementCallback = () => libraryManagementShow();
	commands[makeCmdName('show-library-management')] = libraryManagementCallback;
	toolBarButtons[makeCmdName('show-library-management')] = toolBar.addButton({
		icon: 'compose',
		iconset: 'ion',
		callback: libraryManagementCallback,
		tooltip: 'Manage current library',
		priority: 536
	});

	let migrateCallback = () => libraryMigrateCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('migrate')] = migrateCallback;
	// toolBarButtons[makeCmdName('migrate')] = toolBar.addButton({
	// 	icon: 'wand',
	// 	iconset: 'ion',
	// 	callback: migrateCallback,
	// 	tooltip: 'Migrate legacy library to new format',
	// 	priority: 536
	// });

	//commands[makeCmdName('init')] = () => libraryInitCommand(atom, getProjectDirectory(atom));
	//
	let contributeCallback = () => libraryContributeCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('upload')] = contributeCallback;
	// toolBarButtons[makeCmdName('upload')] = toolBar.addButton({
	// 	icon: 'package-up',
	// 	iconset: 'mdi',
	// 	callback: contributeCallback,
	// 	tooltip: 'Upload your library as a private version',
	// 	priority: 537
	// });

	let publishCallback = () => libraryPublishCommand(atom, getProjectDirectory(atom));
	commands[makeCmdName('publish')] = publishCallback;
	// toolBarButtons[makeCmdName('publish')] = toolBar.addButton({
	// 	icon: 'rocket',
	// 	callback: publishCallback,
	// 	tooltip: 'Publish your library for public consumption',
	// 	priority: 538
	// });

	disposables.add(atom.commands.add('atom-workspace', commands));
}

export function unregisterCommands(atom) {
	disposables.dispose();
	disposables = null;
}
