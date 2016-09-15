import {findPanelWithClass} from '../lib/views';
import {expect} from 'chai';

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
