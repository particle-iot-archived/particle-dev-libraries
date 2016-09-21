'use babel';

import {projectNotSelectedScope} from './project.spec';
import {projectSelectedScope} from './project.spec';
import {expect} from 'chai';
import sinon from 'sinon';
import path from 'path';
import {setCommandResultPromise} from '../lib/library';
import {getProjectDirectory, setProjectDirectory} from '../lib/util/package-helper';
import {runCommand} from './commands.spec'

projectSelectedScope((context) => {

	function libraryPropertiesExists() {
		const fs = require('fs');
		const path = require('path');
		return fs.existsSync(path.join(context.projectDir, 'library.properties'));
	}

	describe('when "particle-dev-libraries:init" is run', () => {
		let libraryDirectory;
		const libraryName = 'myfablib';
		const libraryNameAlt = 'testlib';
		const libraryNameBad = 'test bad';
		let after = Promise.resolve();

		function runLibraryInit(then) {
			runCommand('init', then);
		}

		beforeEach(() => {
			libraryDirectory = path.join(context.projectDir, libraryName);
			const fsextra = require('fs-extra');
			fsextra.mkdirpSync(libraryDirectory);
			setProjectDirectory(atom, libraryDirectory);
			expect(getProjectDirectory(atom)).to.be.equal(libraryDirectory);
		});

		describe('then a dialogue appears with fields for defining a new library', () => {

			let panel;
			beforeEach(() => {
				const libraryInit = require('../lib/library_init');
				runLibraryInit();

				panel = libraryInit.findLibraryInitPanel();
				expect(panel).to.be.ok;
			});

			function findLibraryInitPanel() {
				const libraryInit = require('../lib/library_init');
				return libraryInit.findLibraryInitPanel();
			}

			afterEach(() => {
				const stillOpen = findLibraryInitPanel();
				if (stillOpen) {
					stillOpen.item.close();
				}
				expect(findLibraryInitPanel()).to.be.undefined;
			});

			it('can be cancelled with no input', () => {
				expect(panel).to.be.ok;
				expect(findLibraryInitPanel()).to.not.be.undefined;
				const cancel = panel.item.cancelButton;
				expect(cancel).to.be.ok;
				cancel.click();
				expect(findLibraryInitPanel()).to.be.undefined;
			});

			it('cannot be closed while the inputs are empty', () => {
				const proceed = panel.item.proceedButton;
				expect(proceed).to.be.ok;
				proceed.click();
				expect(findLibraryInitPanel()).to.be.deep.equal(panel);
			});

			describe('and given valid inputs', () => {
				const validValues = {
					directory: '/a/b/c',
					name: libraryName,
					version: '0.0.1',
					author: 'me',
					dryRun: true
				};

				beforeEach(() => {
					panel.item.dryRun = true;
					panel.item.directory.value = validValues.directory;
					panel.item.name.value = validValues.name;
					panel.item.version.value = validValues.version;
					panel.item.author.value = validValues.author;

					expect(panel.item.captureErrors()).to.be.deep.equal({});
					expect(panel.item.isValid()).to.be.true;
				});

				it('then it can be closed', () => {
					panel.item.proceedButton.click();
					expect(findLibraryInitPanel()).to.be.undefined;
				});

				it('collects the entered values', () => {
					const original = panel.item.outcome;
					panel.item.outcome = (result) => {
						original(result);
						expect(result).to.be.deep.equal(validValues);
					};

					panel.item.proceedButton.click();
				});
			});


			describe('which has a name field that', () => {
				let nameEditor;
				beforeEach(() => {
					nameEditor = panel.item.name;
					expect(nameEditor).to.be.ok;
					expect(nameEditor.editorModel).to.be.ok;
				});

				it('is initially the last component of the project directory', () => {
					expect(nameEditor.editorModel.getText()).to.equal(libraryName);
					expect(nameEditor.error).to.be.equal('');
				});

				it('can be set to a valid library name', () => {
					nameEditor.editorModel.setText(libraryNameAlt);
					expect(nameEditor.editorModel.getText()).to.equal(libraryNameAlt);
					expect(nameEditor.error).to.be.equal('');
				});

				it('when set to an invalid library name produces an error message', () => {
					nameEditor.value = libraryNameBad;
					expect(nameEditor.value).to.equal(libraryNameBad);
					expect(nameEditor.error).to.contain('underscores');
				});
			});
		});
	});
});
