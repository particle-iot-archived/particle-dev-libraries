'use babel';

import { projectSelectedScope, projectNotSelectedScope } from './project.spec';
import { expect } from 'chai';
import path from 'path';
import { getProjectDirectory, setProjectDirectory } from '../lib/util/package-helper';
import { runCommand } from './commands.spec';
import { expectNoDirectoryNotificationIsShown } from './project.spec';
import temp from 'temp';


function runLibraryInit(then) {
	return runCommand('init', then);
}

projectSelectedScope((context) => {

	/* unused
	function libraryPropertiesExists() {
		const fs = require('fs');
		const path = require('path');
		return fs.existsSync(path.join(context.projectDir, 'library.properties'));
	}
	*/

	function expectCanSetText(editor, text, error='') {
		editor.editorModel.setText(text);
		expect(editor.editorModel.getText()).to.equal(text);
		expect(editor.error).to.be.equal(error);
	}

	describe('when "particle-dev-libraries:init" is run', () => {
		let libraryDirectory;
		const libraryName = 'myfablib';
		const libraryNameAlt = 'testlib';
		const libraryNameBad = 'test bad';

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

			function pressProceed() {
				const proceed = panel.item.proceedButton;
				expect(proceed).to.be.ok;
				proceed.click();
			}

			it('cannot be closed while the inputs are empty', () => {
				pressProceed();
				expect(findLibraryInitPanel()).to.be.deep.equal(panel);
			});

			it('displays validation errors while the inputs are empty', () => {
				panel.item.name.value = '';
				panel.item.version.value = '';
				panel.item.author.value = ''; // not strictly necessary - is empty by default

				pressProceed();
				expect(findLibraryInitPanel()).to.be.deep.equal(panel);

				expect(panel.item.name.error).to.not.be.equal('');
				expect(panel.item.version.error).to.not.be.equal('');
				expect(panel.item.author.error).to.not.be.equal('');
			});

			describe('and given valid inputs', () => {
				const validValues = {
					directory: '/a/b/c',
					name: libraryName,
					version: '0.0.3',
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
					pressProceed();
				});
			});

			describe('which has a name field that', () => {
				let editor;
				beforeEach(() => {
					editor = panel.item.name;
					expect(editor).to.be.ok;
					expect(editor.editorModel).to.be.ok;
				});

				it('is initially the last component of the project directory', () => {
					expect(editor.editorModel.getText()).to.equal(libraryName);
					expect(editor.error).to.be.equal('');
				});

				it('can be set to a valid library name', () => {
					expectCanSetText(editor, libraryNameAlt);
				});

				it('when set to an invalid library name produces an error message', () => {
					editor.value = libraryNameBad;
					expect(editor.value).to.equal(libraryNameBad);
					expect(editor.error).to.contain('underscores');
				});
			});

			describe('which has a directory field that', () => {
				let editor;
				beforeEach(() => {
					editor = panel.item.directory;
					expect(editor).to.be.ok;
					expect(editor.editorModel).to.be.ok;
				});

				it('is initially the same as the project directory', () => {
					expect(editor.editorModel.getText()).to.equal(getProjectDirectory(atom));
					expect(editor.error).to.be.equal('');
				});

				it('can be set to a valid directory name', () => {
					const test = path.join(libraryDirectory, 'test');
					expectCanSetText(editor, test);
				});

				// todo - invalid filename?
			});


			describe('which has a version field that', () => {
				let editor;
				beforeEach(() => {
					editor = panel.item.version;
					expect(editor).to.be.ok;
					expect(editor.editorModel).to.be.ok;
				});

				it('is initially 0.0.1', () => {
					expect(editor.editorModel.getText()).to.equal('0.0.1');
					expect(editor.error).to.be.equal('');
				});

				it('can be set to a valid version', () => {
					expectCanSetText(editor, '0.0.2');
				});
			});

			describe('which has an author field that', () => {
				let editor;
				beforeEach(() => {
					editor = panel.item.author;
					expect(editor).to.be.ok;
					expect(editor.editorModel).to.be.ok;
				});

				it('is initially empty', () => {
					expect(editor.editorModel.getText()).to.equal('');
					expect(editor.error).to.be.equal('');
				});

				it('can be set to anything', () => {
					expectCanSetText(editor, 'Mr Big');
				});
			});

		});


	});
});

projectNotSelectedScope((context) => {

	describe('when "particle-dev-libraries:init" is run', () => {
		beforeEach(() => {
			runCommand('init');
		});

		it('displays a notification that no directory is selected', () => {
			expectNoDirectoryNotificationIsShown();
		});
	});


	describe('actual library init', () => {
		let directory;
		beforeEach(() => {
			directory = temp.mkdirSync();
		});

		afterEach(() => {
			temp.cleanupSync();
		});

		it('can initialize a new library in an empty folder', () => {
			const libSpec = { name: 'test', version: '1.2.3', directory, author: 'me' };
			const { libraryPerformInit } = require('../lib/library_init');
			return libraryPerformInit(atom, libSpec).then(() => {
				//expect(fs.existsSync('library.properties')).to.be.true;
			});
		});
	});
});
