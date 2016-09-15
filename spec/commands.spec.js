'use babel';

import {activatePackage, deactivatePackage} from './package.spec';
import {packageTestScope} from './package.spec';


export function closeNotifications() {
	// might need this to clear the global state between test failures
}

/**
 * A test scope that builds upo packageTestScope() to provide
 * - Activates the profiles package so that a Particle-api-js client can be created.
 *
 * @param {function(context}} tests  The function factory to create the tests
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
