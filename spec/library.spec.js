'use babel';

import {fetchApiClient} from '../lib/library';
const {LibraryDeleteCommandSite, LibraryDeleteCommand} = require('../lib/cli');

export class DevLibraryDeleteCommandSite extends LibraryDeleteCommandSite {
	constructor(apiClient, name) {
		super();
		this._apiClient = apiClient;
		this.name = name;
	}

	apiClient() {
		return this._apiClient;
	}

	libraryIdent() {
		return this.name;
	}

	/**
	 * Notifies the site that the command is about to retrieve the libraries.
	 * @param {Promise} promise	 The command to retrieve the libraries.
	 * @param {string} libraryIdent		 The identifier of the library/version
	 * @return {Promise} to list libraries
	 */
	notifyStart(promise, libraryIdent) {
		return promise;
	}

	notifyComplete(promise, result, error) {
		if (error) {
			throw error;
		}
	}
}

export function libraryDelete(name) {
	const apiClient = fetchApiClient();
	const command = new LibraryDeleteCommand();
	return new DevLibraryDeleteCommandSite(apiClient, name).run(command, {});
}
