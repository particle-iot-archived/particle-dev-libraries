'use babel';

import {packageName} from '../lib/util/package-helper';
import chai, {expect} from 'chai';
chai.use(require('chai-as-promised'));

import sinon from 'sinon';
import {profileManager} from '../lib/index';
import {setCommandResultPromise} from '../lib/library';
import {copySync} from 'fs-extra';

/**
 * We have to load the library command modules dynamically or we get
 * "EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".
 at /Users/mat1/dev/spark/libmgr/node_modules/lodash/lodash.js:14192:16
 at apply (/Users/mat1/dev/spark/libmgr/node_modules/lodash/lodash.js:408:27)
 at /Users/mat1/dev/spark/libmgr/node_modules/lodash/lodash.js:14576:16
 at /Users/mat1/dev/spark/libmgr/node_modules/lodash/lodash.js:10123:31
 at Function.template (/Users/mat1/dev/spark/libmgr/node_modules/lodash/lo
 */

export function buildGlobalAtom() {
	global.atom = global.buildAtomEnvironment({configDirPath: process.env.ATOM_HOME});
}

export function activatePackage() {
	return atom.packages.activatePackage(packageName());
}

export function deactivatePackage() {
	return atom.packages.deactivatePackage(packageName());
}

function closeNotifications() {
	// might need this to clear the global state between test failures
}


describe('given the package', () => {

	let workspaceElement;
	const cmdPrefix = packageName();

	/**
	 * We need this to ensure the package is loaded from the default configuration directory.
	 * It's a bit leaky for a test, but is good enough for now.
	 * By default, the mocha test runner creates a clean atom installation using a temp folder as the
	 * atom config directory.
	 */
	beforeEach(() => {
		buildGlobalAtom();

		workspaceElement = atom.views.getView(atom.workspace);
		expect(workspaceElement).to.be.ok;
	});

	afterEach(() => {
		workspaceElement = null;
		delete global.atom;
	});

	function notificationsSame(n1, n2) {
		return n1 && n2 && n1.message===n2.message && n1.type===n2.type;
	}


	function findNotification(expected, shouldExist=true) {
		const notifications = atom.notifications.getNotifications();
		if (shouldExist) {
			expect(notifications.length).to.be.greaterThan(0, 'no notifications visible, expected at least one');
		}
		let matched = false;
		for (let idx in notifications) {
			matched = matched || notificationsSame(notifications[idx], expected);
		}
		return matched;
	}

	/**
	 * Test helper that validates if the given notification exists or doesn't.
	 * @param expected
	 * @param shouldExist
	 */
	function expectNotification(expected, shouldExist=true) {
		const matched = findNotification(expected, shouldExist);
		if (matched!=shouldExist) {
			console.log(notifications);
			if (shouldExist) {
				expect(notifications[0].message).to.be.deep.equal(expected.message);
			} else {
				expect(matched).to.be.equal(shouldExist, `expected notification to not exist: ${expected.message}`);
			}
		}
	}

	/*
	it('is installed', () => {
		const pkgs = atom.packages.getAvailablePackageNames();
		const name = packageName();
		expect(pkgs).to.include(name);
	});
	*/

	it('can be loaded', function doit() {
		this.timeout(5000);
		activatePackage();
	});

	describe('commands', () => {
		const temp = require('temp').track();
		const fs = require('fs');
		const path = require('path');

		let projectDir;

		beforeEach(() => {
			notificationContainer = workspaceElement.querySelector('atom-notifications');
			atom.packages.activatePackage('particle-dev-profiles');
			return activatePackage();
		});

		afterEach(() => {
			closeNotifications();
			deactivatePackage();
		});

		it('the profiles manager is provided', () => {
			const pm = profileManager();
			expect(pm).to.be.ok;
		});

		describe('and a project directory is selected', () => {

			let disposables = [];

			beforeEach(() => {
				projectDir = temp.mkdirSync();
				atom.project.setPaths([projectDir]);
			});

			afterEach(() => {
				temp.cleanupSync();
				setCommandResultPromise(undefined);

				for (let idx in disposables) {
					disposables[idx].dispose();
				}
			});

			function projectPropertiesExists() {
				return fs.existsSync(path.join(projectDir, 'project.properties'));
			}

			function runMigrate(then) {
				setCommandResultPromise(then);
				atom.commands.dispatch(workspaceElement, cmdPrefix+':migrate');
				return then;
			}

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
					const resourcesDirectory = require('particle-cli-library-manager').resourcesDir;
					copySync(path.join(resourcesDirectory(), 'libraries', 'library-v1'), projectDir);
				});

				describe('and particle-dev-libraries:migrate" is run', () => {
					it('then it displays a migrating notification, migrates the library and displays a success notification', () => {
						let count = 0;
						const libMigrateModule = require('../lib/library_migrate');
						function notificationExpect(notification) {
							// only the first time
							expectNotification(libMigrateModule.notifyLibraryMigrating(projectDir), !count++);
						}

						disposables.push(atom.notifications.onDidAddNotification(notificationExpect));

						return runMigrate(() => {
							expect(count).to.be.greaterThan(0, 'expected notifications to be added');
							expectNotification(libMigrateModule.notifyLibraryMigrated(projectDir, true));
							expect(fs.existsSync(path.join(projectDir, 'library.properties'))).to.be.true;
						});
					});
				});
			});

			describe('that is a v2 library', () => {
				beforeEach(() => {
					const resourcesDirectory = require('particle-cli-library-manager').resourcesDir;
					copySync(path.join(resourcesDirectory(), 'libraries', 'library-v2'), projectDir);
				});

				describe('and particle-dev-libraries:migrate" is run', () => {
					it('leaves the library intact and displays a success notification', () => {
						return runMigrate(() => {
							const libMigrateModule = require('../lib/library_migrate');
							expectNotification(libMigrateModule.notifyLibraryMigrated(projectDir, false));
							expect(fs.existsSync(path.join(projectDir, 'library.properties'))).to.be.true;
						});
					});
				});
			});

			describe.skip('when "particle-dev-libraries:add" is run', () => {

				let clock;
				beforeEach(() => {
					clock = sinon.useFakeTimers();
					atom.commands.dispatch(workspaceElement, cmdPrefix+':add');
				});

				afterEach(() => {
					clock.restore();
				});

				let filterEditView;
				let selectLibrary;
				describe('then a dialog to select the library is shown which', () => {
					beforeEach(() => {
						const panels = atom.workspace.getModalPanels();
						const panel = panels[0];
						selectLibrary = panel.item;
						expect(selectLibrary).to.have.property('confirmed');
						expect(selectLibrary).to.have.property('cancelled');
						filterEditView = selectLibrary.filterEditorView;
						expect(filterEditView).to.be.ok;
					});

					describe('has initially', () => {

						it('no items', () => {
							expect(selectLibrary.getItems()).to.not.be.ok;
						});

						it('no selected item', () => {
							expect(selectLibrary.getSelectedItem()).to.not.be.ok;
						});

						it('placeholder text', () => {
							expect(filterEditView.getModel().getPlaceholderText()).to.contain('add');
						});

						it('no loading indicators', () => {
							expect(selectLibrary.loadingArea.is(':visible')).to.be.false;
						});

						afterEach(() => {
							atom.commands.dispatch(filterEditView, 'core:cancel');
						});
					});

					it('can be cancelled', () => {
						atom.commands.dispatch(filterEditView, 'core:cancel');
						expect(projectPropertiesExists()).to.be.false;
					});

					describe('the list initially populates without typing anything', () => {
						// actually it doesn't, the list is initially empty

						function waitForPopulate() {
							return new Promise((fulfill, reject) => {
								selectLibrary.events.on('listPopulated', () => {
									if (filterEditView.getModel().getText()) {
										clock.tick(selectLibrary.inputThrottle * 2);
										fulfill();
									}
								});
							});
						}

						beforeEach(() => {
							return waitForPopulate();
						});

					});

					it('can select a library by typing in part of the name', function doit() {
						this.timeout(10*1000);
						const libName = 'neopix';
						const promise = new Promise((fulfill, reject) => {
							selectLibrary.events.on('listPopulated', () => {
								if (filterEditView.getModel().getText()) {
									clock.tick(selectLibrary.inputThrottle * 2);
									fulfill();
								}
							});
							filterEditView.getModel().setText(libName);
							selectLibrary.populateList();
						});
						return promise.then(() => {
							const library = 'neopixel';
							expect(selectLibrary.getSelectedItem()).to.be.equal(library);
						});
					});

					it('has a number of items available', () => {
						// todo
					});

					it('filters the list based on the entered name', () => {
						// todo
					});

				});
			});
		});

		describe('given no project directory is selected', () => {
			beforeEach(() => {
				atom.project.setPaths([]);
			});

			function expectNoDirectoryNotificationIsShown() {
				const libModule = require('../lib/library');
				const expected = libModule.noProjectSelectedNotification();
				expectNotification(expected);
			}

			describe.skip('when "particle-dev-libraries:add" is run', () => {
				beforeEach(() => {
					atom.commands.dispatch(workspaceElement, cmdPrefix+':add');
				});

				it('displays a notification that no directory is selected', () => {
					expectNoDirectoryNotificationIsShown();
				});
			});

			describe('when "particle-dev-libraries:migrate" is run', () => {
				beforeEach(() => {
					atom.commands.dispatch(workspaceElement, cmdPrefix+':migrate');
				});

				it('displays a notification that no directory is selected', () => {
					expectNoDirectoryNotificationIsShown();
				});
			});
		});
	});

});
