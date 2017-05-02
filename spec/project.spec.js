'use babel';

import { setCommandResultCallback } from '../lib/library';
import { expectNotification } from './package.spec';
import { commandTestScope } from './commands.spec';
import temp from 'temp';

export function projectSelectedScope(tests, context={}) {
	commandTestScope((context) => {
		describe('and a project directory is selected', () => {

			beforeEach(() => {
				context.projectDir = temp.mkdirSync();
				context.disposables = [];
				atom.project.setPaths([context.projectDir]);
				console.log('set directory to', context.projectDir);
			});

			afterEach(() => {
				temp.cleanupSync();
				setCommandResultCallback(undefined);

				for (let idx in context.disposables) {
					context.disposables[idx].dispose();
				}
			});

			tests(context);
		});
	}, context);
}

export function projectNotSelectedScope(tests, context={}) {
	commandTestScope((context) => {
		describe('given no project directory is selected', () => {
			beforeEach(() => {
				atom.project.setPaths([]);
			});

			tests(context);
		});
	}, context);
}

export function expectNoDirectoryNotificationIsShown() {
	const libModule = require('../lib/library');
	const expected = libModule.noProjectSelectedNotification();
	expectNotification(expected);
}

