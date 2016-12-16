'use babel';

const {LibraryInstallCommandSite} = require('./cli');
import {fetchApiClient} from './library';

export class DevLibraryInstallSite extends LibraryInstallCommandSite {
	constructor(dir, callback) {
		super();
		this.dir = dir;
		this.installedLibraryCallback = callback;
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

	notifyInstalledLibrary(lib, targetDir) {
		return this.installedLibraryCallback(lib, targetDir);
	}
}
