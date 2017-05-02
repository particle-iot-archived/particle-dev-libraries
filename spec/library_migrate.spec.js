'use babel';

import { expect } from 'chai';
import { copySync } from 'fs-extra';
import { expectNotification } from './package.spec';
import { projectSelectedScope } from './project.spec';
import { runCommand } from './commands.spec';
import { expectNoDirectoryNotificationIsShown } from './project.spec';
import { projectNotSelectedScope } from './project.spec';


function runMigrate(then) {
	return runCommand('migrate', then);
}

projectSelectedScope((context) => {

	const fs = require('fs');
	const path = require('path');

	function expectNoLibraryProjectNotificationIsShown() {
		const libMigrateModule = require('../lib/library_migrate');
		const expected = libMigrateModule.noLibraryProjectSelectedNotification();
		expectNotification(expected);
	}

	describe('that is not a library', () => {
		it('then displays an error that the current project isn\'t a library', () => {
			return runMigrate(() => {
				expectNoLibraryProjectNotificationIsShown();
			});
		});
	});

	describe('that is a v1 library', () => {
		beforeEach(() => {
			const resourcesDirectory = require('particle-library-manager').resourcesDir;
			copySync(path.join(resourcesDirectory(), 'libraries', 'library-v1'), context.projectDir);
		});

		describe('and particle-dev-libraries:migrate" is run', () => {
			it('then it displays a migrating notification, migrates the library and displays a success notification', () => {
				let count = 0;
				const libMigrateModule = require('../lib/library_migrate');
				const notifications = [
					libMigrateModule.notifyLibraryMigrating(context.projectDir),
					libMigrateModule.notifyLibraryMigrated(undefined, true)
				];

				function notificationExpect(notification) {
					const expected = notifications[count];
					count++;
					console.log('migrate notification', notification.message);
					expectNotification(expected, true);
				}

				context.disposables.push(atom.notifications.onDidAddNotification(notificationExpect));

				return runMigrate(() => {
					expect(count).to.be.greaterThan(0, 'expected notifications to be added');
					//expectNotification(libMigrateModule.notifyLibraryMigrated(context.projectDir, true));
					//expect(fs.existsSync(path.join(context.projectDir, 'library.properties'))).to.be.true;
				});
			});
		});
	});

	describe('that is a v2 library', () => {
		beforeEach(() => {
			const resourcesDirectory = require('particle-library-manager').resourcesDir;
			console.log('projectDir', context.projectDir);
			copySync(path.join(resourcesDirectory(), 'libraries', 'library-v2'), context.projectDir);
		});

		describe('and particle-dev-libraries:migrate" is run', () => {
			it('leaves the library intact and displays a success notification', () => {
				return runMigrate(() => {
					const libMigrateModule = require('../lib/library_migrate');
					expectNotification(libMigrateModule.notifyLibraryMigrated(context.projectDir, false));
					expect(fs.existsSync(path.join(context.projectDir, 'library.properties'))).to.be.true;
				});
			});
		});
	});
});

projectNotSelectedScope((context) => {

	describe('when "particle-dev-libraries:migrate" is run', () => {
		it('displays a notification that no directory is selected', () => {
			return runMigrate(() => {
				expectNoDirectoryNotificationIsShown();
			});
		});
	});
});



