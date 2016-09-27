'use babel';

import {expectNoDirectoryNotificationIsShown} from './project.spec';
import {projectNotSelectedScope} from './project.spec';
import {projectSelectedScope} from './project.spec';
import {expect} from 'chai';
import sinon from 'sinon';
import {runCommand} from './commands.spec';

projectSelectedScope((context) => {

	function projectPropertiesExists() {
		const fs = require('fs');
		const path = require('path');
		return fs.existsSync(path.join(context.projectDir, 'project.properties'));
	}

	describe('when "particle-dev-libraries:add" is run', () => {

		let clock;
		beforeEach(() => {
			clock = sinon.useFakeTimers();
			runCommand('add');
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
					const selected = selectLibrary.getSelectedItem();
					expect(selected).to.have.property('name').equal('neopixel');
					expect(selected).to.have.property('version');
					expect(selected).to.have.property('author');
				});
			});

			it.skip('has a number of items available', () => {
				// todo
			});

			it.skip('filters the list based on the entered name', () => {
				// todo
			});

		});
	});
});

projectNotSelectedScope((context) => {
	describe('when "particle-dev-libraries:add" is run', () => {

		beforeEach(() => {
			runCommand('add');
		});

		it('displays a notification that no directory is selected', () => {
			expectNoDirectoryNotificationIsShown();
		});
	});
});
