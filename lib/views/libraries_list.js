'use babel';
/** @jsx etch.dom */

import etch from 'etch'
import {LibraryCard} from './library_card';

export class LibrariesListView {
	constructor(props, children) {
		this.props = props;
		etch.initialize(this);
	}

	render() {
		if (!this.props || !this.props.libs) {
			return <progress className='inline-block' />
		} else {
			return <ul>
				{this.props.libs.map((lib) => {
					return <LibraryCard lib={lib} />
				})}
				{!this.props.libs.length ?
					<h4>No libraries found</h4>: ''}
			</ul>
		}
	}

	update(props, children) {
		this.props = props;
		return etch.update(this);
	}

	async destroy() {
		await etch.destroy(this);
	}
}
