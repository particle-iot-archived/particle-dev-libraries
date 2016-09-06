'use babel';

import {packageName} from '../lib/util/package-helper';
import chai, {expect} from 'chai';
chai.use(require('chai-as-promised'));

import sinon from 'sinon';
import {profileManager} from '../lib/index';

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


	/*
	it('is installed', () => {
		const pkgs = atom.packages.getAvailablePackageNames();
		const name = packageName();
		expect(pkgs).to.include(name);
	});
	*/

	it('can be loaded', () => {
		activatePackage();
	});

	describe('commands', () => {
		const temp = require('temp').track();
		const fs = require('fs');
		const path = require('path');

		let projectDir;
		let notificationContainer;

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

			beforeEach(() => {
				projectDir = temp.mkdirSync();
				atom.project.setPaths([projectDir]);
			});

			afterEach(() => {
				temp.cleanupSync();
			});

			function projectPropertiesExists() {
				return fs.existsSync(path.join(projectDir, 'project.properties'));
			}

			describe('when "particle-dev-libraries:migrate" is run', () => {
				beforeEach(() => {
					atom.commands.dispatch(workspaceElement, cmdPrefix+':migrate');
				});

				it('displays a message that the current project is not a v1 library', () => {
					
				});
			});


			describe('when "particle-dev-libraries:add" is run', () => {

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

					it('can be cancelled', () => {
						atom.commands.dispatch(filterEditView, 'core:cancel');
						expect(projectPropertiesExists()).to.be.false;
					});

					describe('the list initially populates without typing anything', () => {

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


					it('can select a library by typing in part of the name',  function doit() {
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
				const notifications = atom.notifications.getNotifications();
				const expected = libModule.noProjectSelectedNotification();
				expect(notifications[0].message).to.be.deep.equal(expected.message);
			}

			describe('when "particle-dev-libraries:add" is run', () => {
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
