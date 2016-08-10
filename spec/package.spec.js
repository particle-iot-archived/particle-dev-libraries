'use babel';

import {expect} from 'chai';
import {packageName} from '../lib/util/package-helper';

describe('given the package', () => {

	/**
	 * We need this to ensure the package is loaded from the default configuration directory.
	 * It's a bit leaky for a test, but is good enough for now.
	 * By default, the mocha test runner creates a clean atom installation using a temp folder as the
	 * atom config directory.
	 */
	beforeEach(() => {
		global.atom = global.buildAtomEnvironment({configDirPath: process.env.ATOM_HOME});
	});

	it('is installed', () => {
		const pkgs = atom.packages.getAvailablePackageNames();
		const name = packageName();
		expect(pkgs).to.include(name);
	});

	it('can be loaded', () => {
		return atom.packages.activatePackage(packageName());
	});
});
