'use babel';

import path from 'path';
import { copySync } from 'fs-extra';
import { expectNotification } from './package.spec';
import { projectSelectedScope } from './project.spec';
import { runCommand } from './commands.spec';
import { libraryDelete } from './library.spec';

projectSelectedScope((context) => {

	/* unused
	function expectNoLibraryProjectNotificationIsShown() {
		const module = require('../lib/library_contribute');
		const expected = module.noLibraryProjectSelectedNotification();
		expectNotification(expected);
	}
	*/

	function expectValidationErrorNotification(msg) {
		const module = require('../lib/library_contribute');
		const expected = module.notifyValidationError(msg);
		expectNotification(expected);
	}

	function expectLibraryIsNotValidNotificationIsShown() {
		return expectValidationErrorNotification('Library is not valid. library is missing library.properties');
	}

	function expectLibraryMustBeMigratedFromV1Notification() {
		return expectValidationErrorNotification('Library is not valid. library must be migrated from v1 format');
	}

	function runContribute(then) {
		return runCommand('contribute', then);
	}

	describe('and library contribute is run in a directory', () => {
		describe('that is not a library', () => {
			it('then displays an error that the current project isn\'t a library', () => {
				return runContribute(() => {
					expectLibraryIsNotValidNotificationIsShown();
				});
			});
		});

		describe('that is a v1 library', () => {
			beforeEach(() => {
				const resourcesDirectory = require('particle-library-manager').resourcesDir;
				copySync(path.join(resourcesDirectory(), 'libraries', 'library-v1'), context.projectDir);
			});

			it('then displays an error that the current project isn\'t a library', () => {
				return runContribute(() => {
					expectLibraryMustBeMigratedFromV1Notification();
				});
			});
		});

		describe('that is a v2 library', () => {
			const libraryName = 'test-library-publish';
			let resourcesDirectory;
			before(() => {
				resourcesDirectory = require('particle-library-manager').resourcesDir;
			});

			it('can delete the existing library', () => {
				return libraryDelete(libraryName);
			});

			it('can contribute the library', () => {
				const version = '0.0.1';
				copySync(path.join(resourcesDirectory(), 'libraries', 'contribute', 'valid', version), context.projectDir);
				const module = require('../lib/library_contribute');
				return runContribute(() => {
					return expectNotification(module.notifyLibraryValidating(context.projectDir + '/'));
				}).then(() => {
					return expectNotification(module.notifyLibraryContributed({ name:libraryName, metadata: { version } }));
				});
			});

			it('can contribute the library with a new version', () => {
				const version = '0.0.2';
				copySync(path.join(resourcesDirectory(), 'libraries', 'contribute', 'valid', version), context.projectDir);
				const module = require('../lib/library_contribute');
				return runContribute(() => {
					return expectNotification(module.notifyLibraryValidating(context.projectDir + '/'));
				}).then(() => {
					return expectNotification(module.notifyLibraryContributed({ name:libraryName, metadata: { version } }));
				});
			});

			it('can delete the existing library as cleanup', () => {
				return libraryDelete(libraryName);
			});

		});
	});
});
