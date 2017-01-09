'use babel';

import {Notification} from 'atom';
import {mix} from 'mixwith';
const {LibraryInstallCommandSite} = require('./cli');
import {fetchApiClient} from './library';
import Notifier from './mixins/notifier';

export function notifyLibraryChecking(name) {
	return new Notification('info', `Checking for ${name} library...`);
}

export function notifyLibraryInstalling(name) {
	return new Notification('info', `Installing ${name} library...`);
}

export class DevLibraryInstallSite extends mix(LibraryInstallCommandSite).with(Notifier) {
	constructor(dir, callback, vendored=false) {
		super();
		this.dir = dir;
		this.installedLibraryCallback = callback;
		this.vendored = vendored;
	}

	apiClient() {
		return fetchApiClient();
	}

	libraryName() {
		return this.name;
	}

	setLibraryName(name) {
		this.name = name;
	}

	targetDirectory() {
		return this.dir;
	}

	isVendored() {
		return this.vendored;
	}

	notifyCheckingLibrary(libName) {
		this.showNotification(notifyLibraryChecking(this.name));
		return Promise.resolve();
	}

	notifyFetchingLibrary(lib, targetDir) {
		this.showNotification(notifyLibraryInstalling(this.name));
		return Promise.resolve();
	}

	notifyInstalledLibrary(lib, targetDir) {
		return this.installedLibraryCallback(lib, targetDir);
	}
}
