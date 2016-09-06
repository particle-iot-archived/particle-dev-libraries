'use babel';

import {fetchPackageName} from '../../lib/util/package-helper';
import {expect} from 'chai';
import path from 'path';

describe('package-helper', () => {
	it('uses the default when the module cannot be loaded', () => {
		expect(fetchPackageName('doesnotexistmate', 'snoopy')).to.be.equal('snoopy');
	});

	it('ignores the default when the module is be loaded', () => {
		expect(fetchPackageName(path.join(__dirname, 'fixture/package-test.json'), 'snoopy')).to.be.equal('charlie-brown');
	});
});


