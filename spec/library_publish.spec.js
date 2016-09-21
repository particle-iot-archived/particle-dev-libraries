'use babel';

import path from 'path';
import {copySync} from 'fs-extra';
import {expect} from 'chai';
import {expectNotification} from './package.spec';
import {projectSelectedScope} from './project.spec';
import {runCommand} from './commands.spec';
import {fetchApiClient} from '../lib/library';

const {LibraryDeleteCommandSite, LibraryDeleteCommand} = require('../lib/cli');

class DevLibraryDeleteCommandSite extends LibraryDeleteCommandSite {
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
	 * @param {Promise}promise   The command to retrieve the libraries.
	 * @param {string}filter     Optional
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

function libraryDelete(name) {
	const apiClient = fetchApiClient();
	const command = new LibraryDeleteCommand();
	return new DevLibraryDeleteCommandSite(apiClient, name).run(command, {});
}


projectSelectedScope((context) => {

	function expectNoLibraryProjectNotificationIsShown() {
		const module = require('../lib/library_publish');
		const expected = module.noLibraryProjectSelectedNotification();
		expectNotification(expected);
	}

	function expectValidationErrorNotification(msg) {
		const module = require('../lib/library_publish');
		const expected = module.notifyValidationError(msg);
		expectNotification(expected);
	}

	function expectLibraryIsNotValidNotificationIsShown() {
		return expectValidationErrorNotification('Library is not valid. library is missing library.properties');
	}

	function expectLibraryMustBeMigratedFromV1Notification() {
		return expectValidationErrorNotification('Library is not valid. library must be migrated from v1 format');
	}

	function runPublish(then) {
		return runCommand('publish', then);
	}

	function expectPublishLibrary(notification) {
		return runPublish(() => {
			expectNotification(notification);
		});
	}

	describe('and library publish is run in a directory', () => {
		describe('that is not a library', () => {
			it('then displays an error that the current project isn\'t a library', () => {
				return runPublish(() => {
					expectLibraryIsNotValidNotificationIsShown();
				});
			});
		});

		describe('that is a v1 library', () => {
			beforeEach(() => {
				const resourcesDirectory = require('particle-cli-library-manager').resourcesDir;
				copySync(path.join(resourcesDirectory(), 'libraries', 'library-v1'), context.projectDir);
			});

			it('then displays an error that the current project isn\'t a library', () => {
				return runPublish(() => {
					expectLibraryMustBeMigratedFromV1Notification();
				});
			});
		});

		describe('that is a v2 library', () => {
			const libraryName = 'test-library-publish';
			let resourcesDirectory;
			before(() => {
				resourcesDirectory = require('particle-cli-library-manager').resourcesDir;
			});

			it('can delete the existing library', () => {
				return libraryDelete(libraryName);
			});

			it('can publish the library', () => {
				const version = '0.0.1';
				copySync(path.join(resourcesDirectory(), 'libraries', 'publish', 'valid', version), context.projectDir);
				const module = require('../lib/library_publish');
				const publish = expectPublishLibrary(module.notifyLibraryPublished({name:libraryName, metadata: {version}}));
				return publish;
			});

			it('cannot republish the same version of the library', () => {
				const version = '0.0.1';
				copySync(path.join(resourcesDirectory(), 'libraries', 'publish', 'valid', version), context.projectDir);
				const module = require('../lib/library_publish');
				return expect(runPublish(() => {})).to.eventually.be.rejectedWith('This version already exists. Version must be greater than 0.0.1');
			});

			it('can publish the library with a new version', () => {
				const version = '0.0.2';
				copySync(path.join(resourcesDirectory(), 'libraries', 'publish', 'valid', version), context.projectDir);
				const module = require('../lib/library_publish');
				const publish = expectPublishLibrary(module.notifyLibraryPublished({name:libraryName, metadata: {version}}));
				return publish;
			});

			it('can delete the existing library as cleanup', () => {
				return libraryDelete(libraryName);
			});

		});
	});
});