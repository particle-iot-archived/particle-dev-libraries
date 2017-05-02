'use babel';

import { Notification } from 'atom';
import { mix } from 'mixwith';
const { LibraryMigrateCommandSite, LibraryMigrateCommand } = require('./cli');
import { runCommand } from './library';
import { noProjectSelected } from './library';
import Notifier from './mixins/notifier';


export function noLibraryProjectSelectedNotification() {
	return new Notification('warning', 'Please select a project containing a v1 library to migrate.', {
		dismissable:true
	});
}


export function notifyLibraryMigrating(lib) {
	return new Notification('info', 'Migrating library...');
}

export function notifyLibraryMigrated(lib, result, error) {
	let type = 'info';
	let msg;
	if (error) {
		type = 'error';
		msg = error.message || 'unknown error';
	} else {
		if (result) {
			msg = 'Library successfully migrated!';
		} else {
			msg = 'Nothing to do. The library was already migrated.';
		}
	}
	return new Notification(type, msg, { dismissable:true });
}

export function notificationForError(lib, err) {
	// todo - put the messages in the base class? so they are shared with the CLI
	if (err.name==='LibraryNotFoundError') {
		return noLibraryProjectSelectedNotification();
	} else {
		const msg = `An error occurred processing library '${lib}': ${err}`;
		return new Notification('error', msg);
	}
}

class DevLibraryMigrateCommandSite extends mix(LibraryMigrateCommandSite).with(Notifier) {

	constructor(atom, directory) {
		super();
		this.directory = directory;
		this.atom = atom;
	}

	getLibraries() {
		return [this.directory];
	}

	notifyStart(lib) {
		this.showNotification(notifyLibraryMigrating(lib));
	}

	/**
	 *
	 * @param {string} lib       The library that was migrated.
	 * @param {*} result    true if the library was migrated, false if it was already v2 format. undefined otherwise.
	 * @param {*} err       any error thrown during the migration process.
	 */
	notifyEnd(lib, result, err) {
		if (err) {
			this.handleError(lib, err);
		} else {
			this.showNotification(notifyLibraryMigrated(lib, result, err));
		}
	}

	handleError(lib, err) {
		this.showNotification(notificationForError(lib, err));
	}
}

/**
 * The main entrypoint for the library migration command.
 * @param {Atom} atom  The atom instance to use.
 * @param {string} directory The currently selected project directory.
 * @return {Promise|undefined} A promise to run the library migrate command.
 */
export function libraryMigrateCommand(atom, directory) {
	let promise;
	if (!directory) {
		promise = noProjectSelected();
	} else {
		const migrate = new LibraryMigrateCommand();
		promise = new DevLibraryMigrateCommandSite(atom, directory).run(migrate);
	}
	return runCommand(promise);
}
