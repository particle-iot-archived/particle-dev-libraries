'use babel';

import {projectNotSelectedScope} from './project.spec';
import {projectSelectedScope} from './project.spec';
import {expect} from 'chai';
import sinon from 'sinon';
import path from 'path';
import {setCommandResultPromise} from '../lib/library';

projectSelectedScope((context) => {

	function libraryPropertiesExists() {
		const fs = require('fs');
		const path = require('path');
		return fs.existsSync(path.join(context.projectDir, 'library.properties'));
	}

	describe('when "particle-dev-libraries:init" is run', () => {
		let libraryDirectory;
		const libraryName = 'myfablib';
		let after = Promise.resolve();


		function runLibraryInit(then) {
			const library = require('../lib/library');
			library.setCommandResultPromise(then);
			atom.commands.dispatch(context.workspaceView, context.commandPrefix + ':init');
			return then;
		}

		beforeEach(() => {
			libraryDirectory = path.join(context.projectDir, libraryName);
		});



		describe('then a dialogue appears with fields for defining a new library', () => {

			beforeEach(() => {
				runLibraryInit();
			});

			afterEach(() => {
				const libraryInit = require('../lib/library_init');
				const stillOpen = libraryInit.findLibraryInitPanel();
				if (stillOpen) {
					stillOpen.item.close();
				}
				expect(libraryInit.findLibraryInitPanel()).to.be.undefined;
			});

			it('can be retrieved', () => {
				const libraryInit = require('../lib/library_init');
				expect(libraryInit.findLibraryInitPanel()).to.be.ok;
			});

			describe('which has a name field that', () => {
				it('is initially the last component of the project directory', () => {

				});

				it('can be set to a valid library name', () => {

				});

				it('can be set to an invalid library name, producing an error message', () => {

				});
			});

		});

	});
});
