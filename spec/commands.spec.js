'use babel';

import {activatePackage, deactivatePackage} from './package.spec';
import {packageTestScope} from './package.spec';
import {setCommandResultCallback} from '../lib/library';
import {packageName} from '../lib/util/package-helper';
import {getLastRunCommandPromise} from '../lib/library';


export function closeNotifications() {
	// might need this to clear the global state between test failures
}

export function runCommand(name, then) {
	const commandPrefix = packageName();
	if (then!==undefined) {
		setCommandResultCallback(then);
	}
	const command = commandPrefix + ':' + name;
	const workspaceView = atom.views.getView(atom.workspace);
	console.log('running atom command', command);
	atom.commands.dispatch(workspaceView, command);
	return then ? getLastRunCommandPromise() : undefined;
}


/**
 * A test scope that builds upon packageTestScope() to provide a scope for testing commands.
 * Activates the profiles package so that a Particle-api-js client can be created.
 *
 * @param {function} tests  The function factory to create the tests
 * @param {object} context  The context for the tests.
 */
export function commandTestScope(tests, context) {
	packageTestScope((context) => {
		describe('commands', () => {
			beforeEach(() => {
				//const notificationContainer = workspaceElement.querySelector('atom-notifications');
				atom.packages.activatePackage('particle-dev-profiles');
				return activatePackage();
			});

			tests(context);

			afterEach(() => {
				closeNotifications();
				deactivatePackage();
			});
		});
	}, context);
}
