import {findPanelWithClass} from '../lib/views';
import {expect} from 'chai';
import {removeTrailingSlash} from '../lib/views';

describe('finding views', () => {
	function buildPanel(className) {
		return {
			getItem: () => {
				return {
					hasClass: (cls) => { return cls===className; }
				}
			}};
	}

	const panels = [
		buildPanel('classB'),
		buildPanel('classA')
	];

	it('can find a view with a given class in a list of panels', () => {
		expect(findPanelWithClass(panels, 'classB')).to.be.deep.equal(panels[0]);
		expect(findPanelWithClass(panels, 'classA')).to.be.deep.equal(panels[1]);
		expect(findPanelWithClass(panels, 'classa')).to.be.undefined;
	});

	it('does not find a view when the list is empty', () => {
		expect(findPanelWithClass([], 'abcd')).to.be.undefined;
	});
});


describe('removeTrailingSlash', () => {

	const data = [
		['/a', '/a'],
		['/a/', '/a'],
		['/a/b/c/', '/a/b/c'],
		['/', '/'],
		['//', '/'],
		['/1/2/3/html.txt', '/1/2/3/html.txt']
	];

	function back(value) {
		return value.replace(/\//g,'\\');
	}

	data.forEach((item) => {
		it(item[0], () => {
			expect(removeTrailingSlash(item[0])).to.be.equal(item[1]);
		});

		const original = back(item[0]);
		const expected = back(item[1]);

		it(original, () => {
			expect(removeTrailingSlash(original)).to.be.equal(expected);
		});

	});
});