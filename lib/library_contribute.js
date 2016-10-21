'use babel';

import {Notification} from 'atom';
const {LibraryContributeCommandSite, LibraryContributeCommand} = require('./cli');
import {runCommand, noProjectSelectedNotification} from './library';
import {fetchApiClient} from './library';

export function noLibraryProjectSelectedNotification() {
	return new Notification('warning', 'Please select a project containing a v2 library to contribute.', {
		dismissable:true
	});
}

export function notifyLibraryContributing(lib) {
	return new Notification('info', `Contributing library ${lib.name}@${lib.metadata.version}...`);
}

export function notifyLibraryContributed(lib) {
	return new Notification('info', `Library ${lib.name}@${lib.metadata.version} was successfully contributed!` +
		'It\'s only visible to you. You need to publish it to be available for others.', {
		dismissable:true
	});
}

export function notifyLibraryValidating(directory) {
	return new Notification('info', `Validating directory ${directory}...`);
}

export function notifyValidationError(message) {
	return new Notification('error', message, {
		dismissable:true
	});
}

class DevLibraryContributeCommandSite extends LibraryContributeCommandSite {
	constructor(atom, apiClient, libraryDirectory, dryRun=true) {
		super();
		this.atom = atom;
		this._libraryDirectory = libraryDirectory;
		this._apiClient = apiClient;
		this._dryRun = dryRun;
		this.notification = null;
	}

	// todo - how to share this with the same implementation in library migrate?
	removeNotification() {
		if (this.notification!==null) {
			this.notification.dismiss();
			this.notification = null;
		}
	}

	showNotification(notification) {
		this.removeNotification();
		this.notification = notification;
		this.atom.notifications.addNotification(notification);
	}


	apiClient() {
		return this._apiClient;
	}

	dryRun() {
		return this._dryRun;
	}

	libraryDirectory() {
		return this._libraryDirectory;
	}

	validationError(err) {
		this.showNotification(notifyValidationError(err.message));
	}

	error(err) {
		throw err;
	}

	/**
	 * Notification that the library directory is being checked. The library is validated and then loaded.
	 * @param {Promise} promise The promise to validate the library.
	 * @param {string} directory
	 */
	validatingLibrary(promise, directory) {
		this.showNotification(notifyLibraryValidating(directory));
	}

	/**
	 * Notification that library contributing is starting
	 * @param {Promise} promise  The promise to contribute the library. Can be extended and a new promise returned.
	 * @param {Library} library  The loaded library
	 */
	contributingLibrary(promise, library) {
		this.showNotification(notifyLibraryContributing(library));
	}

	contributeComplete(library) {
		console.log('contribute complete');
		this.showNotification(notifyLibraryContributed(library));
	}
}

/**
 * The main entrypoint for the library contribute command.
 * @param {Atom} atom  The atom instance to use.
 * @param {string} directory The currently selected project directory.
 * @param {boolean} dryRun  If the contributing should be skipped or executed. The contribute is executed by default - it
 * can be skipped for testing by specifying dryRun=false.
 * @returns {Promise|undefined} A promise to run the command or undefined if there is no future work to do.
 */
export function libraryContributeCommand(atom, directory, dryRun=false) {
	console.log('contribute', directory);
	if (!directory) {
		atom.notifications.addNotification(noProjectSelectedNotification());
	} else {
		const apiClient = fetchApiClient();
		const contribute = new LibraryContributeCommand();
		return runCommand(new DevLibraryContributeCommandSite(atom, apiClient, directory, dryRun).run(contribute, {}));
	}
}