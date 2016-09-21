'use babel';

import {Notification} from 'atom';
const {LibraryPublishCommandSite, LibraryPublishCommand} = require('./cli');
import {runCommand, noProjectSelectedNotification} from './library';
import {fetchApiClient} from './library';

export function noLibraryProjectSelectedNotification() {
	return new Notification('warning', 'Please select a project containing a v2 library to publish.', {
		dismissable:true
	});
}

export function notifyLibraryPublishing(lib) {
	return new Notification('info', `Publishing library ${lib.name}@${lib.metadata.version}...`);
}

export function notifyLibraryPublished(lib) {
	return new Notification('info', `Library ${lib.name}@${lib.metadata.version} was successfully published!`, {
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

class DevLibraryPublishCommandSite extends LibraryPublishCommandSite {
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
	 * @param {string} directory
	 */
	validatingLibrary(promise, directory) {
		this.showNotification(notifyLibraryValidating(directory));
	}

	/**
	 * Notification that library publishing is starting
	 * @param {Library} library   The loaded library
	 * @param {Promise} promise
	 */
	publishingLibrary(promise, library) {
		this.showNotification(notifyLibraryPublishing(library));
	}

	publishComplete(library) {
		console.log('publish complete');
		this.showNotification(notifyLibraryPublished(library));
	}
}

/**
 * The main entrypoint for the library publish command.
 * @param {Atom} atom  The atom instance to use.
 * @param {string} directory The currently selected project directory.
 */
export function libraryPublishCommand(atom, directory, dryRun=false) {
	console.log('publish', directory);
	if (!directory) {
		atom.notifications.addNotification(noProjectSelectedNotification());
	} else {
		const apiClient = fetchApiClient();
		const publish = new LibraryPublishCommand();
		return runCommand(new DevLibraryPublishCommandSite(atom, apiClient, directory, dryRun).run(publish, {}));
	}
}
