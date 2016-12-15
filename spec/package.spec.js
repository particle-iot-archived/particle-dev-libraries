'use babel';

import chai, {expect} from 'chai';
import {packageName} from '../lib/util/package-helper';
chai.use(require('chai-as-promised'));


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

export function notificationsSame(n1, n2) {
	return n1 && n2 && n1.message===n2.message && n1.type===n2.type;
}

export function findNotification(expected, shouldExist=true, notifications) {
	if (notifications===undefined) {
		notifications = atom.notifications.getNotifications();
	}
	if (shouldExist) {
		expect(notifications.length).to.be.greaterThan(0, 'no notifications visible, expected at least one');
	}
	let matched = [];
	for (let idx in notifications) {
		if (notificationsSame(notifications[idx], expected)) {
			matched.push(notifications[idx]);
		}
	}
	return matched;
}

/**
 * Test helper that validates if the given notification exists or doesn't.
 * @param {Notification} expected   The notification to verify existence
 * @param {bool} shouldExist        `true` if the notification should exist, or `false` if it should not exist.
 */
export function expectNotification(expected, shouldExist=true) {
	const notifications = atom.notifications.getNotifications();

	const matched = findNotification(expected, shouldExist, notifications);
	const exists = matched.length > 0;
	if (exists !== shouldExist) {
		console.log(notifications, matched, expected);
		if (shouldExist) {
			expect(exists).to.be.equal(shouldExist, `expected notification to exist: ${expected.message}`);
		} else {
			expect(exists).to.be.equal(shouldExist, `expected notification to not exist: ${expected.message}`);
		}
	} else {
		expect(matched[0].message).to.be.deep.equal(expected.message);
	}
}



/**
 * A describe block with before/after code that maintains scope for running package tests:
 * - workspaceView is the atom workspace view
 *
 * @param {function(context)} tests a function that instantiates the mocha tests to run.
 * @param {object} context  The context.
 */
export function packageTestScope(tests, context={}) {
	describe('given the package', function doit() {
		this.timeout(30*1000);
		/**
		 * We need this to ensure the package is loaded from the default configuration directory.
		 * It's a bit leaky for a test, but is good enough for now.
		 * By default, the mocha test runner creates a clean atom installation using a temp folder as the
		 * atom config directory.
		 */
		beforeEach(() => {
			buildGlobalAtom();
			context.workspaceView = atom.views.getView(atom.workspace);
			expect(context.workspaceView).to.be.ok;
		});

		tests(context);

		afterEach(() => {
			context.workspaceView = null;
			delete global.atom;
		});

		/*
		 it('is installed', () => {
		 const pkgs = atom.packages.getAvailablePackageNames();
		 const name = packageName();
		 expect(pkgs).to.include(name);
		 });
		 */
	});
}


/**
 * Package-level tests.
 */
packageTestScope((context) => {
	it('can be loaded', function doit() {
		this.timeout(30000);
		activatePackage();
	});
});
