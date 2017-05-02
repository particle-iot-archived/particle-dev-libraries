'use babel';

import fs from 'fs';
import path from 'path';
import { Notification } from 'atom';
const { LibraryPublishCommandSite, LibraryPublishCommand } = require('./cli');
import { runCommand, noProjectSelectedNotification } from './library';
import { fetchApiClient } from './library';
import { FileSystemLibraryRepository, FileSystemNamingStrategy } from 'particle-library-manager';
import { core } from './index';

export function noLibraryProjectSelectedNotification() {
	return new Notification('warning', 'Please select a library directory to publish.', {
		dismissable:true
	});
}

export function publishingLibraryErrorNotification() {
	return new Notification('error', 'There was an error while publishing library. Please try again later.', {
		dismissable:true
	});
}

export function notifyLibraryPublishing(ident) {
	return new Notification('info', `Publishing library ${ident}...`);
}

export function notifyLibraryPublished(lib) {
	return new Notification('info', `Library ${lib.name}@${lib.version} was successfully published! It's available for others now.`, {
		dismissable:true
	});
}

class DevLibraryPublishCommandSite extends LibraryPublishCommandSite {
	constructor(atom, apiClient, libraryDirectory) {
		super();
		this.atom = atom;
		this._apiClient = apiClient;
		this._libraryDirectory = libraryDirectory;
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

	/**
	 * Retrieves the co-ordinates of the library to publish.
	 * @returns {String} library name
	 */
	libraryIdent() {
		const repo = new FileSystemLibraryRepository(this._libraryDirectory, FileSystemNamingStrategy.DIRECT);
		return repo.fetch('').then((lib) => {
			return lib.metadata.name;
		});
	}


	error(err) {
		throw err;
	}

	/**
	 * Notification that library publishing is starting
	 * @param {Promise} promise	The promise to publish the library. Can be extended and a new promise returned.
	 * @param {Library} ident	The loaded library name
	 */
	publishingLibrary(promise, ident) {
		this.showNotification(notifyLibraryPublishing(ident));
	}

	publishLibraryComplete(library) {
		console.log('publish complete');
		this.showNotification(notifyLibraryPublished(library));
	}
}

/**
 * The main entrypoint for the library publish command.
 * @param {Atom} atom	The atom instance to use.
 * @param {string} directory The currently selected project directory.
 * @returns {Promise|undefined} A promise to run the command or undefined if there is no future work to do.
 */
export function libraryPublishCommand(atom, directory) {
	console.log('publish', directory);
	if (!directory) {
		atom.notifications.addNotification(noProjectSelectedNotification());
	} else if (!fs.existsSync(path.join(directory, 'library.properties'))) {
		atom.notifications.addNotification(noLibraryProjectSelectedNotification());
	} else {
		const apiClient = fetchApiClient();
		const publish = new LibraryPublishCommand();
		const promise = core().runParticleCommand(new DevLibraryPublishCommandSite(atom, apiClient, directory), publish);

		return runCommand(promise).catch(err => {
			atom.notifications.addNotification(publishingLibraryErrorNotification(err));
		});
	}
}
